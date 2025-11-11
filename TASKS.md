# Insurance AI Management System - Focused Task List

## 📋 Overview

This document focuses on core functionality to make the UI and backend work together. Authentication is skipped for now. We'll use PostgreSQL database and ensure all API endpoints are properly created and integrated with the frontend.

---

## 🎯 Priority Tasks

### 1. **Database Setup (PostgreSQL)**
### 2. **Database Schema Fixes**
### 3. **Enhanced CRUD Operations**
### 4. **API Endpoint Creation**
### 5. **Frontend-Backend Integration**
### 6. **Remove Hardcoded Data**

---

## 📝 Detailed Tasks

## Task 1: PostgreSQL Database Setup

### 1.1 Update Database Configuration
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/database.py`

**Changes Needed**:
- [ ] Replace SQLite with PostgreSQL connection
- [ ] Add environment variable support for database URL
- [ ] Update engine configuration for PostgreSQL

**Implementation**:
```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL Database URL from environment variables
# Format: postgresql://username:password@localhost:5432/database_name
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/insurance_db"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 1.2 Create Environment File
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/.env` (NEW FILE)

**Changes Needed**:
- [ ] Create .env file with database configuration
- [ ] Add database URL
- [ ] Add other environment variables

**Implementation**:
```env
# .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/insurance_db
API_HOST=0.0.0.0
API_PORT=8000
```

### 1.3 Install Required Packages
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/requirements.txt` (NEW FILE)

**Changes Needed**:
- [ ] Create requirements.txt file
- [ ] Add all required dependencies

**Implementation**:
```txt
# requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
python-dotenv==1.0.0
python-multipart==0.0.6
```

### 1.4 Create Database
**Action Required**:
- [ ] Install PostgreSQL on your system
- [ ] Create database: `CREATE DATABASE insurance_db;`
- [ ] Verify connection

---

## Task 2: Database Schema Fixes

### 2.1 Fix Policy Model - Add userId
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/models.py`

**Changes Needed**:
- [ ] Add `userId` field to Policy model
- [ ] Add foreign key relationship to User
- [ ] Make userId required (nullable=False)

**Implementation**:
```python
# In models.py, update Policy class:
class Policy(Base):
    __tablename__ = "policy"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)  # ADD THIS LINE
    type = Column(SqlEnum(PolicyType))
    planName = Column(String)
    policyNumber = Column(String, unique=True, index=True)
    coverage = Column(Float)
    premium = Column(Float)
    status = Column(String)
    startDate = Column(Date)
    expiryDate = Column(Date)
    benefits = Column(JSON, nullable=True)  
    nominee = Column(String, nullable=True)
    nomineeId = Column(Integer, ForeignKey("nominees.id"), nullable=True)
    personalDetails = Column(JSON, nullable=False)
    policyDocument = Column(String, nullable=True)
```

### 2.2 Fix PolicyPurchase Model - Add userId
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/models.py`

**Changes Needed**:
- [ ] Add `userId` field to PolicyPurchase model
- [ ] Add foreign key relationship to User

**Implementation**:
```python
# In models.py, update PolicyPurchase class:
class PolicyPurchase(Base):
    __tablename__ = "policy_purchase"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)  # ADD THIS LINE
    type = Column(SqlEnum(PolicyType))
    planName = Column(String)
    coverage = Column(Float)
    premium = Column(Float)
    tenure = Column(Integer)
    nominee = Column(String, nullable=True)
    nomineeId = Column(Integer, ForeignKey("nominees.id"), nullable=True)
    personalDetails = Column(JSON, nullable=False)
    policyNumber = Column(String, unique=True, index=True)
```

### 2.3 Fix Notification Model - Add userId
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/models.py`

**Changes Needed**:
- [ ] Add `userId` field to Notification model
- [ ] Add foreign key relationship to User

**Implementation**:
```python
# In models.py, update Notification class:
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.id"), nullable=False)  # ADD THIS LINE
    message = Column(String)
    time = Column(Date)
    type = Column(SqlEnum(NotificationTypes))
    read = Column(Boolean, default=False)
    policyId = Column(Integer, ForeignKey("policy.id"), nullable=True)
```

### 2.4 Fix Payments Model - Add userId
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/models.py`

**Changes Needed**:
- [ ] Add `userId` field to Payments model (optional, can get from policy)
- [ ] This is optional since we can get userId from policy

**Note**: This is optional since userId can be retrieved through the policy relationship.

### 2.5 Update Schemas
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/schemas.py`

**Changes Needed**:
- [ ] Add `userId` to PolicyCreate schema
- [ ] Add `userId` to PolicyPurchaseCreate schema
- [ ] Add `userId` to NotificationCreate schema

**Implementation**:
```python
# In schemas.py, update PolicyCreate:
class PolicyCreate(PolicyBase):
    userId: int  # ADD THIS
    pass

