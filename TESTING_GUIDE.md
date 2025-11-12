# Testing Guide - Phase 1 Components

**Date**: November 11, 2024  
**Purpose**: Verify all Phase 1 components work correctly with real backend APIs

---

## 🚀 Quick Start

### Step 1: Start Backend Server

```bash
cd "Innsurance Backend Fast API"
uvicorn main:app --reload
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify**:
- Open: `http://localhost:8000/health` - Should show: `{"status":"healthy","database":"connected"}`
- Open: `http://localhost:8000/docs` - Should show Swagger UI

---

### Step 2: Start Frontend Server

```bash
cd "React UI-User"
npm run dev
```

**Expected Output**:
```
VITE v6.3.5  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Note**: Port may be 5173 or 3000 depending on Vite config.

---

## 🧪 Component Testing

### Test 1: Profile.tsx

**URL**: `http://localhost:5173/profile`

**Test Cases**:

1. ✅ **Loading State**
   - Open page
   - Should see loading spinner briefly
   - Should see "Loading policies..." and "Loading claims..."

2. ✅ **With Data** (if backend has data)
   - Navigate to "My Policies" tab
   - Should see user's policies listed
   - Each policy should show: type, policyNumber, status, expiryDate, premium
   - Should see "Recent Claims" section with claims
   - Each claim should show: id, type, date, status, amount

3. ✅ **Empty State** (if backend has no data)
   - Navigate to "My Policies" tab
   - Should see shield icon
   - Should see "No Policies Found" message
   - Should see "Browse Insurance Plans" button
   - Click button → should navigate to insurance page
   - Should see "No Claims Found" in Recent Claims
   - Should see "Submit a Claim" button

4. ✅ **Error Handling**
   - Stop backend server
   - Reload page
   - Should see toast error: "Failed to load policies" and "Failed to load claims"
   - Should show empty state (0 items)

**Network Tab Check**:
- Should see API calls to:
  - `GET http://localhost:8000/policy/user/1` (or actual userId)
  - `GET http://localhost:8000/claims/user/1`

---

### Test 2: ClaimsTrack.tsx

**URL**: `http://localhost:5173/claims/track`

**Test Cases**:

1. ✅ **Loading State**
   - Open page
   - Should see loading spinner briefly
   - Should see "Loading claims..."

2. ✅ **With Data** (if backend has claims)
   - Should see list of claims in "All" tab
   - Each claim shows: claimNumber, policyNumber, type badge, status, amount, dates
   - Test "Pending" tab → filters pending/under-review claims
   - Test "Approved" tab → filters approved claims
   - Test "Settled" tab → filters settled claims

3. ✅ **Search Functionality**
   - Type claim number in search box
   - Click search
   - Should filter results
   - Should show toast if found/not found

4. ✅ **Empty State** (if no claims)
   - Should see FileText icon
   - Should see "No Claims Found" message
   - Should see "Submit Your First Claim" button

5. ✅ **Claim Details**
   - Click on any claim card
   - Should open modal/dialog with full details
   - Should show timeline (even if basic)
   - Should show documents (even if empty)

**Network Tab Check**:
- Should see API call to: `GET http://localhost:8000/claims/user/1`

---

### Test 3: ClaimsSubmit.tsx

**URL**: `http://localhost:5173/claims/submit`

**Test Cases**:

1. ✅ **Claim Type Selection**
   - Select "Health Insurance" claim
   - Should proceed to policy selection
   - Dropdown should load health policies only

2. ✅ **Policy Loading - Health**
   - Select health claim type
   - Should see loading spinner in policy dropdown
   - Should see only health insurance policies in dropdown
   - If no health policies → should see "No health insurance policies found"

3. ✅ **Policy Loading - Life**
   - Go back, select life claim type
   - Should see only life insurance policies
   - If no life policies → should see empty state

4. ✅ **Policy Loading - Car**
   - Go back, select car claim type
   - Should see only car/vehicle insurance policies
   - If no car policies → should see empty state + "Get car insurance" button

5. ✅ **Policy Filtering**
   - Verify each claim type shows ONLY policies of that type
   - Health: policies with "health" in type
   - Life: policies with "life" in type
   - Car: policies with "vehicle" or "car" in type

6. ✅ **Error Handling**
   - Stop backend
   - Try to select claim type
   - Should see toast: "Failed to load policies"

**Network Tab Check**:
- Should see API call to: `GET http://localhost:8000/policy/user/1` (once on mount)

