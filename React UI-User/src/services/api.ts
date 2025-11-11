const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
const API_BASE_URL = (metaEnv.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');

class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type QueryParamValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, QueryParamValue | QueryParamValue[]>;

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: RequestInit['body'] | Record<string, unknown>;
  query?: QueryParams;
  skipAuth?: boolean;
};

const BENEFIT_LABELS: Record<string, string> = {
  critical_illness_cover: 'Critical Illness Cover',
  accidental_death_cover: 'Accidental Death Cover',
  waiver_of_premium: 'Waiver of Premium',
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !(value instanceof FormData) &&
  !(value instanceof Blob) &&
  !(value instanceof ArrayBuffer) &&
  !(value instanceof URLSearchParams);

function getAuthToken(): string | null {
  try {
    return localStorage.getItem('authToken');
  } catch {
    return null;
  }
}

function getStoredUser(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function resolveUserId(userId?: number | string | null): number {
  if (userId !== undefined && userId !== null) {
    const numeric = Number(userId);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  const storedUser = getStoredUser();
  if (storedUser) {
    const candidate = (storedUser.userId ?? storedUser.id) as string | number | undefined;
    if (candidate !== undefined && candidate !== null) {
      const numeric = Number(candidate);
      if (!Number.isNaN(numeric)) {
        return numeric;
      }
    }
  }

  console.warn('[api] Unable to resolve user id. Falling back to 1.');
  return 1;
}

function formatPolicyType(value?: string | null): string {
  if (!value) return 'Policy';
  if (value.includes('_')) {
    return value
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  return value;
}

function formatBenefit(value: string): string {
  return BENEFIT_LABELS[value] ?? formatPolicyType(value);
}

function formatCurrency(value: number | string | null | undefined, suffix = ''): string {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return `${currencyFormatter.format(numeric)}${suffix}`.trim();
  }
  return '₹0';
}

function formatDateTime(value?: string | null): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function buildUrl(path: string, query?: QueryParams): string {
  const url = path.startsWith('http')
    ? new URL(path)
    : new URL(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null) {
            url.searchParams.append(key, String(item));
          }
        });
      } else {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, body, headers, skipAuth, ...rest } = options;
  const url = buildUrl(path, query);
  const resolvedHeaders = new Headers(headers ?? {});
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  if (!isFormData && !resolvedHeaders.has('Accept')) {
    resolvedHeaders.set('Accept', 'application/json');
  }

  let resolvedBody = body as BodyInit | undefined;
  if (body && !isFormData && isPlainObject(body)) {
    resolvedBody = JSON.stringify(body);
    if (!resolvedHeaders.has('Content-Type')) {
      resolvedHeaders.set('Content-Type', 'application/json');
    }
  }

  if (!skipAuth) {
    const token = getAuthToken();
    if (token && !resolvedHeaders.has('Authorization')) {
      resolvedHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    method: rest.method ?? 'GET',
    ...rest,
    headers: resolvedHeaders,
    body: resolvedBody,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  let payload: any = null;

  if (contentType.includes('application/json')) {
    payload = await response.json();
  } else {
    const text = await response.text();
    payload = text ? text : null;
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.detail ?? payload?.message ?? response.statusText,
      payload,
    );
  }

  return payload as T;
}

async function withFallback<T>(executor: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await executor();
  } catch (error) {
    console.warn('[api] Falling back to cached data due to error:', error);
    return fallback;
  }
}

type KycStatus = 'pending' | 'verified';
type PolicyType = 'vehicle_insurance' | 'health_insurance';
type ActivityType = 'payment' | 'policy' | 'claim' | 'health';
type NotificationType = 'warning' | 'success' | 'info' | 'error';
type PaymentStatus = 'pending' | 'success' | 'failed' | 'cancelled';

interface BackendUser {
  userId: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  panCard: string;
  aadhar: string;
  joinedDate: string;
  kycStatus: KycStatus;
  profileImage?: string | null;
}

