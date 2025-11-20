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
 * GET /api/user/profile
 * Fetches the current user's profile information
 */
export async function getUserProfile() {
  return mockApiCall({
    id: 'user-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    address: '123 Main Street, Mumbai, Maharashtra 400001',
    dateOfBirth: '1990-05-15',
    gender: 'Male',
    panCard: 'ABCDE1234F',
    aadhar: '1234 5678 9012',
    joinedDate: '2024-01-15',
    kycStatus: 'verified',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
  });
}

/**
 * PUT /api/user/profile
 * Updates user profile information
 */
export async function updateUserProfile(data: any) {
  return mockApiCall({ success: true, message: 'Profile updated successfully' });
}

// ==================== POLICY APIs ====================

/**
 * GET /api/policies
 * Fetches all policies for the current user
 */
export async function getUserPolicies() {
  return mockApiCall({
    policies: [
      {
        id: 'POL-001',
        type: 'Life Insurance',
        planName: 'HDFC Click 2 Protect Plus',
        policyNumber: 'SI-2025-001234',
        coverage: '₹50,00,000',
        premium: '₹850/month',
        status: 'Active',
        startDate: '2024-10-14',
        expiryDate: '2045-10-14',
        benefits: ['Death Benefit', 'Terminal Illness', 'Accidental Death'],
        nominee: 'Jane Doe',
        policyDocument: '/documents/policy-001.pdf'
      },
      {
        id: 'POL-002',
        type: 'Car Insurance',
        planName: 'Comprehensive Car Cover',
        policyNumber: 'SI-2024-005678',
        coverage: '₹8,50,000',
        premium: '₹708/month',
        status: 'Active',
        startDate: '2024-03-20',
        expiryDate: '2025-03-20',
        benefits: ['Own Damage', 'Third Party', 'Zero Depreciation'],
        vehicleDetails: {
          make: 'Maruti Suzuki',
          model: 'Swift',
          year: 2022,
          registrationNumber: 'MH-01-AB-1234'
        },
        policyDocument: '/documents/policy-002.pdf'
      },
      {
        id: 'POL-003',
        type: 'Health Insurance',
        planName: 'Family Floater Plan',
        policyNumber: 'SI-2024-009012',
        coverage: '₹10,00,000',
        premium: '₹1,250/month',
        status: 'Renewal Due',
        startDate: '2024-11-05',
        expiryDate: '2025-11-05',
        benefits: ['Hospitalization', 'Pre/Post Hospitalization', 'Day Care'],
        familyMembers: 4,
        policyDocument: '/documents/policy-003.pdf'
      }
    ]
  });
}

/**
 * GET /api/policies/:id
 * Fetches details of a specific policy
 */
export async function getPolicyDetails(policyId: string) {
  const allPolicies = await getUserPolicies();
  const policy = allPolicies.policies.find(p => p.id === policyId);
  return mockApiCall(policy);
}

/**
 * POST /api/policies/purchase
 * Creates a new insurance policy
 */
export async function purchasePolicy(policyData: any) {
  return mockApiCall({
    success: true,
    policyId: 'POL-' + Math.random().toString(36).substr(2, 9),
    message: 'Policy purchased successfully',
    policyNumber: 'SI-2025-' + Math.floor(100000 + Math.random() * 900000)
  });
}

// ==================== CLAIMS APIs ====================

/**
 * GET /api/claims
 * Fetches all claims for the current user
 */
export async function getUserClaims() {
  return mockApiCall({
    claims: [
      {
        id: 'CLM-001',
        claimNumber: 'CLM-2025-001',
        policyNumber: 'SI-2024-005678',
        type: 'Car Insurance',
        amount: '₹45,000',
        claimedAmount: '₹45,000',
        approvedAmount: '₹45,000',
        status: 'approved',
        submittedDate: '2025-09-15',
        approvedDate: '2025-10-01',
        description: 'Accident damage to front bumper',
        documents: ['accident-report.pdf', 'repair-estimate.pdf']
      },
      {
        id: 'CLM-002',
        claimNumber: 'CLM-2025-002',
        policyNumber: 'SI-2024-009012',
        type: 'Health Insurance',
        amount: '₹75,000',
        claimedAmount: '₹75,000',
        approvedAmount: null,
        status: 'pending',
        submittedDate: '2025-10-20',
        approvedDate: null,
        description: 'Hospitalization for surgery',
        documents: ['medical-bills.pdf', 'discharge-summary.pdf']
      }
    ]
  });
}

/**
 * GET /api/claims/:id
 * Fetches details of a specific claim
 */
export async function getClaimDetails(claimId: string) {
  const allClaims = await getUserClaims();
  const claim = allClaims.claims.find(c => c.id === claimId);
  return mockApiCall(claim);
}

/**
 * POST /api/claims/submit
 * Submits a new insurance claim
 */