---

### Test 4: CarClaim.tsx

**URL**: `http://localhost:5173/claims/car`

**Test Cases**:

1. ✅ **Policy Dropdown Loading**
   - Open page (Step 1)
   - Should see loading spinner in policy dropdown
   - Should load only car insurance policies

2. ✅ **With Car Policies** (if backend has car policies)
   - Dropdown should show car policy names
   - Select a policy
   - Should display selected policy details
   - Should proceed through claim form

3. ✅ **Empty State** (if no car policies)
   - Should see "No car insurance policies found"
   - Should see "Get Car Insurance" button
   - Click button → navigate to `/car-insurance`

4. ✅ **Policy Display**
   - Selected policy should show:
     - Plan name OR "Policy Type - Policy Number"
     - This is because vehicle details (brand/model) may not be in backend yet

**Network Tab Check**:
- Should see API call to: `GET http://localhost:8000/policy/user/1`
- Should filter response to only car/vehicle policies

---

## 🐛 Troubleshooting

### Issue: "Loading..." never stops
**Cause**: Backend not running or wrong API URL  
**Fix**: 
1. Check backend is running: `http://localhost:8000/health`
2. Check console for CORS errors
3. Verify API_BASE_URL in api.ts points to `http://localhost:8000`

---

### Issue: Empty state shows even when data exists in backend
**Cause**: Data not matching expected format OR userId not resolving  
**Fix**:
1. Open browser DevTools → Network tab
2. Check API response data
3. Verify userId is correct (check localStorage 'user' object)
4. Check data mapping logic in component

---

### Issue: API calls return 404
**Cause**: Backend route not found  
**Fix**:
1. Check Swagger UI: `http://localhost:8000/docs`
2. Verify endpoint exists
3. Check if all routers are included in main.py

---

### Issue: CORS errors
**Cause**: Frontend origin not allowed  
**Fix**:
1. Check backend `main.py` CORS configuration
2. Ensure `http://localhost:5173` is in allowed origins (if using Vite)
3. Restart backend server after changes

---

### Issue: Data shows but format is wrong
**Cause**: Data mapping logic needs adjustment  
**Fix**:
1. Check API response in Network tab
2. Update data mapping in component's useEffect
3. Ensure field names match between API and component interface

---

## 📊 Expected API Responses

### GET /policy/user/{user_id}
```json
[
  {
    "policyId": 1,
    "userId": 1,
    "type": "Health Insurance",
    "planName": "Family Health Plus",
    "policyNumber": "POL20241111001234",
    "coverage": "500000",
    "premium": "₹2,000/month",
    "status": "Active",
    "startDate": "2024-01-01",
    "expiryDate": "2025-01-01",
    "benefits": ["hospitalization", "daycare"],
    "nominee": "John Doe"
  }
]
```

### GET /claims/user/{user_id}
```json
{
  "claims": [
    {
      "claimId": 1,
      "id": 1,
      "claimNumber": "CLM-000001",
      "userId": 1,
      "policyId": 1,
      "type": "Health",
      "amount": "₹50,000",
      "status": "pending",
      "description": "Medical treatment",
      "submittedDate": "2024-11-01"
    }
  ]
}
```

---

## ✅ Success Criteria

All 4 components should:
- ✅ Show loading state on initial load
- ✅ Fetch data from backend API
- ✅ Display data correctly formatted
- ✅ Show empty state when no data
- ✅ Handle errors gracefully
- ✅ Not crash or show undefined errors
- ✅ Filter/search functionality works (where applicable)

---

## 🎯 Quick Verification Commands

### Check if backend is running:
```bash
curl http://localhost:8000/health
```

### Check if policies exist for user 1:
```bash
curl http://localhost:8000/policy/user/1
```

### Check if claims exist for user 1:
```bash
curl http://localhost:8000/claims/user/1
```

### Create test user (if needed):
```bash
curl -X POST http://localhost:8000/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "address": "Test Address",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "panCard": "ABCDE1234F",
    "aadhar": "123456789012",
    "joinedDate": "2024-11-11",
    "kycStatus": "verified"
  }'
```

---

## 📈 Performance Notes

- All API calls use `useEffect` with empty dependency array → only fetch once on mount
- Loading states prevent multiple renders during fetch
- Error boundaries prevent crashes
- Toast notifications don't block UI

---

**Last Updated**: November 11, 2024  
**Testing Status**: Ready for execution