interface UserProfile extends BackendUser {
  id: number;
}

interface UpdateUserProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
}

interface PolicyPersonalDetails {
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
}

interface BackendPolicy {
  id?: number;
  policyId?: number;
  userId?: number;
  type?: string;
  planName?: string;
  policyNumber?: string;
  coverage?: number;
  premium?: number;
  tenure?: number;
  status?: string;
  startDate?: string;
  expiryDate?: string;
  benefits?: string[];
  nominee?: string | null;
  nomineeId?: number | null;
  policyDocument?: string | null;
  personalDetails?: PolicyPersonalDetails | Record<string, unknown> | null;
}

interface PolicySummary {
  id: string | number;
  type: string;
  planName: string;
  policyNumber: string;
  coverage: string;
  premium: string;
  status: string;
  startDate: string;
  expiryDate: string;
  benefits: string[];
  nominee?: string | null;
  policyDocument?: string | null;
  tenure?: number;
}

interface PolicyPurchasePayload {
  userId?: number | string;
  type: PolicyType | string;
  planName: string;
  coverage: number;
  premium: number;
  tenure: number;
  nominee?: string;
  nomineeId?: number;
  personalDetails?: PolicyPersonalDetails;
  policyNumber?: string;
}

interface BackendClaim {
  claimId?: number;
  id?: number;
  userId: number;
  policyId: number;
  claimType: string;
  amount: number;
  status: string;
  description?: string | null;
  documents?: string[];
  submittedDate?: string;
  approvedDate?: string | null;
}

interface ClaimSummary {
  id: number;
  claimNumber: string;
  policyId: number;
  type: string;
  amount: string;
  status: string;
  description?: string | null;
  submittedDate?: string;
  approvedDate?: string | null;
  documents?: string[];
}

interface ClaimCreatePayload {
  userId?: number | string;
  policyId: number | string;
  claimType: string;
  amount: number | string;
  status?: string;
  description?: string;
  documents?: string[];
}

interface ClaimUpdatePayload {
  claimType?: string;
  amount?: number | string;
  status?: string;
}

interface BackendActivity {
  activityId?: number;
  id?: number;
  userId: number;
  type: ActivityType;
  description: string;
  time?: string;
  date?: string;
  amount?: number | null;
}

interface ActivitySummary {
  id: number | string;
  type: ActivityType;
  description: string;
  date: string;
  amount?: string;
}

interface BackendNotification {
  notificationId?: number;
  id?: number;
  userId?: number;
  message: string;
  time?: string;
  type?: NotificationType;
  read?: boolean;
  policyId?: number | null;
}

interface NotificationSummary {
  id: number | string;
  message: string;
  time: string;
  type: NotificationType;
  read: boolean;
  policyId?: number | null;
}

interface BackendDocument {
  documentId: number;
  userId: number;
  policyId: number;
  documentType: string;
  documentUrl: string;
  uploadDate: string;
  fileSize: number;
}

interface DocumentUploadPayload {
  file: File;
  userId?: number | string;
  policyId: number | string;
  documentType: string;
}

interface BackendPayment {
  paymentId?: number;
  id?: number;
  userId?: number;
  policyId?: number;
  amount?: number;
  orderId?: string;
  paidDate?: string;
  paymentMethod?: string;
  status?: PaymentStatus;
  transactionId?: string;
  returnUrl?: string;
  paymentUrl?: string;
}

interface PaymentSummary {
  id: number | string;
  amount: string;
  policyId?: number;
  paymentMethod?: string;
  status: PaymentStatus;
  date?: string;
  orderId?: string;
  transactionId?: string;
  paymentUrl?: string;
}

interface PaymentCreatePayload {
  userId?: number | string;
  policyId: number | string;
  amount: number | string;
  orderId: string;
  paidDate: string;
  paymentMethod: string;
  status?: PaymentStatus;
  transactionId: string;
  returnUrl: string;
  paymentUrl: string;
}