# Update PolicyPurchaseCreate:
class PolicyPurchaseCreate(BaseModel):
    userId: int  # ADD THIS
    type: PolicyType
    planName: str
    coverage: float
    premium: float
    tenure: int
    nominee: Optional[str] = None
    nomineeId: Optional[int] = None
    personalDetails: Optional[PersonalDetails] = None
    policyNumber: str

# Update NotificationCreate:
class NotificationCreate(NotificationBase):
    userId: int  # ADD THIS
    pass
```

---

## Task 3: Enhanced CRUD Operations

### 3.1 Create Model-Specific CRUD Operations
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/crud.py`

**Changes Needed**:
- [ ] Keep existing generic CRUD operations
- [ ] Add model-specific CRUD operations
- [ ] Add relationship queries
- [ ] Add filtering and pagination support

**Implementation**:
```python
# crud.py
from sqlalchemy.orm import Session
from sqlalchemy import func
import models, schemas
from typing import List, Optional

# Keep existing generic functions
def create_entry(db: Session, model, data, return_id=False):
    # ... existing code ...
    pass

def get_all(db: Session, model):
    # ... existing code ...
    pass

def get_by_id(db: Session, model, id_field: str, id_value: int):
    # ... existing code ...
    pass

def delete_by_id(db: Session, model, id_field: str, id_value: int):
    # ... existing code ...
    pass

def update_by_id(db: Session, model, id_field: str, id_value: int, data):
    # ... existing code ...
    pass

# Add new model-specific functions:

# User-specific queries
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_phone(db: Session, phone: str):
    return db.query(models.User).filter(models.User.phone == phone).first()

# Policy-specific queries
def get_policies_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Policy).filter(models.Policy.userId == user_id).offset(skip).limit(limit).all()

def get_policies_by_type(db: Session, policy_type: str, skip: int = 0, limit: int = 100):
    return db.query(models.Policy).filter(models.Policy.type == policy_type).offset(skip).limit(limit).all()

def get_policy_by_number(db: Session, policy_number: str):
    return db.query(models.Policy).filter(models.Policy.policyNumber == policy_number).first()

# Claim-specific queries
def get_claims_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Claim).filter(models.Claim.userId == user_id).offset(skip).limit(limit).all()

def get_claims_by_policy(db: Session, policy_id: int):
    return db.query(models.Claim).filter(models.Claim.policyId == policy_id).all()

def get_claims_by_status(db: Session, status: str, skip: int = 0, limit: int = 100):
    return db.query(models.Claim).filter(models.Claim.status == status).offset(skip).limit(limit).all()

# Document-specific queries
def get_documents_by_user(db: Session, user_id: int):
    return db.query(models.Documents).filter(models.Documents.userId == user_id).all()

def get_documents_by_policy(db: Session, policy_id: int):
    return db.query(models.Documents).filter(models.Documents.policyId == policy_id).all()

# Activity-specific queries
def get_activities_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Activities).filter(models.Activities.userId == user_id).offset(skip).limit(limit).all()

def get_activities_by_type(db: Session, activity_type: str, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Activities).filter(
        models.Activities.userId == user_id,
        models.Activities.type == activity_type
    ).offset(skip).limit(limit).all()

# Notification-specific queries
def get_notifications_by_user(db: Session, user_id: int, unread_only: bool = False):
    query = db.query(models.Notification).filter(models.Notification.userId == user_id)
    if unread_only:
        query = query.filter(models.Notification.read == False)
    return query.all()

def mark_notification_as_read(db: Session, notification_id: int, user_id: int):
    notification = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.userId == user_id
    ).first()
    if notification:
        notification.read = True
        db.commit()
        db.refresh(notification)
        return notification
    return None

# Payment-specific queries
def get_payments_by_policy(db: Session, policy_id: int):
    return db.query(models.Payments).filter(models.Payments.policyId == policy_id).all()

def get_payments_by_user(db: Session, user_id: int):
    # Get payments through policies
    return db.query(models.Payments).join(models.Policy).filter(models.Policy.userId == user_id).all()

# Nominee-specific queries
def get_nominees_by_user(db: Session, user_id: int):
    return db.query(models.Nominee).filter(models.Nominee.userId == user_id).all()

def get_nominees_by_policy(db: Session, policy_id: int):
    return db.query(models.Nominee).filter(models.Nominee.policyId == policy_id).all()

# Product-specific queries
def get_products_by_category(db: Session, category: str):
    return db.query(models.Product).filter(models.Product.category == category).all()
```

---

## Task 4: Update API Routers

