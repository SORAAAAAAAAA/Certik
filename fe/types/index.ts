export interface CertificateType {
  id: number;
  title: string;
  issuer: string;
  date: string;
  description: string;
  skills: string[];
}

// Re-export certificate types for convenience
export * from './certificate';