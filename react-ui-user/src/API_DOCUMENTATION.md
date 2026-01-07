# SecureInsure API Documentation

## Base URL
```
https://api.secureinsure.com/v1
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

---

## 🔐 User APIs

### Get User Profile
Retrieves the current user's profile information.

**Endpoint:** `GET /api/user/profile`  
**Authentication:** Required  
**Response:**
```json
{
  "id": "user-123",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+91 98765 43210",
  "address": "123 Main Street, Mumbai, Maharashtra 400001",
  "dateOfBirth": "1990-05-15",
  "gender": "Male",
  "panCard": "ABCDE1234F",
  "aadhar": "1234 5678 9012",
  "joinedDate": "2024-01-15",
  "kycStatus": "verified",
  "profileImage": "https://example.com/profile.jpg"
}
```

### Update User Profile
Updates the current user's profile information.

**Endpoint:** `PUT /api/user/profile`  
**Authentication:** Required  
**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+91 98765 43210",
  "address": "123 Main Street, Mumbai"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

---

## 📋 Policy APIs

### Get User Policies
Retrieves all policies for the current user.

**Endpoint:** `GET /api/policies`  
**Authentication:** Required  
**Response:**
```json
{
  "policies": [
    {
      "id": "POL-001",
      "type": "Life Insurance",
      "planName": "HDFC Click 2 Protect Plus",
      "policyNumber": "SI-2025-001234",
      "coverage": "₹50,00,000",
      "premium": "₹850/month",
      "status": "Active",
      "startDate": "2024-10-14",
      "expiryDate": "2045-10-14",
      "benefits": ["Death Benefit", "Terminal Illness", "Accidental Death"],
      "nominee": "Jane Doe",
      "policyDocument": "/documents/policy-001.pdf"
    }
  ]
}
```

### Get Policy Details
Retrieves details of a specific policy.

**Endpoint:** `GET /api/policies/:id`  
**Authentication:** Required  
**URL Parameters:**
- `id` (string): Policy ID

**Response:**
```json
{
  "id": "POL-001",
  "type": "Life Insurance",
  "planName": "HDFC Click 2 Protect Plus",
  "policyNumber": "SI-2025-001234",
  "coverage": "₹50,00,000",
  "premium": "₹850/month",
  "status": "Active",
  "startDate": "2024-10-14",
  "expiryDate": "2045-10-14",
  "benefits": ["Death Benefit", "Terminal Illness"],
  "nominee": "Jane Doe",
  "policyDocument": "/documents/policy-001.pdf"
}
```

### Purchase Policy
Creates a new insurance policy.

**Endpoint:** `POST /api/policies/purchase`  
**Authentication:** Required  
**Request Body:**
```json
{
  "type": "Life Insurance",
  "planName": "Term Life Plan",
  "coverage": "5000000",
  "premium": "850",
  "tenure": 20,
  "nominee": "Jane Doe",
  "personalDetails": {
    "name": "John Doe",
    "dateOfBirth": "1990-05-15",
    "gender": "Male"
  }
}
```
**Response:**
```json
{
  "success": true,
  "policyId": "POL-xyz123",
  "policyNumber": "SI-2025-123456",
  "message": "Policy purchased successfully"
}
```

---

## 📝 Claims APIs

### Get User Claims
Retrieves all claims for the current user.

**Endpoint:** `GET /api/claims`  
**Authentication:** Required  
**Response:**
```json
{
  "claims": [
    {
      "id": "CLM-001",
      "claimNumber": "CLM-2025-001",
      "policyNumber": "SI-2024-005678",
      "type": "Car Insurance",
      "amount": "₹45,000",
      "claimedAmount": "₹45,000",
      "approvedAmount": "₹45,000",
      "status": "approved",
      "submittedDate": "2025-09-15",
      "approvedDate": "2025-10-01",
      "description": "Accident damage to front bumper",
      "documents": ["accident-report.pdf", "repair-estimate.pdf"]
    }
  ]
}
```

**Claim Status Values:**
- `pending` - Claim is under review
- `approved` - Claim has been approved
- `rejected` - Claim has been rejected
- `review` - Claim needs additional review
- `processing` - Payment is being processed

### Get Claim Details
Retrieves details of a specific claim.

**Endpoint:** `GET /api/claims/:id`  
**Authentication:** Required  
**URL Parameters:**
- `id` (string): Claim ID

### Submit Claim
Submits a new insurance claim.

**Endpoint:** `POST /api/claims/submit`  
**Authentication:** Required  
**Request Body:**
```json
{
  "policyId": "POL-001",
  "claimType": "Health Insurance",
  "amount": "75000",
  "description": "Hospitalization for surgery",
  "incidentDate": "2025-10-15",
  "documents": ["medical-bill.pdf", "discharge-summary.pdf"]
}
```
**Response:**
```json
{
  "success": true,
  "claimId": "CLM-xyz789",
  "claimNumber": "CLM-2025-456",
  "message": "Claim submitted successfully"
}
```

### Update Claim
Updates a claim (add documents, comments, etc.).

**Endpoint:** `PUT /api/claims/:id`  
**Authentication:** Required  
**Request Body:**
```json
{
  "additionalDocuments": ["new-document.pdf"],
  "comments": "Additional information requested"
}
```

---

## 📊 Activity APIs

### Get User Activities
Retrieves recent user activities.

**Endpoint:** `GET /api/user/activities`  
**Authentication:** Required  
**Response:**
```json
{
  "activities": [
    {
      "id": "ACT-001",
      "date": "2025-10-12",
      "description": "Premium payment successful for Life Insurance",
      "type": "payment",
      "amount": "₹850"
    },
    {
      "id": "ACT-002",
      "date": "2025-10-08",
      "description": "New policy purchased - Life Insurance",
      "type": "policy",
      "policyId": "POL-001"
    }
  ]
}
```

**Activity Types:**
- `payment` - Premium payment made
- `policy` - Policy purchased or updated
- `claim` - Claim submitted or updated
- `health` - Health check-up or medical activity

---

## 🔔 Notification APIs

### Get Notifications
Retrieves user notifications.

**Endpoint:** `GET /api/notifications`  
**Authentication:** Required  
**Response:**
```json
{
  "notifications": [
    {
      "id": "NOT-001",
      "message": "Car insurance renewal due in 30 days",
      "time": "2 hours ago",
      "type": "warning",
      "read": false,
      "policyId": "POL-002"
    }
  ]
}
```

**Notification Types:**
- `warning` - Warning or alert
- `success` - Success message
- `info` - Informational message
- `error` - Error or failure message

### Mark Notification as Read
Marks a notification as read.

**Endpoint:** `PUT /api/notifications/:id/read`  
**Authentication:** Required  
**URL Parameters:**
- `id` (string): Notification ID

---

## 👨‍💼 Admin APIs

### Get Admin Statistics
Fetches admin dashboard statistics.

**Endpoint:** `GET /api/admin/stats`  
**Authentication:** Required (Admin only)  
**Response:**
```json
{
  "totalUsers": 12458,
  "activePolicies": 8234,
  "claimsProcessed": 1456,
  "revenue": "₹45.2M",
  "userGrowth": 12.5,
  "policyGrowth": 8.2,
  "claimsGrowth": 15.3,
  "revenueGrowth": 18.7
}
```

### Get Admin Claims
Fetches all claims for admin review.

**Endpoint:** `GET /api/admin/claims`  
**Authentication:** Required (Admin only)  
**Query Parameters:**
- `status` (optional): Filter by claim status
- `type` (optional): Filter by insurance type
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page

**Response:**
```json
{
  "claims": [
    {
      "id": "CLM-001",
      "claimNumber": "CLM-2025-001",
      "userName": "Rajesh Kumar",
      "userEmail": "rajesh.kumar@example.com",
      "type": "Health",
      "amount": "₹50,000",
      "status": "pending",
      "submittedDate": "2 hours ago",
      "policyNumber": "SI-2024-123456"
    }
  ]
}
```

### Get Admin Users
Fetches all users for admin management.

**Endpoint:** `GET /api/admin/users`  
**Authentication:** Required (Admin only)  
**Query Parameters:**
- `status` (optional): Filter by user status
- `kycStatus` (optional): Filter by KYC status
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "users": [
    {
      "id": "USER-001",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91 98765 43210",
      "policies": 3,
      "totalPremium": "₹2,808/month",
      "joinedDate": "2 days ago",
      "status": "active",
      "kycStatus": "verified"
    }
  ]
}
```

