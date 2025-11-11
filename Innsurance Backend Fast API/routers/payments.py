from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import schemas, models, crud
from database import SessionLocal

router = APIRouter(prefix="/payments", tags=["Payments"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_payment(payment: schemas.PaymentCreate, db: Session = Depends(get_db)):
    payment_obj = crud.create_entry(db, models.Payments, payment)
    return {"success": True,
            "paymentId": getattr(payment_obj, 'id', None),
            "orderId": getattr(payment_obj, 'orderId', None),
            "amount": getattr(payment_obj, 'amount', None),
            "paymentUrl": getattr(payment_obj, 'paymentUrl', None)
            }

@router.get("/", response_model=list[schemas.Payment])
def read_payments(db: Session = Depends(get_db)):
    return crud.get_all(db, models.Payments)

@router.get("/{payment_id}", response_model=schemas.Payment)
def read_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = crud.get_by_id(db, models.Payments, "id", payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {"paymentId": payment.id,
            "status": payment.status,
            "amount": payment.amount,
            "transactionId": payment.transactionId,
            "paidDate": payment.paidDate}


@router.get("/policy/{policy_id}", response_model=list[schemas.Payment])
def get_payments_by_policy(policy_id: int, db: Session = Depends(get_db)):
    return crud.get_payments_by_policy(db, policy_id)


@router.get("/user/{user_id}", response_model=list[schemas.Payment])
def get_payments_by_user(user_id: int, db: Session = Depends(get_db)):
    return crud.get_payments_by_user(db, user_id)


@router.get("/history/{user_id}", response_model=list[schemas.Payment])
def get_payment_history(user_id: int, db: Session = Depends(get_db)):
    return crud.get_payments_by_user(db, user_id)