export async function submitClaim(claimData: any) {
  return mockApiCall({
    success: true,
    claimId: 'CLM-' + Math.random().toString(36).substr(2, 9),
    claimNumber: 'CLM-2025-' + Math.floor(100 + Math.random() * 900),
    message: 'Claim submitted successfully'
  });
}

/**
 * PUT /api/claims/:id
 * Updates a claim (add documents, comments, etc.)
 */
export async function updateClaim(claimId: string, updateData: any) {
  return mockApiCall({
    success: true,
    message: 'Claim updated successfully'
  });
}

// ==================== ACTIVITY APIs ====================

/**
 * GET /api/user/activities
 * Fetches recent user activities
 */
export async function getUserActivities() {
  return mockApiCall({
    activities: [
      {
        id: 'ACT-001',
        date: '2025-10-12',
        description: 'Premium payment successful for Life Insurance',
        type: 'payment',
        amount: '₹850'
      },
      {
        id: 'ACT-002',
        date: '2025-10-08',
        description: 'New policy purchased - Life Insurance',
        type: 'policy',
        policyId: 'POL-001'
      },
      {
        id: 'ACT-003',
        date: '2025-10-01',
        description: 'Claim approved for Car Insurance - ₹45,000',
        type: 'claim',
        claimId: 'CLM-001',
        amount: '₹45,000'
      },
      {
        id: 'ACT-004',
        date: '2025-09-25',
        description: 'Health check-up completed',
        type: 'health'
      }
    ]
  });
}

// ==================== NOTIFICATION APIs ====================

/**
 * GET /api/notifications
 * Fetches user notifications
 */
export async function getNotifications() {
  return mockApiCall({
    notifications: [
      {
        id: 'NOT-001',
        message: 'Car insurance renewal due in 30 days',
        time: '2 hours ago',
        type: 'warning',
        read: false,
        policyId: 'POL-002'
      },
      {
        id: 'NOT-002',
        message: 'Premium payment successful',
        time: '1 day ago',
        type: 'success',
        read: false
      },
      {
        id: 'NOT-003',
        message: 'Annual health check-up reminder',
        time: '3 days ago',
        type: 'info',
        read: true
      }
    ]
  });
}

/**
 * PUT /api/notifications/:id/read
 * Marks a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  return mockApiCall({ success: true });
}

// ==================== ADMIN APIs ====================

/**
 * GET /api/admin/stats
 * Fetches admin dashboard statistics
 */
export async function getAdminStats() {
  return mockApiCall({
    totalUsers: 12458,
    activePolicies: 8234,
    claimsProcessed: 1456,
    revenue: '₹45.2M',
    userGrowth: 12.5,
    policyGrowth: 8.2,
    claimsGrowth: 15.3,
    revenueGrowth: 18.7
  });
}

/**
 * GET /api/admin/claims
 * Fetches all claims for admin review
 */
export async function getAdminClaims() {
  return mockApiCall({
    claims: [
      {
        id: 'CLM-001',
        claimNumber: 'CLM-2025-001',
        userName: 'Rajesh Kumar',
        userEmail: 'rajesh.kumar@example.com',
        type: 'Health',
        amount: '₹50,000',
        status: 'pending',
        submittedDate: '2 hours ago',
        policyNumber: 'SI-2024-123456'
      },
      {
        id: 'CLM-002',
        claimNumber: 'CLM-2025-002',
        userName: 'Priya Sharma',
        userEmail: 'priya.sharma@example.com',
        type: 'Car',
        amount: '₹35,000',
        status: 'approved',
        submittedDate: '5 hours ago',
        policyNumber: 'SI-2024-234567'
      },
      {
        id: 'CLM-003',
        claimNumber: 'CLM-2025-003',
        userName: 'Amit Patel',
        userEmail: 'amit.patel@example.com',
        type: 'Life',
        amount: '₹1,00,000',
        status: 'review',
        submittedDate: '1 day ago',
        policyNumber: 'SI-2024-345678'
      },
      {
        id: 'CLM-004',
        claimNumber: 'CLM-2025-004',
        userName: 'Sneha Reddy',
        userEmail: 'sneha.reddy@example.com',
        type: 'Health',
        amount: '₹25,000',
        status: 'rejected',
        submittedDate: '2 days ago',
        policyNumber: 'SI-2024-456789'
      }
    ]
  });
}

/**
 * GET /api/admin/users
 * Fetches all users for admin management
 */
export async function getAdminUsers() {
  return mockApiCall({
    users: [
      {
        id: 'USER-001',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 98765 43210',
        policies: 3,
        totalPremium: '₹2,808/month',
        joinedDate: '2 days ago',
        status: 'active',
        kycStatus: 'verified'
      },
      {
        id: 'USER-002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+91 98765 43211',
        policies: 2,
        totalPremium: '₹1,558/month',
        joinedDate: '3 days ago',
        status: 'active',
        kycStatus: 'verified'
      },
      {
        id: 'USER-003',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+91 98765 43212',
        policies: 1,
        totalPremium: '₹850/month',
        joinedDate: '5 days ago',
        status: 'active',
        kycStatus: 'pending'
      }
    ]
  });
}