### Approve Claim
Approves a claim.

**Endpoint:** `PUT /api/admin/claims/:id/approve`  
**Authentication:** Required (Admin only)  
**Request Body:**
```json
{
  "approvedAmount": "45000",
  "comments": "Claim approved after verification"
}
```

### Reject Claim
Rejects a claim.

**Endpoint:** `PUT /api/admin/claims/:id/reject`  
**Authentication:** Required (Admin only)  
**Request Body:**
```json
{
  "reason": "Insufficient documentation"
}
```

---

## 🌐 Public APIs (No Authentication Required)

### Get Testimonials
Fetches customer testimonials.

**Endpoint:** `GET /api/public/testimonials`  
**Authentication:** Not required  
**Response:**
```json
{
  "testimonials": [
    {
      "id": "TEST-001",
      "name": "Sarah Johnson",
      "role": "Life Insurance Customer",
      "content": "SecureInsure made the process so simple!",
      "rating": 5,
      "image": "https://example.com/image.jpg",
      "location": "Mumbai, Maharashtra"
    }
  ]
}
```

### Get Platform Statistics
Fetches platform statistics for homepage.

**Endpoint:** `GET /api/public/stats`  
**Authentication:** Not required  
**Response:**
```json
{
  "happyCustomers": "500K+",
  "claimsSettled": "₹1000Cr+",
  "satisfactionRate": "98%",
  "supportAvailability": "24/7"
}
```

