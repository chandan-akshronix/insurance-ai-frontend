from fastapi import APIRouter, Request, HTTPException
from fastapi import status
from bson import ObjectId
from datetime import datetime
from typing import List
import schemas_mongo as schemas
from mongo import get_collection

# local DB access to create SQL Policy when requested
from database import SessionLocal
import crud, models

router = APIRouter(prefix="/life-insurance", tags=["life_insurance"])


def _oid_str(doc: dict):
    if not doc:
        return doc
    doc = dict(doc)
    if '_id' in doc:
        doc['id'] = str(doc['_id'])
        doc.pop('_id', None)
    return doc


@router.post('/', status_code=status.HTTP_201_CREATED)
async def create_application(request: Request, payload: dict):
    """
    Accept a flexible JSON payload for life insurance applications.
    Using a plain `dict` here avoids FastAPI/Pydantic 422 validation when the
    frontend sends camelCase or slightly different shapes. We still set
    timestamps and persist whatever JSON the client provided.
    """
    db = request.app.mongodb
    coll = db.get_collection('life_insurance_applications')
    # ensure we have a mutable dict
    doc = dict(payload or {})

    # Optionally create a SQL Policy if the client provided a `policy` object
    # or `policy` key contains a dict with policy fields. After creating
    # the SQL record we will store its id in the Mongo document under `policy`.
    try:
        policy_obj = doc.get('policy')
        if isinstance(policy_obj, dict):
            db = SessionLocal()
            try:
                # build a minimal policy payload; ensure required JSON fields exist
                policy_payload = {
                    "userId": doc.get('user_id') or doc.get('userId'),
                    "type": policy_obj.get('type', 'life_insurance'),
                    "planName": policy_obj.get('planName', policy_obj.get('plan_name', 'Life Plan')),
                    "policyNumber": policy_obj.get('policyNumber') or ("LIF" + datetime.utcnow().strftime("%Y%m%d%H%M%S")),
                    "coverage": policy_obj.get('coverage', policy_obj.get('coverage_amount', 0.0)) or 0.0,
                    "premium": policy_obj.get('premium', 0.0) or 0.0,
                    # personalDetails is non-null in the Policy model, provide at least an empty dict
                    "personalDetails": policy_obj.get('personalDetails') or doc.get('personal_details') or {},
                    "policyDocument": policy_obj.get('policyDocument') or policy_obj.get('policy_document') or None,
                    "startDate": policy_obj.get('startDate'),
                    "expiryDate": policy_obj.get('expiryDate'),
                    "benefits": policy_obj.get('benefits'),
                    "nominee": policy_obj.get('nominee'),
                    "nomineeId": policy_obj.get('nomineeId')
                }

                # create the Policy SQL row and get its id
                policy_id = crud.create_entry(db, models.Policy, policy_payload, return_id=True)
                # store numeric id in the Mongo document
                doc['policy'] = policy_id
            finally:
                db.close()
    except Exception:
        # don't fail the whole application creation if policy creation fails;
        # log and continue with the application record (the caller can retry)
        import logging
        logging.exception('Failed to create SQL policy from life-insurance payload')

    now = datetime.utcnow()
    # only set timestamps if not provided
    doc.setdefault('created_at', now)
    doc['updated_at'] = now
    res = await coll.insert_one(doc)
    return {'id': str(res.inserted_id)}


@router.get('/user/{user_id}', response_model=List[dict])
async def get_applications_for_user(request: Request, user_id: str):
    db = request.app.mongodb
    coll = db.get_collection('life_insurance_applications')
    cursor = coll.find({'user_id': user_id}).sort('created_at', -1)
    results = [ _oid_str(d) async for d in cursor ]
    return results


@router.get('/{app_id}')
async def get_application(request: Request, app_id: str):
    db = request.app.mongodb
    coll = db.get_collection('life_insurance_applications')
    try:
        obj = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid id')
    doc = await coll.find_one({'_id': obj})
    if not doc:
        raise HTTPException(status_code=404, detail='Not found')
    return _oid_str(doc)


@router.patch('/{app_id}')
async def update_application(request: Request, app_id: str, payload: dict):
    db = request.app.mongodb
    coll = db.get_collection('life_insurance_applications')
    try:
        obj = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid id')
    payload['updated_at'] = datetime.utcnow()
    res = await coll.update_one({'_id': obj}, {'$set': payload})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    return { 'modified_count': res.modified_count }


@router.delete('/{app_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(request: Request, app_id: str):
    db = request.app.mongodb
    coll = db.get_collection('life_insurance_applications')
    try:
        obj = ObjectId(app_id)
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid id')
    res = await coll.delete_one({'_id': obj})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    return {}
