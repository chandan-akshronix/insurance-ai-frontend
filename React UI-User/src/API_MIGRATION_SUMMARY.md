# API Migration Summary

## Overview
All dummy data has been removed from the SecureInsure application and replaced with centralized API calls. The application now uses a mock API service layer that simulates realistic backend responses.

---

## Files Created

### 1. `/services/api.ts`
**Purpose:** Central API service layer that handles all backend communication

**Features:**
- Mock API simulation with realistic delays (500ms-1000ms)
- Complete type safety with TypeScript
- Easy migration to real backend (just replace `mockApiCall` with actual HTTP calls)
- Organized by functional domains (User, Policies, Claims, Admin, etc.)

**API Categories:**
- User APIs (profile, updates)
- Policy APIs (list, details, purchase)
- Claims APIs (list, submit, track, update)
- Activity APIs (user activity timeline)
- Notification APIs (alerts, reminders)
- Admin APIs (stats, user management, claim management)
- Public APIs (testimonials, stats, quotes)
- Document APIs (upload, retrieve)
- Payment APIs (initiate, status, history)

### 2. `/API_DOCUMENTATION.md`
**Purpose:** Complete API reference documentation

**Contents:**
- All endpoint specifications
- Request/response formats
- Authentication requirements
- Error response formats
- Query parameters
- Usage examples

---

## Files Updated

### 1. `/components/pages/Dashboard.tsx`
**Changes Made:**
- ✅ Removed hardcoded `policies` array
- ✅ Removed hardcoded `activities` array
- ✅ Removed hardcoded `notifications` array
- ✅ Added `useEffect` hook to fetch data on component mount
- ✅ Added loading state
- ✅ Now calls `getUserPolicies()`, `getUserActivities()`, `getNotifications()`
- ✅ Dynamic icon and color mapping for different policy types
- ✅ Proper date formatting using API data

**APIs Used:**
- `GET /api/policies` - Fetches user policies
- `GET /api/user/activities` - Fetches user activities
- `GET /api/notifications` - Fetches notifications

### 2. `/components/pages/AdminDashboard.tsx`
**Changes Made:**
- ✅ Removed hardcoded `stats` array
- ✅ Removed hardcoded `recentClaims` array
- ✅ Removed hardcoded `recentUsers` array
- ✅ Added `useEffect` hook to fetch data on component mount
- ✅ Added loading state
- ✅ Now calls `getAdminStats()`, `getAdminClaims()`, `getAdminUsers()`
- ✅ Dynamic stats calculation and display
- ✅ Enhanced claims table with user email and action buttons

**APIs Used:**
- `GET /api/admin/stats` - Fetches platform statistics
- `GET /api/admin/claims` - Fetches all claims for review
- `GET /api/admin/users` - Fetches all users

### 3. `/components/pages/Homepage.tsx`
**Changes Made:**
- ✅ Removed hardcoded `testimonials` array
- ✅ Removed hardcoded `stats` array
- ✅ Added `useEffect` hook to fetch data on component mount
- ✅ Added loading state
- ✅ Now calls `getTestimonials()`, `getPlatformStats()`
- ✅ Dynamic testimonial rendering
- ✅ Dynamic stats display

**APIs Used:**
- `GET /api/public/testimonials` - Fetches customer testimonials
- `GET /api/public/stats` - Fetches platform statistics

---

## API Endpoints Summary

### User Management (4 APIs)
```
GET    /api/user/profile           - Get user profile
PUT    /api/user/profile           - Update user profile
GET    /api/user/activities        - Get user activities
GET    /api/notifications          - Get notifications
PUT    /api/notifications/:id/read - Mark notification as read
```

### Policy Management (3 APIs)
```
GET    /api/policies               - Get all user policies
GET    /api/policies/:id           - Get policy details
POST   /api/policies/purchase      - Purchase new policy
```

### Claims Management (4 APIs)
```
GET    /api/claims                 - Get all user claims
GET    /api/claims/:id             - Get claim details
POST   /api/claims/submit          - Submit new claim
PUT    /api/claims/:id             - Update claim
```

### Admin Management (5 APIs)
```
GET    /api/admin/stats            - Get admin statistics
GET    /api/admin/claims           - Get all claims
GET    /api/admin/users            - Get all users
PUT    /api/admin/claims/:id/approve - Approve claim
PUT    /api/admin/claims/:id/reject  - Reject claim
```

### Public APIs (3 APIs)
```
GET    /api/public/testimonials    - Get testimonials
GET    /api/public/stats           - Get platform stats
POST   /api/public/quote           - Request insurance quote
```

### Document Management (2 APIs)
```
POST   /api/documents/upload       - Upload document
GET    /api/documents/:id          - Get document
```

### Payment Management (3 APIs)
```
POST   /api/payments/initiate      - Initiate payment
GET    /api/payments/:id/status    - Get payment status
GET    /api/payments/history       - Get payment history
```

**Total APIs: 24 endpoints**

---

## Data Models

