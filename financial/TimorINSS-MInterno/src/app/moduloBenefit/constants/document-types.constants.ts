/**
 * Document Types Constants
 * Common document types for benefit applications
 */

export interface DocumentType {
  value: string;
  label: string;
  description?: string;
}

// Alias for backward compatibility
export type DocumentTypeOption = DocumentType;

/**
 * Available document types for upload
 */
export const DOCUMENT_TYPES: DocumentType[] = [
  {
    value: 'birth-certificate',
    label: 'Birth Certificate',
    description: 'Official birth registration document'
  },
  {
    value: 'death-certificate',
    label: 'Death Certificate',
    description: 'Official death registration document'
  },
  {
    value: 'marriage-certificate',
    label: 'Marriage Certificate',
    description: 'Official marriage registration document'
  },
  {
    value: 'disability-certificate',
    label: 'Disability Certificate',
    description: 'Medical certificate of disability/labor capacity reduction'
  },
  {
    value: 'id-card',
    label: 'Identity Card',
    description: 'National identity card or passport'
  },
  {
    value: 'niss-card',
    label: 'NISS Card',
    description: 'Social security identification card'
  },
  {
    value: 'employment-certificate',
    label: 'Employment Certificate',
    description: 'Certificate of employment or work history'
  },
  {
    value: 'medical-report',
    label: 'Medical Report',
    description: 'Medical examination or health report'
  },
  {
    value: 'proof-of-residence',
    label: 'Proof of Residence',
    description: 'Document proving current address'
  },
  {
    value: 'bank-statement',
    label: 'Bank Statement',
    description: 'Recent bank account statement'
  },
  {
    value: 'pension-application-form',
    label: 'Pension Application Form',
    description: 'Official application form for pension benefits'
  },
  {
    value: 'tax-certificate',
    label: 'Tax Certificate',
    description: 'Tax registration or payment certificate'
  },
  {
    value: 'family-record-book',
    label: 'Family Record Book',
    description: 'Official family registration document'
  },
  {
    value: 'other',
    label: 'Other Document',
    description: 'Any other supporting document'
  }
];

/**
 * Get document type by value
 */
export function getDocumentType(value: string): DocumentType | undefined {
  return DOCUMENT_TYPES.find(type => type.value === value);
}

/**
 * Get document type label
 */
export function getDocumentTypeLabel(value: string): string {
  const type = getDocumentType(value);
  return type?.label || value;
}
