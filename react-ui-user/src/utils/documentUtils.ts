/**
 * Document Utility Functions
 * 
 * Provides helper functions for working with document types, including
 * mapping between backend documentType values and user-friendly display names.
 */

/**
 * Mapping from backend documentType to display name
 */
export const DOCUMENT_TYPE_DISPLAY_NAMES: Record<string, string> = {
  'kyc_document': 'KYC Document',
  'id_card': 'ID Card',
  'pan_card': 'PAN Card',
  'policy_document': 'Previous Policy',
  'claim_document': 'Claim Document',
  'other': 'Other'
};

/**
 * Get user-friendly display name for a document type
 * 
 * @param documentType - Backend documentType value (e.g., 'id_card', 'pan_card')
 * @returns Display name (e.g., 'ID Card', 'PAN Card') or the original value if not found
 */
export function getDocumentTypeDisplayName(documentType: string | null | undefined): string {
  if (!documentType) {
    return 'Other';
  }
  
  return DOCUMENT_TYPE_DISPLAY_NAMES[documentType] || documentType;
}

/**
 * Get document type icon or color based on document type
 * 
 * @param documentType - Backend documentType value
 * @returns Object with icon name and color class
 */
export function getDocumentTypeStyle(documentType: string | null | undefined): {
  icon: string;
  color: string;
} {
  if (!documentType) {
    return { icon: 'File', color: 'text-gray-500' };
  }
  
  const styles: Record<string, { icon: string; color: string }> = {
    'kyc_document': { icon: 'Shield', color: 'text-blue-500' },
    'id_card': { icon: 'IdCard', color: 'text-green-500' },
    'pan_card': { icon: 'CreditCard', color: 'text-orange-500' },
    'policy_document': { icon: 'FileText', color: 'text-purple-500' },
    'claim_document': { icon: 'FileCheck', color: 'text-red-500' },
    'other': { icon: 'File', color: 'text-gray-500' }
  };
  
  return styles[documentType] || styles['other'];
}

/**
 * Check if a document type is valid
 * 
 * @param documentType - Document type to validate
 * @returns True if valid, false otherwise
 */
export function isValidDocumentType(documentType: string | null | undefined): boolean {
  if (!documentType) {
    return false;
  }
  
  return documentType in DOCUMENT_TYPE_DISPLAY_NAMES;
}

/**
 * Get all available document types
 * 
 * @returns Array of document type values
 */
export function getAllDocumentTypes(): string[] {
  return Object.keys(DOCUMENT_TYPE_DISPLAY_NAMES);
}

