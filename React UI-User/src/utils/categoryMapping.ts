/**
 * Category Mapping and Validation Utilities
 * 
 * Maps document names to category IDs and validates categories for claim types.
 */

export type ClaimType = 'health' | 'life' | 'car';

// Category mapping for each claim type
// Maps document display names to category IDs (folder-safe names)
const CATEGORY_MAPPING: Record<ClaimType, Record<string, string>> = {
  life: {
    'Death Certificate': 'death-certificate',
    'Death Claim Form': 'claim-form',
    'Original Policy Document': 'policy-document',
    'Claimant ID Proof': 'claimant-id',
    'Address Proof': 'claimant-address',
    'Medical Records (if illness)': 'medical-records',
    'FIR Copy (if accidental)': 'fir-copy',
    'Post Mortem Report (if applicable)': 'post-mortem',
    'Nominee Relationship Proof': 'nominee-proof',
    'Cancelled Cheque/Bank Statement': 'bank-details'
  },
  health: {
    // Cashless category
    'Pre-Authorization Form': 'pre-auth',
    'Hospital ID Card': 'hospital-id',
    'Policy Copy': 'policy-copy',
    'Photo ID Proof': 'id-proof',
    'Medical Reports/Prescription': 'medical-reports',
    // Reimbursement category
    'Duly Filled Claim Form': 'claim-form',
    'Hospital Bills & Receipts': 'hospital-bills',
    'Discharge Summary': 'discharge-summary',
    'Investigation Reports': 'medical-reports',
    "Doctor's Prescription": 'prescription',
    'Payment Receipts': 'payment-receipts',
    'Cancelled Cheque': 'cancelled-cheque'
  },
  car: {
    'Duly Filled Claim Form': 'claim-form',
    'Policy Copy': 'policy-copy',
    'RC Book Copy': 'rc-copy',
    'Driving License': 'driving-license',
    'FIR Copy': 'fir-copy',
    'Vehicle Damage Photos': 'damage-photos',
    'Repair Estimate/Invoice': 'repair-estimate',
    'Survey Report': 'survey-report',
    'Third Party Documents': 'third-party-docs'
  }
};

// Valid category IDs for each claim type (for validation)
const VALID_CATEGORIES: Record<ClaimType, Set<string>> = {
  life: new Set([
    'death-certificate', 'claim-form', 'policy-document', 'claimant-id',
    'claimant-address', 'medical-records', 'fir-copy', 'post-mortem',
    'nominee-proof', 'bank-details'
  ]),
  health: new Set([
    'pre-auth', 'hospital-id', 'policy-copy', 'id-proof', 'medical-reports',
    'claim-form', 'hospital-bills', 'discharge-summary', 'prescription',
    'payment-receipts', 'cancelled-cheque'
  ]),
  car: new Set([
    'claim-form', 'policy-copy', 'rc-copy', 'driving-license', 'fir-copy',
    'damage-photos', 'repair-estimate', 'survey-report', 'third-party-docs'
  ])
};

/**
 * Get category ID from document name for a given claim type.
 * 
 * @param claimType - Type of claim ('life', 'health', 'car')
 * @param documentName - Display name of the document (e.g., "Death Certificate")
 * @returns Category ID (e.g., "death-certificate") or undefined if not found
 * 
 * @example
 * getCategoryId('life', 'Death Certificate') // Returns 'death-certificate'
 * getCategoryId('health', 'Pre-Authorization Form') // Returns 'pre-auth'
 */
export function getCategoryId(claimType: ClaimType, documentName: string): string | undefined {
  return CATEGORY_MAPPING[claimType]?.[documentName];
}

/**
 * Get document display name from category ID for a given claim type.
 * 
 * @param claimType - Type of claim ('life', 'health', 'car')
 * @param categoryId - Category ID (e.g., "death-certificate")
 * @returns Document display name (e.g., "Death Certificate") or undefined if not found
 * 
 * @example
 * getDocumentName('life', 'death-certificate') // Returns 'Death Certificate'
 * getDocumentName('health', 'pre-auth') // Returns 'Pre-Authorization Form'
 */
export function getDocumentName(claimType: ClaimType, categoryId: string): string | undefined {
  const mapping = CATEGORY_MAPPING[claimType];
  if (!mapping) return undefined;
  
  // Reverse lookup
  for (const [docName, catId] of Object.entries(mapping)) {
    if (catId === categoryId) {
      return docName;
    }
  }
  
  return undefined;
}

/**
 * Validate if a category ID is valid for a given claim type.
 * 
 * @param claimType - Type of claim ('life', 'health', 'car')
 * @param categoryId - Category ID to validate
 * @returns True if category is valid, false otherwise
 * 
 * @example
 * isValidCategory('life', 'death-certificate') // Returns true
 * isValidCategory('life', 'invalid-category') // Returns false
 */
export function isValidCategory(claimType: ClaimType, categoryId: string): boolean {
  return VALID_CATEGORIES[claimType]?.has(categoryId) ?? false;
}

/**
 * Get all valid category IDs for a claim type.
 * 
 * @param claimType - Type of claim ('life', 'health', 'car')
 * @returns Array of valid category IDs
 * 
 * @example
 * getAllCategoriesForClaimType('life') // Returns ['death-certificate', 'claim-form', ...]
 */
export function getAllCategoriesForClaimType(claimType: ClaimType): string[] {
  return Array.from(VALID_CATEGORIES[claimType] || []);
}

/**
 * Normalize a category string to a valid category ID format.
 * 
 * This handles cases where category might be a display name or already a category ID.
 * 
 * @param category - Category string (could be display name or category ID)
 * @returns Normalized category ID
 * 
 * @example
 * normalizeCategoryId('Death Certificate') // Returns 'death-certificate'
 * normalizeCategoryId('death-certificate') // Returns 'death-certificate'
 */
export function normalizeCategoryId(category: string): string {
  // Convert to lowercase
  let normalized = category.toLowerCase();
  // Replace spaces and underscores with hyphens
  normalized = normalized.replace(/\s+/g, '-').replace(/_/g, '-');
  // Remove any special characters except hyphens and alphanumeric
  normalized = normalized.replace(/[^a-z0-9-]/g, '');
  // Remove multiple consecutive hyphens
  normalized = normalized.replace(/-+/g, '-');
  // Remove leading/trailing hyphens
  normalized = normalized.replace(/^-+|-+$/g, '');
  return normalized;
}