### Request Quote
Requests a quote for insurance.

**Endpoint:** `POST /api/public/quote`  
**Authentication:** Not required  
**Request Body:**
```json
{
  "type": "Life Insurance",
  "coverage": "5000000",
  "age": 30,
  "gender": "Male",
  "smoker": false,
  "tenure": 20
}
```
**Response:**
```json
{
  "success": true,
  "quoteId": "QTE-xyz456",
  "estimatedPremium": "₹850/month",
  "message": "Quote generated successfully"
}
```

---

## 📎 Document APIs

### Upload Document
Uploads a document.

**Endpoint:** `POST /api/documents/upload`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`  
**Request Body:**
- `file` (File): Document file
- `documentType` (string): Type of document (e.g., "aadhar", "pan", "policy")

**Response:**
```json
{
  "success": true,
  "documentId": "DOC-abc123",
  "fileName": "aadhar.pdf",
  "fileUrl": "/documents/aadhar.pdf",
  "message": "Document uploaded successfully"
}
```

### Get Document
Fetches a document by ID.

**Endpoint:** `GET /api/documents/:id`  
**Authentication:** Required  
**URL Parameters:**
- `id` (string): Document ID

**Response:**
```json
{
  "documentId": "DOC-abc123",
  "fileName": "document.pdf",
  "fileUrl": "/documents/document.pdf",
  "uploadedDate": "2025-10-15",
  "fileSize": "2.5 MB"
}
```

---

## 💳 Payment APIs

### Initiate Payment
Initiates a payment for premium or other charges.

**Endpoint:** `POST /api/payments/initiate`  
**Authentication:** Required  
**Request Body:**
```json
{
  "amount": "850",
  "policyId": "POL-001",
  "paymentMethod": "UPI",
  "returnUrl": "https://secureinsure.com/payment/success"
}
```
**Response:**
```json
{
  "success": true,
  "paymentId": "PAY-xyz789",
  "orderId": "ORD-abc456",
  "amount": "850",
  "paymentUrl": "https://payment.secureinsure.com/pay/xyz123"
}
```

### Get Payment Status
Checks the status of a payment.

**Endpoint:** `GET /api/payments/:id/status`  
**Authentication:** Required  
**URL Parameters:**
- `id` (string): Payment ID

**Response:**
```json
{
  "paymentId": "PAY-xyz789",
  "status": "success",
  "amount": "₹850",
  "transactionId": "TXN-123456",
  "paidDate": "2025-10-12T10:30:00Z"
}
```

**Payment Status Values:**
- `pending` - Payment initiated but not completed
- `success` - Payment successful
- `failed` - Payment failed
- `cancelled` - Payment cancelled by user

### Get Payment History
Fetches payment history for the user.

**Endpoint:** `GET /api/payments/history`  
**Authentication:** Required  
**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:**
```json
{
  "payments": [
    {
      "id": "PAY-001",
      "amount": "₹850",
      "policyNumber": "SI-2025-001234",
      "policyType": "Life Insurance",
      "status": "success",
      "date": "2025-10-12",
      "transactionId": "TXN-123456789"
    }
  ]
}
```

---

## Error Responses

All API endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Rate Limiting

- **Rate Limit:** 100 requests per minute per IP
- **Header:** `X-RateLimit-Remaining` - Shows remaining requests
- **Reset:** Rate limit resets every minute

---

## Notes

1. All dates are in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)
2. All monetary values are in Indian Rupees (₹)
3. File uploads have a maximum size limit of 10MB
4. Supported document formats: PDF, JPG, PNG
5. All API responses include appropriate HTTP status codes
6. Timestamps are in UTC timezone

---

## Testing

For testing purposes, use the mock API layer provided in `/services/api.ts`. This simulates all API endpoints with realistic delays and data.

To switch to the real backend:
1. Update `API_BASE_URL` in `/services/api.ts`
2. Replace `mockApiCall` with actual `fetch` or `axios` calls
3. Add proper error handling and authentication token management