### 4.1 Update Users Router
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/routers/users.py`

**Changes Needed**:
- [ ] Add endpoint to get user by email
- [ ] Add endpoint to get user by phone
- [ ] Update create user to handle duplicates better
- [ ] Add endpoint to get user policies
- [ ] Add endpoint to get user claims
- [ ] Add endpoint to get user activities
- [ ] Add endpoint to get user notifications

**Implementation**:
```python
# routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import schemas, models, crud
from database import SessionLocal, get_db

router = APIRouter(prefix="/users", tags=["Users"])

# Keep existing endpoints and add new ones:

@router.get("/email/{email}", response_model=schemas.User)
def get_user_by_email(email: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/phone/{phone}", response_model=schemas.User)
def get_user_by_phone(phone: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, phone)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{user_id}/policies", response_model=list[schemas.Policy])
def get_user_policies(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    policies = crud.get_policies_by_user(db, user_id, skip, limit)
    return policies

@router.get("/{user_id}/claims", response_model=list[schemas.Claim])
def get_user_claims(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    claims = crud.get_claims_by_user(db, user_id, skip, limit)
    return claims

@router.get("/{user_id}/activities", response_model=list[schemas.Activity])
def get_user_activities(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    activities = crud.get_activities_by_user(db, user_id, skip, limit)
    return activities

@router.get("/{user_id}/notifications", response_model=list[schemas.Notification])
def get_user_notifications(user_id: int, unread_only: bool = False, db: Session = Depends(get_db)):
    notifications = crud.get_notifications_by_user(db, user_id, unread_only)
    return notifications
```

### 4.2 Update Policy Router
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/routers/policy.py`

**Changes Needed**:
- [ ] Update create policy to include userId
- [ ] Add endpoint to get policies by user
- [ ] Add endpoint to get policies by type
- [ ] Add endpoint to get policy by policy number
- [ ] Add pagination to list endpoints
- [ ] Fix policy purchase endpoint

**Implementation**:
```python
# routers/policy.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, crud
from database import SessionLocal, get_db
from datetime import datetime
import random, string

router = APIRouter(prefix="/policy", tags=["Policy"])

# Update create_policy to handle userId:
@router.post("/")
def create_policy(policy: schemas.PolicyCreate, db: Session = Depends(get_db)):
    policy_id = crud.create_entry(db, models.Policy, policy, return_id=True)
    policy_obj = crud.get_by_id(db, models.Policy, "id", policy_id)
    return {
        "id": policy_obj.id,
        "userId": policy_obj.userId,
        "type": policy_obj.type,
        "planName": policy_obj.planName,
        "policyNumber": policy_obj.policyNumber,
        "coverage": policy_obj.coverage,
        "premium": policy_obj.premium,
        "status": policy_obj.status,
        "startDate": policy_obj.startDate,
        "expiryDate": policy_obj.expiryDate,
        "benefits": policy_obj.benefits,
        "nominee": policy_obj.nominee,
        "nomineeId": policy_obj.nomineeId,
        "policyDocument": policy_obj.policyDocument,
    }

# Add new endpoints:
@router.get("/user/{user_id}", response_model=list[schemas.Policy])
def get_policies_by_user(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    policies = crud.get_policies_by_user(db, user_id, skip, limit)
    return policies

@router.get("/type/{policy_type}", response_model=list[schemas.Policy])
def get_policies_by_type(policy_type: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    policies = crud.get_policies_by_type(db, policy_type, skip, limit)
    return policies

@router.get("/number/{policy_number}", response_model=schemas.Policy)
def get_policy_by_number(policy_number: str, db: Session = Depends(get_db)):
    policy = crud.get_policy_by_number(db, policy_number)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy

# Update purchase_policy to include userId:
@router.post("/purchase")
def purchase_policy(policy: schemas.PolicyPurchaseCreate, db: Session = Depends(get_db)):
    # Generate unique policy number
    policy_number = "POL" + datetime.now().strftime("%Y%m%d%H%M%S") + ''.join(random.choices(string.digits, k=4))
    
    # Prepare data for insertion
    policy_data = {
        "userId": policy.userId,  # ADD THIS
        "type": policy.type,
        "planName": policy.planName,
        "coverage": policy.coverage,
        "premium": policy.premium,
        "tenure": policy.tenure,
        "nominee": policy.nominee,
        "nomineeId": policy.nomineeId,
        "personalDetails": policy.personalDetails.dict() if policy.personalDetails else {},
        "policyNumber": policy_number
    }
    
    try:
        policy_id = crud.create_entry(db, models.PolicyPurchase, schemas.PolicyPurchaseCreate(**policy_data), return_id=True)
        return {
            "success": True,
            "policyId": policy_id,
            "policyNumber": policy_number,
            "message": "Policy purchased successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error purchasing policy: {str(e)}")
```

### 4.3 Update Claims Router
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/routers/claims.py`

**Changes Needed**:
- [ ] Add endpoint to get claims by user
- [ ] Add endpoint to get claims by policy
- [ ] Add endpoint to filter claims by status
- [ ] Add pagination to list endpoints

**Implementation**:
```python
# routers/claims.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, crud
from database import SessionLocal, get_db

router = APIRouter(prefix="/claims", tags=["Claims"])

# Add new endpoints:
@router.get("/user/{user_id}", response_model=list[schemas.Claim])
def get_claims_by_user(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    claims = crud.get_claims_by_user(db, user_id, skip, limit)
    return claims

@router.get("/policy/{policy_id}", response_model=list[schemas.Claim])
def get_claims_by_policy(policy_id: int, db: Session = Depends(get_db)):
    claims = crud.get_claims_by_policy(db, policy_id)
    return claims

@router.get("/status/{status}", response_model=list[schemas.Claim])
def get_claims_by_status(status: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    claims = crud.get_claims_by_status(db, status, skip, limit)
    return claims

# Update existing list endpoint to include pagination:
@router.get("/", response_model=list[schemas.Claim])
def read_claims(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Claim).offset(skip).limit(limit).all()
```

### 4.4 Update Activities Router
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/routers/activities.py`

**Changes Needed**:
- [ ] Fix model reference (should be `models.Activities` not `models.activities`)
- [ ] Add endpoint to get activities by user
- [ ] Add endpoint to filter activities by type
- [ ] Add pagination to list endpoints

**Implementation**:
```python
# routers/activities.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, crud
from database import SessionLocal, get_db

router = APIRouter(prefix="/activities", tags=["Activities"])

# Fix create_activity endpoint:
@router.post("/")
def create_activity(activity: schemas.ActivityCreate, db: Session = Depends(get_db)):
    activity_id = crud.create_entry(db, models.Activities, activity, return_id=True)  # Fix: models.Activities
    return {
        "success": True,
        "message": "Activity created successfully",
        "activity_id": activity_id.id
    }

# Add new endpoints:
@router.get("/user/{user_id}", response_model=list[schemas.Activity])
def get_activities_by_user(user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    activities = crud.get_activities_by_user(db, user_id, skip, limit)
    return activities

@router.get("/user/{user_id}/type/{activity_type}", response_model=list[schemas.Activity])
def get_activities_by_type(user_id: int, activity_type: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    activities = crud.get_activities_by_type(db, activity_type, user_id, skip, limit)
    return activities

# Update list endpoint:
@router.get("/", response_model=list[schemas.Activity])
def read_activities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Activities).offset(skip).limit(limit).all()
```

### 4.5 Update Notifications Router
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/routers/notifications.py`

**Changes Needed**:
- [ ] Fix model reference (should be `models.Notification` not `models.notifications`)
- [ ] Add endpoint to get notifications by user
- [ ] Add endpoint to mark notification as read
- [ ] Add endpoint to mark all notifications as read
- [ ] Update create notification to include userId

**Implementation**:
```python
# routers/notifications.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, crud
from database import SessionLocal, get_db

router = APIRouter(prefix="/notifications", tags=["Notifications"])

# Fix create_notification endpoint:
@router.post("/")
def create_notification(notification: schemas.NotificationCreate, db: Session = Depends(get_db)):
    notification_id = crud.create_entry(db, models.Notification, notification, return_id=True)  # Fix: models.Notification
    return {
        "id": notification_id.id,
        "userId": notification_id.userId,
        "message": notification_id.message,
        "time": notification_id.time,
        "type": notification_id.type,
        "read": notification_id.read,
        "policyId": notification_id.policyId,
    }

# Add new endpoints:
@router.get("/user/{user_id}", response_model=list[schemas.Notification])
def get_notifications_by_user(user_id: int, unread_only: bool = False, db: Session = Depends(get_db)):
    notifications = crud.get_notifications_by_user(db, user_id, unread_only)
    return notifications

@router.put("/{notification_id}/read")
def mark_notification_as_read(notification_id: int, user_id: int, db: Session = Depends(get_db)):
    notification = crud.mark_notification_as_read(db, notification_id, user_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True, "message": "Notification marked as read"}

@router.put("/user/{user_id}/read-all")
def mark_all_notifications_as_read(user_id: int, db: Session = Depends(get_db)):
    notifications = db.query(models.Notification).filter(
        models.Notification.userId == user_id,
        models.Notification.read == False
    ).all()
    for notification in notifications:
        notification.read = True
    db.commit()
    return {"success": True, "message": f"{len(notifications)} notifications marked as read"}
```

### 4.6 Update Payments Router
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/routers/payments.py`

**Changes Needed**:
- [ ] Fix model reference (should be `models.Payments` not `models.Payment`)
- [ ] Add endpoint to get payments by user
- [ ] Add endpoint to get payments by policy
- [ ] Add endpoint to get payment history

**Implementation**:
```python
# routers/payments.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, crud
from database import SessionLocal, get_db

router = APIRouter(prefix="/payments", tags=["Payments"])

# Fix create_payment endpoint:
@router.post("/")
def create_payment(payment: schemas.PaymentCreate, db: Session = Depends(get_db)):
    payment_id = crud.create_entry(db, models.Payments, payment, return_id=True)  # Fix: models.Payments
    return {
        "success": True,
        "paymentId": payment_id.id,
        "orderId": payment_id.orderId,
        "amount": payment_id.amount,
        "paymentUrl": payment_id.paymentUrl
    }

# Add new endpoints:
@router.get("/policy/{policy_id}", response_model=list[schemas.Payment])
def get_payments_by_policy(policy_id: int, db: Session = Depends(get_db)):
    payments = crud.get_payments_by_policy(db, policy_id)
    return payments

@router.get("/user/{user_id}", response_model=list[schemas.Payment])
def get_payments_by_user(user_id: int, db: Session = Depends(get_db)):
    payments = crud.get_payments_by_user(db, user_id)
    return payments

@router.get("/history/{user_id}", response_model=list[schemas.Payment])
def get_payment_history(user_id: int, db: Session = Depends(get_db)):
    payments = crud.get_payments_by_user(db, user_id)
    return payments
```

### 4.7 Update Documents Router
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/routers/documents.py`

**Changes Needed**:
- [ ] Add endpoint to get documents by user
- [ ] Add endpoint to get documents by policy
- [ ] Add endpoint to delete document

**Implementation**:
```python
# routers/documents.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, crud
from database import SessionLocal, get_db

router = APIRouter(prefix="/documents", tags=["Documents"])

# Add new endpoints:
@router.get("/user/{user_id}", response_model=list[schemas.Document])
def get_documents_by_user(user_id: int, db: Session = Depends(get_db)):
    documents = crud.get_documents_by_user(db, user_id)
    return documents

@router.get("/policy/{policy_id}", response_model=list[schemas.Document])
def get_documents_by_policy(policy_id: int, db: Session = Depends(get_db)):
    documents = crud.get_documents_by_policy(db, policy_id)
    return documents

@router.delete("/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)):
    success = crud.delete_by_id(db, models.Documents, "id", document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"message": "Document deleted successfully"}
```

### 4.8 Update Products Router
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/routers/products.py`

**Changes Needed**:
- [ ] Add endpoint to get products by category
- [ ] Fix update product endpoint (wrong id field)

**Implementation**:
```python
# routers/products.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, crud
from database import SessionLocal, get_db

router = APIRouter(prefix="/products", tags=["Products"])

# Add new endpoint:
@router.get("/category/{category}", response_model=list[schemas.Product])
def get_products_by_category(category: str, db: Session = Depends(get_db)):
    products = crud.get_products_by_category(db, category)
    return products

# Fix update_product endpoint:
@router.put("/{product_id}")
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    success = crud.update_by_id(db, models.Product, "id", product_id, product)  # Fix: "id" not "product_id"
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product updated successfully"}
```

### 4.9 Update Main App - Add CORS
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/main.py`

**Changes Needed**:
- [ ] Add CORS middleware
- [ ] Update database initialization

**Implementation**:
```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import users, policy, claims, products, contact, quotation, documents, nominee, activities, notifications, payments
from models import *

app = FastAPI(title="Insurance Management Backend")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(users.router)
app.include_router(policy.router)
app.include_router(claims.router)
app.include_router(products.router)
app.include_router(contact.router)
app.include_router(quotation.router)
app.include_router(documents.router)
app.include_router(nominee.router)
app.include_router(activities.router)
app.include_router(notifications.router)
app.include_router(payments.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Insurance Management API"}
```

---

## Task 5: Frontend API Integration

### 5.1 Create API Client
**File**: `React UI-User/src/services/apiClient.ts` (NEW FILE)

**Changes Needed**:
- [ ] Create axios-based API client
- [ ] Add base URL configuration
- [ ] Add request/response interceptors
- [ ] Add error handling

**Implementation**:
```typescript
// services/apiClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth tokens here if needed in future
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 5.2 Update API Service
**File**: `React UI-User/src/services/api.ts`

**Changes Needed**:
- [ ] Replace mockApiCall with real API calls
- [ ] Update all functions to use apiClient
- [ ] Update endpoint paths to match backend
- [ ] Add proper error handling

**Implementation**:
```typescript
// services/api.ts
import apiClient from './apiClient';

// ==================== USER APIs ====================

export async function getUserProfile(userId: number) {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
}

export async function updateUserProfile(userId: number, data: any) {
  const response = await apiClient.put(`/users/${userId}`, data);
  return response.data;
}

export async function getUserPolicies(userId: number) {
  const response = await apiClient.get(`/policy/user/${userId}`);
  return { policies: response.data };
}

export async function getPolicyDetails(policyId: number) {
  const response = await apiClient.get(`/policy/${policyId}`);
  return response.data;
}

export async function purchasePolicy(policyData: any) {
  const response = await apiClient.post('/policy/purchase', policyData);
  return response.data;
}

// ==================== CLAIMS APIs ====================

export async function getUserClaims(userId: number) {
  const response = await apiClient.get(`/claims/user/${userId}`);
  return { claims: response.data };
}

export async function getClaimDetails(claimId: number) {
  const response = await apiClient.get(`/claims/${claimId}`);
  return response.data;
}

export async function submitClaim(claimData: any) {
  const response = await apiClient.post('/claims/', claimData);
  return response.data;
}

export async function updateClaim(claimId: number, updateData: any) {
  const response = await apiClient.put(`/claims/${claimId}`, updateData);
  return response.data;
}

// ==================== ACTIVITY APIs ====================

export async function getUserActivities(userId: number) {
  const response = await apiClient.get(`/activities/user/${userId}`);
  return { activities: response.data };
}

// ==================== NOTIFICATION APIs ====================

export async function getNotifications(userId: number) {
  const response = await apiClient.get(`/notifications/user/${userId}`);
  return { notifications: response.data };
}

export async function markNotificationAsRead(notificationId: number, userId: number) {
  const response = await apiClient.put(`/notifications/${notificationId}/read`, { user_id: userId });
  return response.data;
}

// ==================== DOCUMENT APIs ====================

export async function uploadDocument(file: File, documentType: string, userId: number, policyId: number) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
  formData.append('user_id', userId.toString());
  formData.append('policy_id', policyId.toString());
  
  const response = await apiClient.post('/documents/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function getDocument(documentId: number) {
  const response = await apiClient.get(`/documents/${documentId}`);
  return response.data;
}

// ==================== PAYMENT APIs ====================

export async function initiatePayment(paymentData: any) {
  const response = await apiClient.post('/payments/', paymentData);
  return response.data;
}

export async function getPaymentStatus(paymentId: number) {
  const response = await apiClient.get(`/payments/${paymentId}`);
  return response.data;
}

export async function getPaymentHistory(userId: number) {
  const response = await apiClient.get(`/payments/user/${userId}`);
  return { payments: response.data };
}

// ==================== PRODUCT APIs ====================

export async function getProducts() {
  const response = await apiClient.get('/products/');
  return response.data;
}

export async function getProductsByCategory(category: string) {
  const response = await apiClient.get(`/products/category/${category}`);
  return response.data;
}

// ==================== QUOTATION APIs ====================

export async function requestQuote(quoteData: any) {
  const response = await apiClient.post('/quotation/', quoteData);
  return response.data;
}

// ==================== CONTACT APIs ====================

export async function submitContact(contactData: any) {
  const response = await apiClient.post('/contact/', contactData);
  return response.data;
}

// Export all API functions
export const api = {
  getUserProfile,
  updateUserProfile,
  getUserPolicies,
  getPolicyDetails,
  purchasePolicy,
  getUserClaims,
  getClaimDetails,
  submitClaim,
  updateClaim,
  getUserActivities,
  getNotifications,
  markNotificationAsRead,
  uploadDocument,
  getDocument,
  initiatePayment,
  getPaymentStatus,
  getPaymentHistory,
  getProducts,
  getProductsByCategory,
  requestQuote,
  submitContact,
};
```

### 5.3 Install Axios
**Action Required**:
- [ ] Install axios: `npm install axios`
- [ ] Add to package.json dependencies

### 5.4 Create Environment File
**File**: `React UI-User/.env.development` (NEW FILE)

**Changes Needed**:
- [ ] Create environment file
- [ ] Add API base URL

**Implementation**:
```env
# .env.development
VITE_API_BASE_URL=http://localhost:8000
```

### 5.5 Update Dashboard Component
**File**: `React UI-User/src/components/pages/Dashboard.tsx`

**Changes Needed**:
- [ ] Update to use real API calls with userId
- [ ] Add error handling
- [ ] Handle loading states
- [ ] Handle empty states

**Implementation**:
```typescript
// Update Dashboard.tsx
import { getUserPolicies, getUserActivities, getNotifications } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        // For now, use a default userId or get from context
        // TODO: Get userId from authenticated user
        const userId = 1; // Temporary - replace with actual user ID
        
        try {
          setLoading(true);
          const [policiesData, activitiesData, notificationsData] = await Promise.all([
            getUserPolicies(userId),
            getUserActivities(userId),
            getNotifications(userId)
          ]);

          setPolicies(policiesData.policies || []);
          setActivities(activitiesData.activities || []);
          setNotifications(notificationsData.notifications || []);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          setError('Failed to load dashboard data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  // ... rest of component
}
```

### 5.6 Update Profile Component
**File**: `React UI-User/src/components/pages/Profile.tsx`

**Changes Needed**:
- [ ] Remove mockPolicies and mockClaims
- [ ] Fetch data from API
- [ ] Update API calls to use userId

**Implementation**:
```typescript
// Remove hardcoded data:
// const mockPolicies: Policy[] = [...] // DELETE
// const mockClaims: Claim[] = [...] // DELETE

// Add API calls:
const [policies, setPolicies] = useState<Policy[]>([]);
const [claims, setClaims] = useState<Claim[]>([]);

useEffect(() => {
  const fetchData = async () => {
    if (user?.id) {
      try {
        const [policiesData, claimsData] = await Promise.all([
          getUserPolicies(user.id),
          getUserClaims(user.id)
        ]);
        setPolicies(policiesData.policies || []);
        setClaims(claimsData.claims || []);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast.error('Failed to load profile data');
      }
    }
  };
  fetchData();
}, [user]);
```

### 5.7 Update Claims Submit Component
**File**: `React UI-User/src/components/pages/ClaimsSubmit.tsx`

**Changes Needed**:
- [ ] Remove mockPolicies
- [ ] Fetch user policies from API
- [ ] Filter policies by claim type

**Implementation**:
```typescript
// Remove: const mockPolicies = {...} // DELETE

// Add API call:
const [policies, setPolicies] = useState<any[]>([]);

useEffect(() => {
  const fetchPolicies = async () => {
    if (user?.id) {
      try {
        const policiesData = await getUserPolicies(user.id);
        setPolicies(policiesData.policies || []);
      } catch (error) {
        console.error('Error fetching policies:', error);
      }
    }
  };
  fetchPolicies();
}, [user, claimType]);

// Filter policies:
const filteredPolicies = policies.filter(policy => {
  if (claimType === 'health') return policy.type === 'health_insurance';
  if (claimType === 'life') return policy.type === 'life_insurance';
  if (claimType === 'car') return policy.type === 'vehicle_insurance';
  return false;
});
```

### 5.8 Update Claims Track Component
**File**: `React UI-User/src/components/pages/ClaimsTrack.tsx`

**Changes Needed**:
- [ ] Remove mockClaims
- [ ] Fetch claims from API
- [ ] Add filtering and search

**Implementation**:
```typescript
// Remove: const mockClaims: Claim[] = [...] // DELETE

// Add API call:
const [claims, setClaims] = useState<Claim[]>([]);

useEffect(() => {
  const fetchClaims = async () => {
    if (user?.id) {
      try {
        const claimsData = await getUserClaims(user.id);
        setClaims(claimsData.claims || []);
      } catch (error) {
        console.error('Error fetching claims:', error);
      }
    }
  };
  fetchClaims();
}, [user]);
```

### 5.9 Update Homepage Component
**File**: `React UI-User/src/components/pages/Homepage.tsx`

**Changes Needed**:
- [ ] Update testimonial and stats API calls (if backend endpoints exist)
- [ ] Add error handling
- [ ] Handle cases where backend doesn't have these endpoints yet

**Note**: For now, these can remain as mock data if backend doesn't have public endpoints.

---

## Task 6: Update Schemas

### 6.1 Update Policy Schemas
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/schemas.py`

**Changes Needed**:
- [ ] Add userId to PolicyCreate
- [ ] Add userId to PolicyPurchaseCreate
- [ ] Update Policy response to include userId

**Implementation**:
```python
# In schemas.py

# Update PolicyCreate:
class PolicyCreate(PolicyBase):
    userId: int  # ADD THIS
    pass

# Update PolicyPurchaseCreate:
class PolicyPurchaseCreate(BaseModel):
    userId: int  # ADD THIS
    type: PolicyType
    planName: str
    coverage: float
    premium: float
    tenure: int
    nominee: Optional[str] = None
    nomineeId: Optional[int] = None
    personalDetails: Optional[PersonalDetails] = None
    policyNumber: str

# Update NotificationCreate:
class NotificationCreate(NotificationBase):
    userId: int  # ADD THIS
    pass
```

---

## Task 7: Database Migration

### 7.1 Create Initial Migration Script
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/migrate_db.py` (NEW FILE)

**Changes Needed**:
- [ ] Create migration script to add missing fields
- [ ] Handle existing data

**Implementation**:
```python
# migrate_db.py
from sqlalchemy import text
from database import engine, SessionLocal
import models

def migrate_database():
    """Add missing userId fields to existing tables"""
    db = SessionLocal()
    try:
        # Add userId column to policy table if it doesn't exist
        try:
            db.execute(text("ALTER TABLE policy ADD COLUMN userId INTEGER"))
            db.execute(text("ALTER TABLE policy ADD CONSTRAINT fk_policy_user FOREIGN KEY (userId) REFERENCES users(id)"))
            db.commit()
            print("Added userId to policy table")
        except Exception as e:
            print(f"Policy userId column may already exist: {e}")
            db.rollback()

        # Add userId column to policy_purchase table if it doesn't exist
        try:
            db.execute(text("ALTER TABLE policy_purchase ADD COLUMN userId INTEGER"))
            db.execute(text("ALTER TABLE policy_purchase ADD CONSTRAINT fk_policy_purchase_user FOREIGN KEY (userId) REFERENCES users(id)"))
            db.commit()
            print("Added userId to policy_purchase table")
        except Exception as e:
            print(f"PolicyPurchase userId column may already exist: {e}")
            db.rollback()

        # Add userId column to notifications table if it doesn't exist
        try:
            db.execute(text("ALTER TABLE notifications ADD COLUMN userId INTEGER"))
            db.execute(text("ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user FOREIGN KEY (userId) REFERENCES users(id)"))
            db.commit()
            print("Added userId to notifications table")
        except Exception as e:
            print(f"Notification userId column may already exist: {e}")
            db.rollback()

        print("Migration completed successfully!")
    except Exception as e:
        print(f"Migration error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_database()
```

**Note**: For PostgreSQL, use Alembic for proper migrations. This is a quick fix script.

---

## Task 8: Testing & Verification

### 8.1 Test Backend API
**Action Required**:
- [ ] Start backend server: `uvicorn main:app --reload`
- [ ] Test all endpoints using Swagger UI: `http://localhost:8000/docs`
- [ ] Verify database connections
- [ ] Test CRUD operations
- [ ] Test relationship queries

### 8.2 Test Frontend Integration
**Action Required**:
- [ ] Start frontend: `npm run dev`
- [ ] Test API calls from frontend
- [ ] Verify data flow
- [ ] Test error handling
- [ ] Verify CORS is working

### 8.3 Create Test Data
**File**: `Innsurance Backend Fast API/fastapi_insurance_project_backend/seed_data.py` (NEW FILE - OPTIONAL)

**Changes Needed**:
- [ ] Create script to seed test data
- [ ] Add sample users, policies, claims, etc.

---

## 📊 Implementation Order

### Phase 1: Database Setup (Day 1)
1. Task 1: PostgreSQL Setup
2. Task 2: Database Schema Fixes
3. Task 7: Database Migration

### Phase 2: Backend Enhancement (Day 2-3)
4. Task 3: Enhanced CRUD Operations
5. Task 4: Update API Routers
6. Task 6: Update Schemas

### Phase 3: Frontend Integration (Day 4-5)
7. Task 5: Frontend API Integration
8. Task 8: Testing & Verification

---

## 🚀 Quick Start Guide

### Backend Setup
```bash
# 1. Install PostgreSQL
# 2. Create database
createdb insurance_db

# 3. Install dependencies
cd "Innsurance Backend Fast API/fastapi_insurance_project_backend"
pip install -r requirements.txt

# 4. Set environment variables
# Create .env file with DATABASE_URL

# 5. Run migration (if needed)
python migrate_db.py

# 6. Start server
uvicorn main:app --reload
```

### Frontend Setup
```bash
# 1. Install dependencies
cd "React UI-User"
npm install axios

# 2. Create .env.development file
# Add VITE_API_BASE_URL=http://localhost:8000

# 3. Start development server
npm run dev
```

---

## 📝 Notes

### Important Points
1. **UserId**: All API calls need userId. For now, you can hardcode userId=1 for testing, or get it from the AuthContext.
2. **CORS**: Make sure CORS is properly configured in main.py
3. **Database**: Use PostgreSQL connection string format: `postgresql://user:password@host:port/database`
4. **Error Handling**: Add proper error handling in both backend and frontend
5. **Validation**: Add input validation in backend schemas
6. **Testing**: Test each endpoint after implementation

### Known Issues
1. AuthContext uses mock user - you'll need to get userId from somewhere (hardcode for now)
2. Some endpoints may need authentication in the future
3. File upload needs proper implementation
4. Payment integration needs gateway setup

---

## 🔄 Next Steps After Core Implementation

1. Add authentication (if needed)
2. Add file upload functionality
3. Add payment gateway integration
4. Add admin endpoints
5. Add comprehensive error handling
6. Add logging
7. Add testing
8. Add documentation

---

**Last Updated**: January 2025
**Version**: 2.0.0 (Focused on Core Functionality)
