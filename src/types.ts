export type Role = 'claimant' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type CategoryType = 'roads' | 'hospitals' | 'infrastructure';
export type SeverityType = 'low' | 'medium' | 'high' | 'critical';
export type StatusType = 'pending' | 'in_progress' | 'resolved';

export interface Claim {
  id: string;
  trackingNumber: string;
  title: string;
  description: string;
  category: CategoryType;
  location: string;
  severity: SeverityType;
  status: StatusType;
  createdAt: string;
  resolvedAt?: string;
  resolvedNotes?: string;
  claimantId: string;
  claimantName: string;
  imageUrl?: string;
}

export interface Comment {
  id: string;
  claimId: string;
  authorName: string;
  authorRole: Role;
  text: string;
  createdAt: string;
}
