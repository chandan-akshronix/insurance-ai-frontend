# Insurance AI - Detailed Task Checklist

## 📋 BACKEND IMPLEMENTATION CHECKLIST

### Phase 1: Infrastructure Setup ✅ COMPLETE

- [x] Set up Azure PostgreSQL database
  - [x] Create connection string
  - [x] Configure SSL/TLS
  - [x] Set up connection pooling
  - [x] Environment variables configured
- [x] Set up Azure Blob Storage
  - [x] Create storage account
  - [x] Create container
  - [x] Configure connection string
- [x] Create requirements.txt with all dependencies
  - [x] FastAPI
  - [x] SQLAlchemy
  - [x] psycopg2 (PostgreSQL driver)
  - [x] azure-storage-blob
  - [x] python-dotenv
  - [x] python-multipart

---

### Phase 2: Data Models ✅ COMPLETE

- [x] User Model
  - [x] All fields defined
  - [x] Relationships to policies, claims, documents, nominees, activities, notifications, payments
- [x] Policy Model
  - [x] All fields including userId (✅ ADDED)
  - [x] Foreign key to User
  - [x] Relationships to claims, documents, nominees, notifications, payments
- [x] PolicyPurchase Model
  - [x] All fields including userId (✅ ADDED)
  - [x] Foreign key to User
- [x] Claim Model
  - [x] All fields including userId
  - [x] Relationships to User and Policy
- [x] Document Model
  - [x] All fields
  - [x] Relationships to User and Policy
- [x] Nominee Model
  - [x] All fields
  - [x] Relationships to User and Policy
- [x] Activity Model
  - [x] All fields
  - [x] Relationship to User
- [x] Notification Model
  - [x] All fields including userId (✅ ADDED)
  - [x] Foreign key to User
  - [x] Optional relationship to Policy
- [x] Payment Model
  - [x] All fields including userId (✅ ADDED)
  - [x] Foreign key to User
  - [x] Relationship to Policy
- [x] Product Model
  - [x] All fields
- [x] Contact Model
  - [x] All fields
- [x] Quotation Model
  - [x] All fields

---

### Phase 3: Schemas (Pydantic) ✅ COMPLETE

- [x] UserBase & UserCreate
- [x] PolicyBase & PolicyCreate
  - [x] userId field added
- [x] PolicyPurchaseCreate
  - [x] userId field added
- [x] ClaimBase & ClaimCreate
- [x] DocumentBase & DocumentCreate
- [x] NomineeBase & NomineeCreate
- [x] ActivityBase & ActivityCreate
- [x] NotificationBase & NotificationCreate
  - [x] userId field added
- [x] PaymentBase & PaymentCreate
  - [x] userId field added
- [x] All enums properly defined:
  - [x] PolicyType
  - [x] ContactCategory
  - [x] Addons
  ## 📊 Summary by Status

  ### ✅ COMPLETED (All backend items)
  - Database setup
  - All models with relationships
  - All schemas with validation
  - All CRUD operations
  - All API routers implemented and verified (Users, Policy, Claims, Activities, Notifications, Payments, Documents, Products, Contact, Quotation, Nominee)
  - Main app configuration
  - Azure Storage integration

  ### 🟨 IN PROGRESS (1 item)
  - Frontend API Integration (Task 5)

  ### ❌ NOT STARTED (2 items)
  - Frontend component updates
  - Testing & verification (backend + frontend)

  ---

  ## ⏱️ Estimated Time to Completion

  | Task | Time | Status |
  |------|------|--------|
  | Frontend API setup (services/apiClient.ts, services/api.ts) | 2 hrs | 🟨 |
  | Frontend component updates (replace mock data) | 4 hrs | ❌ |
  | Testing & debugging (backend + frontend) | 3 hrs | ❌ |
  | Database migration / migrate_db.py (if needed) | 2 hrs | ❌ |
  | **TOTAL (remaining)** | **~11 hours** | 🟨 |

  ---

  **Last Updated**: November 10, 2025  
  **Next Action**: Begin Task 5 — Frontend API Integration (create apiClient, update api.ts, wire components)
**Payment-Specific**:
- [x] get_payments_by_policy(db, policy_id)
- [x] get_payments_by_user(db, user_id)

