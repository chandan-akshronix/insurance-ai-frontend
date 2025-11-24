from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from datetime import date
import os
import uuid
import logging
import traceback
import schemas, models, crud
from database import get_db
from azure_storage import azure_storage
from typing import Optional

router = APIRouter(prefix="/documents", tags=["Documents"])

logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    userId: int = Form(...),
    policyId: Optional[int] = Form(None),
    documentType: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Upload a document to Azure Blob Storage and save metadata to database
    """
    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)

        # Determine folder based on document type
        folder_map = {
            "policy_document": "policies",
            "claim_document": "claims",
            "kyc_document": "kyc",
            "other": "documents"
        }
        folder = folder_map.get(documentType, "documents")

        # Upload to Azure Blob Storage if configured, otherwise save locally to ./uploads
        if getattr(azure_storage, 'blob_service_client', None):
            try:
                blob_url = azure_storage.upload_file(
                    file_content=file_content,
                    file_name=file.filename,
                    folder=folder
                )
            except Exception:
                logger.exception('Azure upload failed')
                raise
        else:
            # fallback local save
            uploads_dir = os.path.join(os.getcwd(), 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            # use unique filename
            ext = os.path.splitext(file.filename)[1]
            unique_name = f"{uuid.uuid4()}{ext}"
            # optional folder segregation
            dest_folder = os.path.join(uploads_dir, folder)
            os.makedirs(dest_folder, exist_ok=True)
            dest_path = os.path.join(dest_folder, unique_name)
            with open(dest_path, 'wb') as fh:
                fh.write(file_content)
            # Use request.base_url to construct accessible URL
            blob_url = str(request.base_url) + f"uploads/{folder}/{unique_name}"
        
        # Create document record in database
        document_data = schemas.DocumentCreate(
            userId=userId,
            policyId=policyId,
            documentType=documentType,
            documentUrl=blob_url,
            uploadDate=date.today(),
            fileSize=file_size
        )
        
        document_id = crud.create_entry(db, models.Documents, document_data, return_id=True)

        return {
            "success": True,
            "documentId": document_id,
            "fileName": file.filename,
            "fileUrl": blob_url,
            "fileSize": file_size,
            "message": "Document uploaded successfully"
        }
    
    except Exception as e:
        # Log full traceback for debugging
        tb = traceback.format_exc()
        logger.error('Error in /documents/upload: %s\nTraceback:\n%s', str(e), tb)
        raise HTTPException(status_code=500, detail="Error uploading document. See server logs for details.")

@router.post("/")
def create_document(document: schemas.DocumentCreate, db: Session = Depends(get_db)):
    """
    Create a document record (when file is already uploaded)
    """
    document_id = crud.create_entry(db, models.Documents, document, return_id=True)
    return {
        "success": True,
        "documentId": document_id,
        "message": "Document created successfully"
    }

@router.get("/", response_model=list[schemas.Document])
def read_documents(db: Session = Depends(get_db)):
    documents = crud.get_all(db, models.Documents)
    return [{"documentId": d.id,
             "userId": d.userId,
             "policyId": d.policyId,
             "documentType": d.documentType,
             "documentUrl": d.documentUrl,
             "uploadDate": d.uploadDate,
             "fileSize": d.fileSize} for d in documents]

@router.get("/user/{user_id}", response_model=list[schemas.Document])
def get_documents_by_user(user_id: int, db: Session = Depends(get_db)):
    documents = crud.get_documents_by_user(db, user_id)
    return [{"documentId": d.id,
             "userId": d.userId,
             "policyId": d.policyId,
             "documentType": d.documentType,
             "documentUrl": d.documentUrl,
             "uploadDate": d.uploadDate,
             "fileSize": d.fileSize} for d in documents]

@router.get("/policy/{policy_id}", response_model=list[schemas.Document])
def get_documents_by_policy(policy_id: int, db: Session = Depends(get_db)):
    documents = crud.get_documents_by_policy(db, policy_id)
    return [{"documentId": d.id,
             "userId": d.userId,
             "policyId": d.policyId,
             "documentType": d.documentType,
             "documentUrl": d.documentUrl,
             "uploadDate": d.uploadDate,
             "fileSize": d.fileSize} for d in documents]

@router.get("/{document_id}", response_model=schemas.Document)
def read_document(document_id: int, db: Session = Depends(get_db)):
    document = crud.get_by_id(db, models.Documents, "id", document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "documentId": document.id,
        "userId": document.userId,
        "policyId": document.policyId,
        "documentType": document.documentType,
        "documentUrl": document.documentUrl,
        "uploadDate": document.uploadDate,
        "fileSize": document.fileSize
    }

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    """
    Delete a document from database and Azure Blob Storage
    """
    document = crud.get_by_id(db, models.Documents, "id", document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    try:
        # Extract blob name from URL
        # Azure blob URL format: https://accountname.blob.core.windows.net/container/blobname
        blob_url = document.documentUrl
        blob_name = blob_url.split('/')[-1]  # Get the last part of URL
        
        # Delete from Azure Blob Storage
        azure_storage.delete_file(blob_name)
        
        # Delete from database
        success = crud.delete_by_id(db, models.Documents, "id", document_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"message": "Document deleted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting document: {str(e)}")