interface QuoteRequestPayload {
  category: string;
  fullName: string;
  email: string;
  phone: string;
}

function mapUser(user: BackendUser): UserProfile {
  return {
    ...user,
    id: user.userId,
  };
}

function mapPolicy(policy: BackendPolicy): PolicySummary {
  const id = policy.id ?? policy.policyId ?? policy.policyNumber ?? crypto.randomUUID();
  return {
    id,
    type: formatPolicyType(policy.type),
    planName: policy.planName ?? 'Insurance Plan',
    policyNumber: policy.policyNumber ?? String(id),
    coverage: formatCurrency(policy.coverage),
    premium: formatCurrency(policy.premium, '/month'),
    status: policy.status ?? 'Active',
    startDate: policy.startDate ?? '',
    expiryDate: policy.expiryDate ?? '',
    benefits: Array.isArray(policy.benefits)
      ? policy.benefits.map((benefit) => formatBenefit(String(benefit)))
      : [],
    nominee: policy.nominee ?? null,
    policyDocument: policy.policyDocument ?? null,
    tenure: policy.tenure,
  };
}

function mapClaim(claim: BackendClaim): ClaimSummary {
  const id = claim.claimId ?? claim.id ?? 0;
  return {
    id,
    claimNumber: `CLM-${String(id).padStart(6, '0')}`,
    policyId: claim.policyId,
    type: formatPolicyType(claim.claimType),
    amount: formatCurrency(claim.amount),
    status: claim.status ?? 'pending',
    description: claim.description ?? undefined,
    submittedDate: claim.submittedDate ?? undefined,
    approvedDate: claim.approvedDate ?? undefined,
    documents: claim.documents,
  };
}

function mapActivity(activity: BackendActivity): ActivitySummary {
  const id = activity.activityId ?? activity.id ?? crypto.randomUUID();
  return {
    id,
    type: activity.type,
    description: activity.description,
    date: formatDateTime(activity.time ?? activity.date ?? ''),
    amount: activity.amount !== undefined && activity.amount !== null
      ? formatCurrency(activity.amount)
      : undefined,
  };
}

function mapNotification(notification: BackendNotification): NotificationSummary {
  const id = notification.notificationId ?? notification.id ?? crypto.randomUUID();
  return {
    id,
    message: notification.message,
    time: formatDateTime(notification.time ?? ''),
    type: notification.type ?? 'info',
    read: Boolean(notification.read),
    policyId: notification.policyId ?? undefined,
  };
}

function mapPayment(payment: BackendPayment): PaymentSummary {
  const id = payment.paymentId ?? payment.id ?? crypto.randomUUID();
  return {
    id,
    amount: formatCurrency(payment.amount),
    policyId: payment.policyId,
    paymentMethod: payment.paymentMethod,
    status: payment.status ?? 'pending',
    date: payment.paidDate,
    orderId: payment.orderId,
    transactionId: payment.transactionId,
    paymentUrl: payment.paymentUrl,
  };
}

function resolvePolicyCategory(value: string): PolicyType {
  const normalized = value.toLowerCase();
  if (normalized.includes('vehicle') || normalized.includes('car') || normalized.includes('auto')) {
    return 'vehicle_insurance';
  }
  return 'health_insurance';
}

export async function getUserProfile(userId?: number | string): Promise<UserProfile> {
  const id = resolveUserId(userId);
  const data = await request<BackendUser>(`/users/${id}`);
  return mapUser(data);
}

export async function updateUserProfile(
  userId: number | string,
  payload: UpdateUserProfilePayload,
) {
  const id = resolveUserId(userId);
  const body: Record<string, unknown> = {};

  if (payload.name !== undefined) body.name = payload.name;
  if (payload.phone !== undefined) body.phone = payload.phone;
  if (payload.address !== undefined) body.address = payload.address;

  return request(`/users/${id}`, {
    method: 'PUT',
    body,
  });
}