**Nominee-Specific**:
- [x] get_nominees_by_user(db, user_id)
- [x] get_nominees_by_policy(db, policy_id)

**Product-Specific**:
- [x] get_products_by_category(db, category)

---

### Phase 5: API Routers ✅ COMPLETE

#### Users Router ✅ COMPLETE
- [x] POST /users/ - Create user (with duplicate check)
- [x] GET /users/ - List all users
- [x] GET /users/{userId} - Get user by ID
- [x] PUT /users/{userId} - Update user
- [x] DELETE /users/{userId} - Delete user
- [x] GET /users/email/{email} - Get by email
- [x] GET /users/phone/{phone} - Get by phone
- [x] GET /users/{userId}/policies - Get user's policies
- [x] GET /users/{userId}/claims - Get user's claims
- [x] GET /users/{userId}/activities - Get user's activities
- [x] GET /users/{userId}/notifications - Get user's notifications (with unread_only filter)
- [x] GET /users/{userId}/documents - Get user's documents

#### Policy Router ✅ COMPLETE
- [x] POST /policy/ - Create policy
- [x] GET /policy/ - List all policies
- [x] GET /policy/{policy_id} - Get policy by ID
- [x] GET /policy/user/{user_id} - Get user's policies
- [x] GET /policy/type/{policy_type} - Get policies by type
- [x] GET /policy/number/{policy_number} - Get policy by number
- [x] PUT /policy/{policy_id} - Update policy
- [x] DELETE /policy/{policy_id} - Delete policy
- [x] POST /policy/purchase - Purchase policy (auto-generated number)

#### Documents Router ✅ COMPLETE
- [x] POST /documents/upload - Upload to Azure Blob Storage
- [x] POST /documents/ - Create document record
- [x] GET /documents/ - List all documents
- [x] GET /documents/user/{user_id} - Get user's documents
- [x] GET /documents/policy/{policy_id} - Get policy's documents
- [x] DELETE /documents/{document_id} - Delete document

#### Claims Router ✅ COMPLETE
- [x] POST /claims/ - Create claim
- [x] GET /claims/ - List claims (with pagination)
- [x] GET /claims/{claim_id} - Get claim by ID
- [x] PUT /claims/{claim_id} - Update claim
- [x] DELETE /claims/{claim_id} - Delete claim
- [x] GET /claims/user/{user_id} - Get claims by user
- [x] GET /claims/policy/{policy_id} - Get claims by policy
- [x] GET /claims/status/{status} - Get claims by status

#### Activities Router ✅ COMPLETE
- [x] POST /activities/ - Create activity
- [x] GET /activities/ - List activities
- [x] GET /activities/{activity_id} - Get activity by ID
- [x] GET /activities/user/{user_id} - Get activities by user
- [x] GET /activities/user/{user_id}/type/{activity_type} - Get activities by type

#### Notifications Router ✅ COMPLETE
- [x] POST /notifications/ - Create notification
- [x] GET /notifications/ - List notifications
- [x] GET /notifications/{notification_id} - Get notification by ID
- [x] GET /notifications/user/{user_id} - Get notifications by user
- [x] PUT /notifications/{notification_id}/read - Mark as read
- [x] PUT /notifications/user/{user_id}/read-all - Mark all as read

#### Payments Router ✅ COMPLETE
- [x] POST /payments/ - Create payment
- [x] GET /payments/ - List payments
- [x] GET /payments/{payment_id} - Get payment by ID
- [x] GET /payments/policy/{policy_id} - Get payments by policy
- [x] GET /payments/user/{user_id} - Get payments by user
- [x] GET /payments/history/{user_id} - Get payment history

#### Products Router ✅ COMPLETE
- [x] POST /products/ - Create product
- [x] GET /products/ - List products
- [x] GET /products/{product_id} - Get product by ID
- [x] PUT /products/{product_id} - Update product
- [x] DELETE /products/{product_id} - Delete product
- [x] GET /products/category/{category} - Get products by category

#### Contact Router ✅ COMPLETE
- [x] POST /contact/ - Submit contact form
- [x] GET /contact/ - List contacts
- [x] GET /contact/{contact_id} - Get contact by ID

