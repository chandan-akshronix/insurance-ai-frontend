from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import schemas, models, crud
from database import SessionLocal

router = APIRouter(prefix="/users", tags=["Users"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------- CREATE USER --------------------
@router.post("/", response_model=dict)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user if phone or email does not already exist.
    """
    # Check if a user with the same phone or email already exists
    existing_user = (
        db.query(models.User)
        .filter(
            (models.User.phone == user.phone) |
            (models.User.email == user.email)
        )
        .first()
    )

    if existing_user:
        return {
            "success": False,
            "error": "Duplicate entry",
            "message": "User with this phone number or email already exists"
        }

    try:
        user_id = crud.create_entry(db, models.User, user, return_id=True)
        return {
            "success": True,
            "message": "User created successfully",
        }

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Duplicate entry detected"
        )

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )



# -------------------- GET ALL USERS --------------------
@router.get("/", response_model=list[schemas.User])
def read_users(db: Session = Depends(get_db)):
    return crud.get_all(db, models.User)


# -------------------- GET USER BY ID --------------------
@router.get("/{userId}", response_model=schemas.User)
def read_user(userId: int, db: Session = Depends(get_db)):
    user = crud.get_by_id(db, models.User, "id", userId)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"userId": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "dateOfBirth": user.dateOfBirth,
            "gender": user.gender,
            "panCard": user.panCard,
            "aadhar": user.aadhar,
            "joinedDate": user.joinedDate,
            "kycStatus": user.kycStatus,
            "profileImage": user.profileImage}


# -------------------- DELETE USER --------------------
@router.delete("/{userId}")
def delete_user(userId: int, db: Session = Depends(get_db)):
    success = crud.delete_by_id(db, models.User, "id", userId)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


# -------------------- UPDATE USER --------------------
@router.put("/{userId}")
def update_user(userId: int, user: schemas.UserUpdate, db: Session = Depends(get_db)):
    success = crud.update_by_id(db, models.User, "id", userId, user)
    if not success:
        return {"success": False, 
                "error": "Not found",
                "message": "User not found"}
    
    return {"success": True, "message": "Profile updated successfully"}


# -------------------- EXTRA USER-SCOPED ENDPOINTS --------------------
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


@router.get("/{userId}/policies", response_model=list[schemas.Policy])
def get_user_policies(userId: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_policies_by_user(db, userId, skip, limit)


@router.get("/{userId}/claims", response_model=list[schemas.Claim])
def get_user_claims(userId: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_claims_by_user(db, userId, skip, limit)


@router.get("/{userId}/activities", response_model=list[schemas.Activity])
def get_user_activities(userId: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_activities_by_user(db, userId, skip, limit)


@router.get("/{userId}/notifications", response_model=list[schemas.Notification])
def get_user_notifications(userId: int, unread_only: bool = False, db: Session = Depends(get_db)):
    return crud.get_notifications_by_user(db, userId, unread_only)
