# azure_storage.py
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
import os
from dotenv import load_dotenv
from typing import Optional
import uuid
from datetime import datetime

load_dotenv()

class AzureStorageService:
    """Service for handling Azure Blob Storage operations"""
    
    def __init__(self):
        self.connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.account_name = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
        self.account_key = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")
        self.container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "insurance-documents")
        
        if not self.connection_string:
            raise ValueError("AZURE_STORAGE_CONNECTION_STRING environment variable is not set")
        
        # Initialize BlobServiceClient
        self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
        
        # Ensure container exists
        self._ensure_container_exists()
    
    def _ensure_container_exists(self):
        """Create container if it doesn't exist"""
        try:
            container_client = self.blob_service_client.get_container_client(self.container_name)
            if not container_client.exists():
                container_client.create_container()
                print(f"Container '{self.container_name}' created successfully")
        except Exception as e:
            print(f"Error ensuring container exists: {e}")
            raise
    
    def upload_file(self, file_content: bytes, file_name: str, folder: Optional[str] = None) -> str:
        """
        Upload a file to Azure Blob Storage
        
        Args:
            file_content: File content as bytes
            file_name: Original file name
            folder: Optional folder path (e.g., 'policies', 'claims', 'documents')
        
        Returns:
            Blob URL of the uploaded file
        """
        try:
            # Generate unique file name to avoid conflicts
            file_extension = os.path.splitext(file_name)[1]
            unique_file_name = f"{uuid.uuid4()}{file_extension}"
            
            # Construct blob path
            if folder:
                blob_name = f"{folder}/{unique_file_name}"
            else:
                blob_name = unique_file_name
            
            # Get blob client
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            # Upload file
            blob_client.upload_blob(file_content, overwrite=True)
            
            # Return blob URL
            blob_url = blob_client.url
            return blob_url
        
        except Exception as e:
            print(f"Error uploading file to Azure Storage: {e}")
            raise
    
    def download_file(self, blob_name: str) -> bytes:
        """
        Download a file from Azure Blob Storage
        
        Args:
            blob_name: Name of the blob to download
        
        Returns:
            File content as bytes
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            if not blob_client.exists():
                raise FileNotFoundError(f"Blob '{blob_name}' does not exist")
            
            # Download file
            download_stream = blob_client.download_blob()
            file_content = download_stream.readall()
            
            return file_content
        
        except Exception as e:
            print(f"Error downloading file from Azure Storage: {e}")
            raise
    
    def delete_file(self, blob_name: str) -> bool:
        """
        Delete a file from Azure Blob Storage
        
        Args:
            blob_name: Name of the blob to delete
        
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=blob_name
            )
            
            if not blob_client.exists():
                return False
            
            # Delete blob
            blob_client.delete_blob()
            return True
        
        except Exception as e:
            print(f"Error deleting file from Azure Storage: {e}")
            return False
    
    def get_file_url(self, blob_name: str) -> str:
        """
        Get the URL of a file in Azure Blob Storage
        
        Args:
            blob_name: Name of the blob
        
        Returns:
            Blob URL
        """
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name,
            blob=blob_name
        )
        return blob_client.url
    
    def list_files(self, folder: Optional[str] = None, prefix: Optional[str] = None) -> list:
        """
        List files in Azure Blob Storage
        
        Args:
            folder: Optional folder path
            prefix: Optional prefix to filter files
        
        Returns:
            List of blob names
        """
        try:
            container_client = self.blob_service_client.get_container_client(self.container_name)
            
            # Construct prefix
            if folder and prefix:
                search_prefix = f"{folder}/{prefix}"
            elif folder:
                search_prefix = f"{folder}/"
            elif prefix:
                search_prefix = prefix
            else:
                search_prefix = None
            
            # List blobs
            blobs = container_client.list_blobs(name_starts_with=search_prefix)
            return [blob.name for blob in blobs]
        
        except Exception as e:
            print(f"Error listing files from Azure Storage: {e}")
            return []

# Initialize Azure Storage Service
azure_storage = AzureStorageService()