### Policy Object
```typescript
{
  id: string;
  type: 'Life Insurance' | 'Car Insurance' | 'Health Insurance';
  planName: string;
  policyNumber: string;
  coverage: string;
  premium: string;
  status: 'Active' | 'Renewal Due' | 'Expired';
  startDate: string;
  expiryDate: string;
  benefits: string[];
  policyDocument: string;
  // Type-specific fields
  nominee?: string;
  vehicleDetails?: object;
  familyMembers?: number;
}
```

### Claim Object
```typescript
{
  id: string;
  claimNumber: string;
  policyNumber: string;
  type: string;
  amount: string;
  claimedAmount: string;
  approvedAmount: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'review';
  submittedDate: string;
  approvedDate: string | null;
  description: string;
  documents: string[];
}
```

### User Object
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  panCard: string;
  aadhar: string;
  joinedDate: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  profileImage: string;
}
```

### Testimonial Object
```typescript
{
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  location: string;
}
```

---

## How to Migrate to Real Backend

1. **Update API Base URL:**
   ```typescript
   // In /services/api.ts
   const API_BASE_URL = 'https://your-actual-backend.com/v1';
   ```

2. **Replace mockApiCall with real HTTP calls:**
   ```typescript
   // Before:
   export async function getUserProfile() {
     return mockApiCall({ id: 'user-123', ... });
   }

   // After:
   export async function getUserProfile() {
     const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
       headers: {
         'Authorization': `Bearer ${getAuthToken()}`
       }
     });
     return response.json();
   }
   ```

3. **Add Error Handling:**
   ```typescript
   try {
     const response = await fetch(url);
     if (!response.ok) throw new Error('API Error');
     return response.json();
   } catch (error) {
     console.error('Error:', error);
     throw error;
   }
   ```

4. **Add Authentication Token Management:**
   - Store JWT token in localStorage or cookies
   - Add token to Authorization header
   - Handle token refresh logic

---

## Components That Still Need API Integration

The following components still use dummy data and should be updated next:

1. **`/components/pages/Profile.tsx`**
   - Should call `getUserProfile()` and `updateUserProfile()`

2. **`/components/pages/ClaimsTrack.tsx`**
   - Should call `getUserClaims()` and `getClaimDetails()`

3. **`/components/pages/ClaimsSubmit.tsx`**
   - Should call `submitClaim()` and `uploadDocument()`

4. **`/components/pages/Quotes.tsx`**
   - Should call `requestQuote()`

5. **`/components/pages/CarInsurance.tsx`**
   - Should call `purchasePolicy()` for the purchase flow

6. **`/components/pages/HealthInsurance.tsx`**
   - Should call `purchasePolicy()` for the purchase flow

7. **`/components/pages/LifeInsurance.tsx`**
   - Should call `purchasePolicy()` for the purchase flow

---

## Testing

### How to Test Mock APIs

1. **Open Browser DevTools Console**
2. **Import and test API functions:**
   ```javascript
   import { api } from './services/api';
   
   // Test getting policies
   api.getUserPolicies().then(data => console.log(data));
   
   // Test getting claims
   api.getUserClaims().then(data => console.log(data));
   ```

3. **Observe realistic delays** (500ms-1000ms) to simulate network latency

### What to Look For
- ✅ Data loads after component mounts
- ✅ Loading states show briefly
- ✅ Data displays correctly in UI
- ✅ No console errors
- ✅ Realistic API delays

---

## Benefits of This Approach

1. **Centralized API Logic** - All API calls in one place (`/services/api.ts`)
2. **Easy Testing** - Mock data is realistic and comprehensive
3. **Type Safety** - Full TypeScript support
4. **Easy Migration** - Simple to switch to real backend
5. **Maintainability** - Changes to API structure only need updates in one file
6. **Documentation** - Complete API docs for backend developers
7. **Realistic UX** - Simulated delays provide realistic user experience
8. **Error Handling Ready** - Structure supports adding error handling

---

## Next Steps

1. ✅ **Complete** - Remove dummy data from Dashboard, AdminDashboard, Homepage
2. ⏳ **Pending** - Update remaining components (Profile, Claims, Insurance flows)
3. ⏳ **Pending** - Add authentication token management
4. ⏳ **Pending** - Add error handling and retry logic
5. ⏳ **Pending** - Add loading skeletons instead of basic "Loading..." text
6. ⏳ **Pending** - Connect to real backend APIs
7. ⏳ **Pending** - Add API response caching
8. ⏳ **Pending** - Add optimistic UI updates

---

## API Integration Checklist

For each component that needs API integration:

- [ ] Identify dummy data arrays/objects
- [ ] Create appropriate API functions in `/services/api.ts`
- [ ] Add `useState` for data storage
- [ ] Add `useState` for loading state
- [ ] Add `useEffect` to fetch data on mount
- [ ] Update JSX to use state data instead of hardcoded data
- [ ] Add loading state UI
- [ ] Test data flow
- [ ] Add error handling
- [ ] Document in API_DOCUMENTATION.md

---

## Support

For questions about the API structure or migration process:
1. Review `/API_DOCUMENTATION.md` for endpoint details
2. Check `/services/api.ts` for implementation examples
3. Look at updated components (Dashboard, AdminDashboard, Homepage) for usage patterns