#### Quotation Router ✅ COMPLETE
- [x] POST /quotation/ - Create quotation
- [x] GET /quotation/ - List quotations
- [x] GET /quotation/{quotation_id} - Get quotation by ID

#### Nominee Router ✅ COMPLETE
- [x] POST /nominee/ - Create nominee
- [x] GET /nominee/ - List nominees
- [x] GET /nominee/{nominee_id} - Get nominee by ID
- [x] PUT /nominee/{nominee_id} - Update nominee
- [x] DELETE /nominee/{nominee_id} - Delete nominee

#### Main App Configuration ✅ COMPLETE
- [x] Import all routers
- [x] Include all routers in FastAPI app
- [x] Configure CORS middleware
- [x] Set allowed origins from environment variable
- [x] Create tables on startup
- [x] GET / - Root endpoint
- [x] GET /health - Health check endpoint

---

## 📋 FRONTEND IMPLEMENTATION CHECKLIST

### Phase 1: API Client Setup ❌ NOT STARTED

- [ ] Create `services/apiClient.ts`
  - [ ] Set up axios instance
  - [ ] Configure base URL from environment
  - [ ] Add request interceptor
  - [ ] Add response interceptor
  - [ ] Add error handling
- [ ] Create `.env.development`
  - [ ] Set VITE_API_BASE_URL
- [ ] Update `package.json`
  - [ ] Add axios dependency
- [ ] Install dependencies: `npm install axios`

---

### Phase 2: API Service Integration ❌ NOT STARTED

**Update `services/api.ts`**:

- [ ] User APIs
  - [ ] getUserProfile(userId)
  - [ ] updateUserProfile(userId, data)
  - [ ] getUserPolicies(userId)
  - [ ] getUserClaims(userId)
  - [ ] getUserActivities(userId)
  - [ ] getNotifications(userId)
- [ ] Policy APIs
  - [ ] getPolicyDetails(policyId)
  - [ ] purchasePolicy(policyData)
  - [ ] getProductsByCategory(category)
- [ ] Claims APIs
  - [ ] getClaimDetails(claimId)
  - [ ] submitClaim(claimData)
  - [ ] updateClaim(claimId, updateData)
  - [ ] trackClaim(claimId)
- [ ] Document APIs
  - [ ] uploadDocument(file, documentType, userId, policyId)
  - [ ] getDocument(documentId)
  - [ ] deleteDocument(documentId)
- [ ] Payment APIs
  - [ ] initiatePayment(paymentData)
  - [ ] getPaymentStatus(paymentId)
  - [ ] getPaymentHistory(userId)
- [ ] Miscellaneous
  - [ ] submitContact(contactData)
  - [ ] requestQuote(quoteData)

---

### Phase 3: Component Updates ❌ NOT STARTED

#### Dashboard.tsx
- [ ] Remove mockPolicies
- [ ] Remove mockActivities
- [ ] Remove mockNotifications
- [ ] Fetch data from API using userId
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add empty state handling

#### Profile.tsx
- [ ] Remove mockPolicies
- [ ] Remove mockClaims
- [ ] Fetch user profile from API
- [ ] Fetch policies from API
- [ ] Fetch claims from API
- [ ] Display user information
- [ ] Add edit profile functionality

#### ClaimsSubmit.tsx
- [ ] Remove mockPolicies
- [ ] Fetch user policies by claim type
- [ ] Filter policies based on insurance type
- [ ] Submit claim to API
- [ ] Show success/error message

#### ClaimsTrack.tsx
- [ ] Remove mockClaims
- [ ] Fetch user claims from API
- [ ] Display claim status
- [ ] Add filter by status
- [ ] Add search functionality

#### Quotes.tsx
- [ ] Fetch products by category from API
- [ ] Display product details
- [ ] Submit quotation request to API

#### Other Pages
- [ ] Contact.tsx - Submit to API
- [ ] CarInsurance.tsx - Fetch products
- [ ] HealthInsurance.tsx - Fetch products
- [ ] LifeInsurance.tsx - Fetch products

---

### Phase 4: Error Handling & UX ❌ NOT STARTED

- [ ] Add try-catch blocks to all API calls
- [ ] Display error toasts to users
- [ ] Handle network errors
- [ ] Handle server errors
- [ ] Handle validation errors
- [ ] Add loading spinners
- [ ] Add empty state messages
- [ ] Add retry functionality

