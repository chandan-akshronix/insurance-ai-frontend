// Mock API Base URL - Replace with your actual backend URL
const API_BASE_URL = 'https://api.secureinsure.com/v1';

// Simulated API delay for realistic behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to simulate API calls
async function mockApiCall<T>(data: T, delayMs: number = 500): Promise<T> {
  await delay(delayMs);
  return data;
}

// ==================== USER APIs ====================

/**
 * GET /users/{userId}
 * Fetches the current user's profile information
 */
export async function getUserProfile(userId?: number | string) {
  const id = userId || localStorage.getItem('userId') || '1';
  return request<BackendUser>(`/users/${id}`).then(mapUser);
}

/**
 * PUT /users/{userId}
 * Updates user profile information
 */
export async function updateUserProfile(userId: number | string, payload: any) {
  return request(`/users/${userId}`, {
    method: 'PUT',
    body: payload,
  });
}

// ==================== POLICY APIs ====================

/**
 * GET /policy/user/{userId}
 * Fetches all policies for the current user
 */
export async function getUserPolicies(userId?: number | string) {
  const id = userId || localStorage.getItem('userId') || '1';
  
  console.log('🔍 [POLICIES] getUserPolicies called');
  console.log('🔍 [POLICIES] userId parameter:', userId);
  console.log('🔍 [POLICIES] localStorage userId:', localStorage.getItem('userId'));
  console.log('🔍 [POLICIES] Using userId:', id);
  console.log('🔍 [POLICIES] API URL:', `/policy/user/${id}`);
  
  try {
    const result = await request<any[]>(`/policy/user/${id}`);
    console.log('✅ [POLICIES] API call successful');
    console.log('✅ [POLICIES] Response type:', typeof result);
    console.log('✅ [POLICIES] Is array:', Array.isArray(result));
    console.log('✅ [POLICIES] Response length:', Array.isArray(result) ? result.length : 'N/A');
    console.log('✅ [POLICIES] Response data:', result);
    return result;
  } catch (error: any) {
    console.error('❌ [POLICIES] API call failed');
    console.error('❌ [POLICIES] Error:', error);
    console.error('❌ [POLICIES] Error status:', error.status);
    console.error('❌ [POLICIES] Error message:', error.message);
    throw error;
  }
}

/**
 * GET /policy/{policyId}
 * Fetches details of a specific policy
 */
export async function getPolicyDetails(policyId: string) {
  return request<any>(`/policy/${policyId}`);
}

/**
 * POST /policy/purchase
 * Creates a new insurance policy
 */
export async function purchasePolicy(policyData: any) {
  return request(`/policy/purchase`, {
    method: 'POST',
    body: policyData,
  });
}

// ==================== CLAIMS APIs ====================

/**
 * GET /claims/user/{userId}
 * Fetches all claims for the current user (PostgreSQL)
 */
export async function getUserClaims(userId?: number | string) {
  const id = userId || localStorage.getItem('userId') || '1';
  return request<any[]>(`/claims/user/${id}`);
}

/**
 * GET /claims/{claimId}
 * Fetches details of a specific claim (PostgreSQL)
 */
export async function getClaimDetails(claimId: string) {
  return request<any>(`/claims/${claimId}`);
}

/**
 * POST /claims/
 * Submits a new insurance claim (PostgreSQL - structured schema)
 */
export async function submitClaim(claimData: any) {
  return request(`/claims/`, {
    method: 'POST',
    body: claimData,
  });
}

/**
 * PUT /claims/{claimId}
 * Updates a claim (add documents, comments, etc.) (PostgreSQL)
 */
export async function updateClaim(claimId: string, updateData: any) {
  return request(`/claims/${claimId}`, {
    method: 'PUT',
    body: updateData,
  });
}

// ==================== CLAIMS APPLICATION APIs (MongoDB) ====================

/**
 * POST /claims/application
 * Creates a new claim application with flexible JSON payload (MongoDB)
 */
