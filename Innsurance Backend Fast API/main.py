from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import users, policy, claims, products, contact, quotation, documents, nominee, activities, notifications, payments, auth, public
from models import *
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Insurance Management Backend")

# CORS Configuration
cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create all tables
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(public.router)  # Public endpoints (no auth required)
app.include_router(auth.router)  # Authentication endpoints
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

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
