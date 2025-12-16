from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas, crud
from datetime import datetime
import requests
import os

AGENT_SERVER_URL = os.getenv("AGENT_SERVER_URL", "http://127.0.0.1:8001")


router = APIRouter(
    prefix="/agent",
    tags=["Agent Integration"],
    responses={404: {"description": "Not found"}},
)

@router.post("/sync", response_model=schemas.ApplicationProcess)
def sync_agent_state(process: schemas.ApplicationProcessCreate, db: Session = Depends(get_db)):
    """
    Called by the Agent to create or update the application process state.
    """
    # Check if exists
    db_process = crud.get_application_process(db, process.applicationId)
    if db_process:
        # Update existing
        # We need to compute values to update. 
        # Note: 'process' is ApplicationProcessCreate, which might have different fields than Update
        # But here we treat it as an upsert payload suitable for both.
        
        update_data = process.model_dump(exclude_unset=True)
        update_data["lastUpdated"] = datetime.now().date()
        
        return crud.update_by_id(db, models.ApplicationProcess, "id", db_process.id, update_data)
    else:
        # Create new
        # Set lastUpdated same as startTime if not provided
        if not process.lastUpdated:
            process_dict = process.model_dump()
            process_dict["lastUpdated"] = datetime.now().date()
            # If generated from Pydantic model it might be simpler
            process = schemas.ApplicationProcessCreate(**process_dict)
            
        return crud.create_entry(db, models.ApplicationProcess, process)

@router.get("/applications", response_model=List[schemas.ApplicationProcess])
def get_applications(status: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Get list of application processes. Used by Admin Panel AI Process Flow.
    """
    return crud.list_application_processes(db, status)

@router.get("/application/{application_id}", response_model=schemas.ApplicationProcess)
def get_application(application_id: str, db: Session = Depends(get_db)):
    """
    Get detailed application process. Used by Admin Panel Case Details.
    """
    process = crud.get_application_process(db, application_id)
    if not process:
        raise HTTPException(status_code=404, detail="Application process not found")
    return process

@router.post("/review")
def submit_review_decision(
    application_id: str = Body(...), 
    action: str = Body(..., regex="^(approve|reject|request_docs|escalate)$"), 
    reason: Optional[str] = Body(None),
    db: Session = Depends(get_db)
):
    """
    Submit a human review decision. Updates the DB status and should trigger Agent resume.
    """
    process = crud.get_application_process(db, application_id)
    if not process:
        raise HTTPException(status_code=404, detail="Application process not found")
    
    # Update DB based on action
    update_data = {"lastUpdated": datetime.now().date(), "reviewReason": reason}
    
    if action == "approve":
        update_data["status"] = "approved" # Or 'processing' if it goes back to agent
        # TODO: Trigger Agent Resume (Webhook to Agent Server)
    elif action == "reject":
        update_data["status"] = "rejected"
    elif action == "request_docs":
        update_data["status"] = "ask_for_document"
    elif action == "escalate":
        update_data["status"] = "escalate_to_senior"
        
    crud.update_by_id(db, models.ApplicationProcess, "id", process.id, update_data)
    
    # Trigger Agent Resume for ALL decisions (Approve, Reject, Escalate, Docs)
    try:
        # Map action to Agent's expected format
        # Agent expects: "approve", "reject", "override", "escalate", "request_docs"
        agent_action = action
        
        payload = {
            "application_id": application_id,
            "action": agent_action,
            "override_notes": reason
        }
        # Fire and forget (or log error)
        # We use a short timeout to not block the admin 
        requests.post(f"{AGENT_SERVER_URL}/approve", json=payload, timeout=5)
    except Exception as e:
        print(f"❌ Error resuming agent workflow at {AGENT_SERVER_URL}: {e}")
    
    return {"message": f"Review action '{action}' submitted successfully", "application_id": application_id}