export async function createClaimApplication(payload: any) {
  return request(`/claims/application`, {
    method: 'POST',
    body: payload,
  });
}

/**
 * GET /claims/application/user/{userId}
 * Fetches all claim applications for the current user (MongoDB)
 */
export async function getUserClaimApplications(userId?: number | string) {
  const id = userId || localStorage.getItem('userId') || '1';
  return request<any[]>(`/claims/application/user/${id}`);
}

/**
 * GET /claims/application/{appId}
 * Fetches details of a specific claim application (MongoDB)
 */
export async function getClaimApplicationById(appId: string) {
  return request<any>(`/claims/application/${appId}`);
}

/**
 * PATCH /claims/application/{appId}
 * Updates a claim application (MongoDB)
 */
export async function updateClaimApplication(appId: string, payload: any) {
  return request(`/claims/application/${appId}`, {
    method: 'PATCH',
    body: payload,
  });
}

// ==================== ACTIVITY APIs ====================

/**
 * GET /activities/user/{userId}
 * Fetches recent user activities
 */
export async function getUserActivities(userId?: number | string) {
  const id = userId || localStorage.getItem('userId') || '1';
  return request<any[]>(`/activities/user/${id}`);
}

// ==================== NOTIFICATION APIs ====================

/**
 * GET /notifications/user/{userId}
 * Fetches user notifications
 */
export async function getNotifications(userId?: number | string, unreadOnly: boolean = false) {
  const id = userId || localStorage.getItem('userId') || '1';
  return request<any[]>(`/notifications/user/${id}?unread_only=${unreadOnly}`);
}

/**
 * PUT /notifications/{notificationId}/read
 * Marks a notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId?: number | string) {
  const id = userId || localStorage.getItem('userId') || '1';
  return request(`/notifications/${notificationId}/read`, {
    method: 'PUT',
    body: { userId: id },
  });
}

// ==================== ADMIN APIs ====================

/**
 * GET /public/stats
 * Fetches admin dashboard statistics
 */
export async function getAdminStats() {
  return request<any>(`/public/stats`);
}

/**
 * GET /claims/
 * Fetches all claims for admin review
 */
export async function getAdminClaims() {
  return request<any[]>(`/claims/`);
}

/**
 * GET /users/
 * Fetches all users for admin management
 */
export async function getAdminUsers() {
  return request<any[]>(`/users/`);
}

// Helper function for real API calls
async function request<T>(url: string, options: { method?: string; body?: any; skipAuth?: boolean } = {}): Promise<T> {
  const baseUrl = 'http://localhost:8000';
  const token = localStorage.getItem('token');
  
  const fullUrl = `${baseUrl}${url}`;
  console.log('🌐 [API] Making request to:', fullUrl);
  console.log('🌐 [API] Method:', options.method || 'GET');
  console.log('🌐 [API] Has token:', !!token);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(fullUrl, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    
    console.log('🌐 [API] Response status:', response.status);
    console.log('🌐 [API] Response ok:', response.ok);
    console.log('🌐 [API] Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Response error text:', errorText);
      const error: any = new Error(`API Error: ${response.statusText}`);
      error.status = response.status;
      error.body = errorText;
      throw error;
    }
    
    const data = await response.json();
    console.log('✅ [API] Response data:', data);
    console.log('✅ [API] Response data type:', typeof data);
    console.log('✅ [API] Is array:', Array.isArray(data));
    return data;
  } catch (error: any) {
    console.error('❌ [API] Request failed:', error);
    console.error('❌ [API] Error type:', error.constructor.name);
    console.error('❌ [API] Error details:', {
      message: error.message,
      status: error.status,
      body: error.body
    });
    throw error;
  }
}

// Type definitions
type KycStatus = 'pending' | 'verified';

interface BackendUser {
  userId?: number;
  id?: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  kycStatus: KycStatus;
  joinedDate?: string;
}