---

## 🧪 TESTING CHECKLIST

### Phase 1: Backend Testing ❌ NOT STARTED

#### Manual Testing
- [ ] Start backend: `uvicorn main:app --reload`
- [ ] Access Swagger UI: `http://localhost:8000/docs`
- [ ] Test each endpoint manually

**Users Endpoints**:
- [ ] POST /users/ - Create test user
- [ ] GET /users/{userId} - Retrieve user
- [ ] GET /users/email/{email} - Get by email
- [ ] GET /users/{userId}/policies - Get user policies
- [ ] GET /users/{userId}/claims - Get user claims
- [ ] PUT /users/{userId} - Update user
- [ ] DELETE /users/{userId} - Delete user

**Policy Endpoints**:
- [ ] POST /policy/ - Create test policy
- [ ] GET /policy/{policy_id} - Get policy
- [ ] GET /policy/user/{user_id} - Get user policies
- [ ] POST /policy/purchase - Purchase policy (after completion)
- [ ] PUT /policy/{policy_id} - Update policy
- [ ] DELETE /policy/{policy_id} - Delete policy

**Document Endpoints**:
- [ ] POST /documents/upload - Upload test file
- [ ] GET /documents/user/{user_id} - Get user documents
- [ ] DELETE /documents/{document_id} - Delete document

**Other Endpoints**:
- [ ] All Claims endpoints (after implementation)
- [ ] All Activities endpoints (after implementation)
- [ ] All Notifications endpoints (after implementation)
- [ ] All Payments endpoints (after implementation)
- [ ] All Products endpoints (after implementation)

#### Automated Testing (Optional)
- [ ] Create pytest tests for routers
- [ ] Create pytest tests for CRUD operations
- [ ] Create pytest tests for database operations

### Phase 2: Frontend Testing ❌ NOT STARTED

#### Component Testing
- [ ] Start frontend: `npm run dev`
- [ ] Visit dashboard and verify data loads
- [ ] Visit profile and verify data loads
- [ ] Test claims submission
- [ ] Test claims tracking
- [ ] Test document upload
- [ ] Test quotation request
- [ ] Test contact submission

#### API Integration Testing
- [ ] Verify API calls are made
- [ ] Verify responses are handled correctly
- [ ] Verify error messages display
- [ ] Verify loading states work
- [ ] Verify empty states display

#### End-to-End Testing
- [ ] Test complete user flow:
  1. Create user
  2. View policies
  3. Purchase policy
  4. Submit claim
  5. Track claim
  6. View documents
  7. Make payment

### Phase 3: Database Testing ❌ NOT STARTED
- [ ] Verify PostgreSQL connection works
- [ ] Verify all tables created
- [ ] Verify data persistence
- [ ] Verify foreign key relationships
- [ ] Test Azure Blob Storage integration

---

## 📊 Summary by Status

### ✅ COMPLETED (27 items)
- Database setup
- All models with relationships
- All schemas with validation
- All CRUD operations
- 6 complete routers (Users, Documents, Contact, Quotation, Nominee, + partial Policy)
- Main app configuration
- Azure Storage integration

### 🟨 IN PROGRESS (1 item)
- Policy Router (90% - missing purchase endpoint)

### ❌ NOT STARTED (20+ items)
- 5 router enhancements (Claims, Activities, Notifications, Payments, Products)
- Frontend API client and service
- Component updates
- All testing
- Database migration scripts

---

## ⏱️ Estimated Time to Completion

| Task | Time | Status |
|------|------|--------|
| Complete Policy purchase endpoint | 1 hr | ⚠️ |
| Complete Claims router | 2 hrs | ❌ |
| Complete Activities router | 1.5 hrs | ❌ |
| Complete Notifications router | 2 hrs | ❌ |
| Complete Payments router | 1.5 hrs | ❌ |
| Complete Products router | 0.5 hrs | ❌ |
| Frontend API setup | 2 hrs | ❌ |
| Frontend component updates | 4 hrs | ❌ |
| Testing & debugging | 3 hrs | ❌ |
| **TOTAL** | **~18 hours** | 🟨 |

---

**Last Updated**: November 10, 2025  
**Next Action**: Complete the 5 pending router enhancements