export async function getUserPolicies(userId?: number | string) {
  const id = resolveUserId(userId);
  const data = await request<BackendPolicy[]>(`/policy/user/${id}`);
  return { policies: data.map(mapPolicy) };
}

export async function getPolicyDetails(policyId: number | string) {
  const data = await request<BackendPolicy>(`/policy/${policyId}`);
  return mapPolicy(data);
}

export async function purchasePolicy(payload: PolicyPurchasePayload) {
  const userId = resolveUserId(payload.userId);
  const body = {
    ...payload,
    userId,
    type: typeof payload.type === 'string' ? payload.type : payload.type,
    policyNumber: payload.policyNumber ?? '',
  };

  return request(`/policy/purchase`, {
    method: 'POST',
    body,
  });
}

export async function getUserClaims(userId?: number | string) {
  const id = resolveUserId(userId);
  const data = await request<BackendClaim[]>(`/claims/user/${id}`);
  return { claims: data.map(mapClaim) };
}

export async function getClaimDetails(claimId: number | string) {
  const data = await request<BackendClaim>(`/claims/${claimId}`);
  return mapClaim(data);
}

export async function submitClaim(payload: ClaimCreatePayload) {
  const body = {
    userId: resolveUserId(payload.userId),
    policyId: Number(payload.policyId),
    claimType: payload.claimType,
    amount: Number(payload.amount),
    status: payload.status ?? 'pending',
  };

  return request(`/claims/`, {
    method: 'POST',
    body,
  });
}

export async function updateClaim(claimId: number | string, payload: ClaimUpdatePayload) {
  const body: Record<string, unknown> = {};

  if (payload.claimType !== undefined) body.claimType = payload.claimType;
  if (payload.amount !== undefined) body.amount = Number(payload.amount);
  if (payload.status !== undefined) body.status = payload.status;

  return request(`/claims/${claimId}`, {
    method: 'PUT',
    body,
  });
}

export async function getUserActivities(userId?: number | string) {
  const id = resolveUserId(userId);
  const data = await request<BackendActivity[]>(`/activities/user/${id}`);
  return { activities: data.map(mapActivity) };
}

export async function getNotifications(userId?: number | string, unreadOnly?: boolean) {
  const id = resolveUserId(userId);
  const data = await request<BackendNotification[]>(`/notifications/user/${id}`, {
    query: unreadOnly ? { unread_only: unreadOnly } : undefined,
  });
  return { notifications: data.map(mapNotification) };
}

export async function markNotificationAsRead(
  notificationId: number | string,
  userId?: number | string,
) {
  const id = resolveUserId(userId);
  return request(`/notifications/${notificationId}/read`, {
    method: 'PUT',
    query: { user_id: id },
  });
}

export async function getAdminStats() {
  const fallback = {
    totalUsers: 0,
    activePolicies: 0,
    claimsProcessed: 0,
    revenue: '₹0',
    userGrowth: 0,
    policyGrowth: 0,
    claimsGrowth: 0,
    revenueGrowth: 0,
  };

  return withFallback(() => request('/admin/stats'), fallback);
}

export async function getAdminClaims() {
  const claims = await request<BackendClaim[]>(`/claims`);
  return { claims: claims.map(mapClaim) };
}

export async function getAdminUsers() {
  const users = await request<BackendUser[]>(`/users`);
  return {
    users: users.map((user) => ({
      id: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      kycStatus: user.kycStatus,
      joinedDate: user.joinedDate,
    })),
  };
}

export async function getUserByEmail(email: string) {
  const data = await request<BackendUser>(`/users/email/${encodeURIComponent(email)}`);
  return mapUser(data);
}

export interface UserCreatePayload {
  name: string;
  email: string;
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
    body: payload as unknown as Record<string, unknown>,
  });
}