function mapUser(user: BackendUser) {
  return {
    id: user.userId || user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    address: user.address,
    kycStatus: user.kycStatus,
    joinedDate: user.joinedDate,
  };
}

export async function getUserByEmail(email: string) {
  const data = await request<BackendUser>(`/users/email/${encodeURIComponent(email)}`);
  return mapUser(data);
}

export interface UserCreatePayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string;
  panCard: string;
  aadhar: string;
  joinedDate: string; // YYYY-MM-DD
  kycStatus: KycStatus;
  profileImage?: string | null;
}

export async function createUser(payload: UserCreatePayload) {
  return request(`/users/`, {
    method: 'POST',
    body: payload,
  });
}

/**
 * PUT /claims/{claimId}/approve
 * Approves a claim
 */
export async function approveClaim(claimId: string, approvedAmount?: number | string) {
  return request(`/claims/${claimId}/approve`, {
    method: 'PUT',
    body: { approvedAmount },
  });
}

/**
 * PUT /claims/{claimId}/reject
 * Rejects a claim
 */
export async function rejectClaim(claimId: string, reason?: string) {
  return request(`/claims/${claimId}/reject`, {
    method: 'PUT',
    body: { reason },
  });
}

// ==================== HOMEPAGE/PUBLIC APIs ====================

/**
 * GET /public/testimonials
 * Fetches customer testimonials
 */
export async function getTestimonials() {
  return request<any[]>(`/public/testimonials`);
}

/**
 * GET /public/stats
 * Fetches platform statistics
 */
export async function getPlatformStats() {
  return request<any>(`/public/stats`);
}

/**
 * POST /quotation/request
 * Requests a quote for insurance
 */
export async function requestQuote(quoteData: any) {
  return request(`/quotation/request`, {
    method: 'POST',
    body: quoteData,
  });
}

// ==================== DOCUMENT APIs ====================

/**
 * POST /documents/upload
 * Uploads a document
 */