// Helper function for real API calls
async function request<T>(url: string, options: { method?: string; body?: any; skipAuth?: boolean } = {}): Promise<T> {
  const baseUrl = 'http://localhost:8000';
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${baseUrl}${url}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  
  if (!response.ok) {
    const error: any = new Error(`API Error: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  
  return response.json();
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
 * PUT /api/admin/claims/:id/approve
 * Approves a claim
 */
export async function approveClaim(claimId: string, approvedAmount: string) {
  return mockApiCall({
    success: true,
    message: 'Claim approved successfully'
  });
}

/**
 * PUT /api/admin/claims/:id/reject
 * Rejects a claim
 */
export async function rejectClaim(claimId: string, reason: string) {
  return mockApiCall({
    success: true,
    message: 'Claim rejected'
  });
}

// ==================== HOMEPAGE/PUBLIC APIs ====================

/**
 * GET /api/public/testimonials
 * Fetches customer testimonials
 */
export async function getTestimonials() {
  return mockApiCall({
    testimonials: [
      {
        id: 'TEST-001',
        name: 'Sarah Johnson',
        role: 'Life Insurance Customer',
        content: 'SecureInsure made the process so simple. I got my policy within 24 hours!',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        location: 'Mumbai, Maharashtra'
      },
      {
        id: 'TEST-002',
        name: 'Michael Chen',
        role: 'Car Insurance Customer',
        content: 'Best car insurance rates I found. The claim process was seamless.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        location: 'Bangalore, Karnataka'
      },
      {
        id: 'TEST-003',
        name: 'Priya Sharma',
        role: 'Health Insurance Customer',
        content: 'Comprehensive coverage for my entire family at an affordable price.',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        location: 'Delhi, NCR'
      }
    ]
  });
}

/**
 * GET /api/public/stats
 * Fetches platform statistics
 */
export async function getPlatformStats() {
  return mockApiCall({
    happyCustomers: '500K+',
    claimsSettled: '₹1000Cr+',
    satisfactionRate: '98%',
    supportAvailability: '24/7'
  });
}

/**
 * POST /api/public/quote
 * Requests a quote for insurance
 */
export async function requestQuote(quoteData: any) {
  return mockApiCall({
    success: true,
    quoteId: 'QTE-' + Math.random().toString(36).substr(2, 9),
    estimatedPremium: '₹' + (Math.floor(Math.random() * 2000) + 500) + '/month',
    message: 'Quote generated successfully'
  });
}

// ==================== DOCUMENT APIs ====================

/**
 * POST /api/documents/upload
 * Uploads a document
 */
export async function uploadDocument(file: File, documentType: string) {
  return mockApiCall({
    success: true,
    documentId: 'DOC-' + Math.random().toString(36).substr(2, 9),
    fileName: file.name,
    fileUrl: '/documents/' + file.name,
    message: 'Document uploaded successfully'
  }, 1000);
}

/**
 * GET /api/documents/:id
 * Fetches a document by ID
 */
export async function getDocument(documentId: string) {
  return mockApiCall({
    documentId,
    fileName: 'document.pdf',
    fileUrl: '/documents/document.pdf',
    uploadedDate: '2025-10-15',
    fileSize: '2.5 MB'
  });
}

// ==================== PAYMENT APIs ====================

/**
 * POST /api/payments/initiate
 * Initiates a payment
 */
export async function initiatePayment(paymentData: any) {
  return mockApiCall({
    success: true,
    paymentId: 'PAY-' + Math.random().toString(36).substr(2, 9),
    orderId: 'ORD-' + Math.random().toString(36).substr(2, 9),
    amount: paymentData.amount,
    paymentUrl: 'https://payment.secureinsure.com/pay/xyz123'
  });
}

/**
 * GET /api/payments/:id/status
 * Checks payment status
 */
export async function getPaymentStatus(paymentId: string) {
  return mockApiCall({
    paymentId,
    status: 'success',
    amount: '₹850',
    transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9),
    paidDate: '2025-10-12T10:30:00Z'
  });
}

/**
 * GET /api/payments/history
 * Fetches payment history
 */
export async function getPaymentHistory() {
  return mockApiCall({
    payments: [
      {
        id: 'PAY-001',
        amount: '₹850',
        policyNumber: 'SI-2025-001234',
        policyType: 'Life Insurance',
        status: 'success',
        date: '2025-10-12',
        transactionId: 'TXN-123456789'
      },
      {
        id: 'PAY-002',
        amount: '₹708',
        policyNumber: 'SI-2024-005678',
        policyType: 'Car Insurance',
        status: 'success',
        date: '2025-09-20',
        transactionId: 'TXN-987654321'
      }
    ]
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
  
  // Claims
  getUserClaims,
  getClaimDetails,
  submitClaim,
  updateClaim,
  
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
  login,
  getUserByEmail,
  createUser
};