export async function approveClaim(claimId: number | string, approvedAmount?: number | string) {
  return updateClaim(claimId, {
    status: 'approved',
    amount: approvedAmount,
  });
}

export async function rejectClaim(claimId: number | string, reason?: string) {
  return updateClaim(claimId, {
    status: reason ? `rejected:${reason}` : 'rejected',
  });
}

const testimonialsFallback = {
    testimonials: [
      {
        id: 'TEST-001',
        name: 'Sarah Johnson',
        role: 'Life Insurance Customer',
        content: 'SecureInsure made the process so simple. I got my policy within 24 hours!',
        rating: 5,
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      location: 'Mumbai, Maharashtra',
      },
      {
        id: 'TEST-002',
        name: 'Michael Chen',
        role: 'Car Insurance Customer',
        content: 'Best car insurance rates I found. The claim process was seamless.',
        rating: 5,
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      location: 'Bangalore, Karnataka',
      },
      {
        id: 'TEST-003',
        name: 'Priya Sharma',
        role: 'Health Insurance Customer',
        content: 'Comprehensive coverage for my entire family at an affordable price.',
        rating: 5,
      image:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      location: 'Delhi, NCR',
    },
  ],
};

export async function getTestimonials() {
  return withFallback(() => request('/public/testimonials'), testimonialsFallback);
}

const platformStatsFallback = {
    happyCustomers: '500K+',
    claimsSettled: '₹1000Cr+',
    satisfactionRate: '98%',
  supportAvailability: '24/7',
};

export async function getPlatformStats() {
  return withFallback(() => request('/public/stats'), platformStatsFallback);
}

export async function requestQuote(payload: QuoteRequestPayload) {
  return request(`/quotation/request`, {
    method: 'POST',
    body: {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      category: resolvePolicyCategory(payload.category),
    },
  });
}

export async function uploadDocument(payload: DocumentUploadPayload) {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('userId', String(resolveUserId(payload.userId)));
  formData.append('policyId', String(payload.policyId));
  formData.append('documentType', payload.documentType);

  return request(`/documents/upload`, {
    method: 'POST',
    body: formData,
  });
}

export async function getDocument(documentId: number | string) {
  return request<BackendDocument>(`/documents/${documentId}`);
}

export async function initiatePayment(payload: PaymentCreatePayload) {
  const body = {
    userId: resolveUserId(payload.userId),
    policyId: Number(payload.policyId),
    amount: Number(payload.amount),
    orderId: payload.orderId,
    paidDate: payload.paidDate,
    paymentMethod: payload.paymentMethod,
    status: payload.status ?? 'pending',
    transactionId: payload.transactionId,
    returnUrl: payload.returnUrl,
    paymentUrl: payload.paymentUrl,
  };

  return request(`/payments/`, {
    method: 'POST',
    body,
  });
}

export async function getPaymentStatus(paymentId: number | string) {
  const data = await request<BackendPayment>(`/payments/${paymentId}`);
  return mapPayment(data);
}

export async function getPaymentHistory(userId?: number | string) {
  const id = resolveUserId(userId);
  const data = await request<BackendPayment[]>(`/payments/history/${id}`);
  return { payments: data.map(mapPayment) };
}

export const api = {
  getUserProfile,
  updateUserProfile,
  getUserPolicies,
  getPolicyDetails,
  purchasePolicy,
  getUserClaims,
  getClaimDetails,
  submitClaim,
  updateClaim,
  getUserActivities,
  getNotifications,
  markNotificationAsRead,
  getAdminStats,
  getAdminClaims,
  getAdminUsers,
  getUserByEmail,
  createUser,
  approveClaim,
  rejectClaim,
  getTestimonials,
  getPlatformStats,
  requestQuote,
  uploadDocument,
  getDocument,
  initiatePayment,
  getPaymentStatus,
  getPaymentHistory,
};