export async function uploadDocument(
  file: File,
  documentType: string,
  userId?: number | string,
  policyId?: number | string,
  claimId?: number | string,
  onProgress?: (percent: number) => void,
  category?: string
) {
  // Log documentType before sending to backend
  console.log('[DOCUMENT_UPLOAD] Frontend - Sending documentType:', documentType, 'for file:', file.name, 'userId:', userId, 'category:', category);
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentType', documentType);
  formData.append('userId', String(userId || localStorage.getItem('userId') || '1'));
  if (policyId) formData.append('policyId', String(policyId));
  if (claimId) formData.append('claimId', String(claimId));
  if (category) formData.append('category', category);

  const baseUrl = 'http://localhost:8000';

  return new Promise<any>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${baseUrl}/documents/upload`);
    
    xhr.onload = () => {
      console.log(`[DOCUMENT_UPLOAD] API Response status: ${xhr.status}`);
      console.log(`[DOCUMENT_UPLOAD] API Response text:`, xhr.responseText);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          console.log(`[DOCUMENT_UPLOAD] Parsed response:`, json);
          
          // Validate response has required fields
          if (!json.fileUrl && !json.fileurl) {
            console.error(`[DOCUMENT_UPLOAD] Response missing fileUrl:`, json);
            reject(new Error('Server response missing file URL'));
            return;
          }
          
          resolve(json);
        } catch (e) {
          console.error(`[DOCUMENT_UPLOAD] Failed to parse response:`, e);
          console.error(`[DOCUMENT_UPLOAD] Response text:`, xhr.responseText);
          reject(new Error('Invalid response from server'));
        }
      } else {
        // Try to parse error response
        let errorMessage = xhr.statusText || 'Upload failed';
        try {
          const errorJson = JSON.parse(xhr.responseText);
          errorMessage = errorJson.detail || errorJson.message || errorMessage;
        } catch (e) {
          // Use status text if JSON parsing fails
        }
        console.error(`[DOCUMENT_UPLOAD] Upload failed with status ${xhr.status}:`, errorMessage);
        reject(new Error(errorMessage));
      }
    };
    
    xhr.onerror = () => {
      console.error(`[DOCUMENT_UPLOAD] Network error during upload`);
      reject(new Error('Network error: Unable to connect to server'));
    };
    
    xhr.ontimeout = () => {
      console.error(`[DOCUMENT_UPLOAD] Upload timeout`);
      reject(new Error('Upload timeout: Please try again'));
    };
    
    // Set timeout (30 seconds)
    xhr.timeout = 30000;
    
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }
    
    xhr.send(formData);
  });
}

/**
 * GET /documents/{documentId}
 * Fetches a document by ID
 */
export async function getDocument(documentId: string) {
  return request<any>(`/documents/${documentId}`);
}

// ==================== PAYMENT APIs ====================

/**
 * POST /payments/
 * Initiates a payment
 */
export async function initiatePayment(paymentData: any) {
  return request(`/payments/`, {
    method: 'POST',
    body: paymentData,
  });
}

/**
 * GET /payments/{paymentId}
 * Checks payment status
 */
export async function getPaymentStatus(paymentId: string) {
  return request<any>(`/payments/${paymentId}`);
}

/**
 * GET /payments/history/{userId}
 * Fetches payment history
 */
export async function getPaymentHistory(userId?: number | string) {
  const id = userId || localStorage.getItem('userId') || '1';
  return request<any[]>(`/payments/history/${id}`);
}

// ==================== LIFE INSURANCE APPLICATION APIs ====================

export async function createLifeApplication(payload: any) {
  return request(`/life-insurance/`, {
    method: 'POST',
    body: payload,
  });
}

export async function getUserLifeApplications(userId?: number | string) {
  const id = userId || localStorage.getItem('userId') || '1';
  return request<any[]>(`/life-insurance/user/${id}`);
}

export async function getLifeApplicationById(appId: string) {
  return request<any>(`/life-insurance/${appId}`);
}

export async function updateLifeApplication(appId: string, payload: any) {
  return request(`/life-insurance/${appId}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function getProducts() {
  try {
    const data = await request<any[]>(`/products/`);
    return data;
  } catch (error) {
    // Fallback to mock data if API fails
    return mockApiCall([]);
  }
}

export async function getProductsByCategory(category: string) {
  try {
    const data = await request<any[]>(`/products/category/${category}`);
    return data;
  } catch (error) {
    // Fallback to mock data if API fails
    return mockApiCall([]);
  }
}

export async function login(email: string, password: string) {
  const data = await request<any>(`/auth/login`, {
    method: 'POST',
    body: { email, password },
    skipAuth: true  // Don't send auth token for login request
  });
  return data;
}

export const api = {
  // User
  getUserProfile,
  updateUserProfile,
  
  // Policies
  getUserPolicies,
  getPolicyDetails,
  purchasePolicy,
  
  // Claims (PostgreSQL)
  getUserClaims,
  getClaimDetails,
  submitClaim,
  updateClaim,
  
  // Claims Applications (MongoDB)
  createClaimApplication,
  getUserClaimApplications,
  getClaimApplicationById,
  updateClaimApplication,
  
  // Activities
  getUserActivities,
  
  // Notifications
  getNotifications,
  markNotificationAsRead,
  
  // Admin
  getAdminStats,
  getAdminClaims,
  getAdminUsers,
  approveClaim,
  rejectClaim,
  
  // Public
  getTestimonials,
  getPlatformStats,
  requestQuote,
  
  // Documents
  uploadDocument,
  getDocument,
  
  // Payments
  initiatePayment,
  getPaymentStatus,
  getPaymentHistory,
  getProducts,
  getProductsByCategory,
  // Life Insurance Applications
  createLifeApplication,
  getUserLifeApplications,
  getLifeApplicationById,
  updateLifeApplication,
  login,
  getUserByEmail,
  createUser
};
