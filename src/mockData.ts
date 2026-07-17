import { Claim, User } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Chidi Okafor',
    email: 'citizen@example.com',
    role: 'claimant',
  },
  {
    id: 'admin-1',
    name: 'Hon. Babatunde Balogun',
    email: 'admin@city.gov',
    role: 'admin',
  }
];

// Preset images (premium Unsplash images related to infrastructure/civic issues)
export const CIVIC_PRESET_IMAGES = [
  {
    id: 'pothole',
    label: 'Deep Pothole / Crater (Oworo Inward)',
    url: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'hospital',
    label: 'Gbagada General Hospital Waiting Area',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'leak',
    label: 'Water Main / Pipe Burst (Wuse II)',
    url: 'https://images.unsplash.com/photo-1542013936693-8848e5744a9b?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'sidewalk',
    label: 'Damaged Drainage / Allen Avenue Walkway',
    url: 'https://images.unsplash.com/photo-1594913785162-e678537db463?auto=format&fit=crop&q=80&w=600',
  }
];

export const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'claim-1',
    trackingNumber: 'CIVIC-90214-RD',
    title: 'Hazardous Pothole Crater on Third Mainland Bridge Inward Island',
    category: 'roads',
    location: 'Third Mainland Bridge, Oworo inward Lagos Island, Lagos State',
    severity: 'high',
    status: 'pending',
    description: 'A deep pothole crater is sitting in the middle of the fast lane immediately after the third expansion joint. Vehicles are slamming brakes and swerving sharply into adjacent lanes to avoid it, causing severe hold-up during morning rush hour and putting lives at risk.',
    createdAt: '2026-07-14T09:15:00Z',
    claimantId: 'user-1',
    claimantName: 'Chidi Okafor',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'claim-2',
    trackingNumber: 'CIVIC-48102-HP',
    title: 'Broken Waiting Seating inside Gbagada General Emergency Reception',
    category: 'hospitals',
    location: 'Gbagada General Hospital, West Wing Emergency Ward, Lagos State',
    severity: 'medium',
    status: 'resolved',
    description: 'Three metal seating benches are completely detached from their base support and tilting dangerously. Pregnant women and elderly patients waiting in triage are having to stand because of the lack of proper seating. This needs urgent repairs.',
    createdAt: '2026-07-10T11:45:00Z',
    resolvedAt: '2026-07-12T16:30:00Z',
    resolvedNotes: 'The Lagos State Infrastructure Maintenance team replaced the broken metal benches with four brand new heavy-duty ergonomic benches and secured them firmly to the waiting room floor.',
    claimantId: 'user-1',
    claimantName: 'Chidi Okafor',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'claim-3',
    trackingNumber: 'CIVIC-22894-IN',
    title: 'Severe Water Main Pipe Burst Flooding Roadway',
    category: 'infrastructure',
    location: 'Library Crescent near Wuse II Shopping Mall, Abuja FCT',
    severity: 'critical',
    status: 'in_progress',
    description: 'An underground water pipeline has ruptured, sending a high-pressure stream of water bubbling up through the road pavement. The whole library sidewalk is flooded, and the continuous flow is eroding the soil near the streetlights. We need the Federal Capital Territory Water Board to shut the valve immediately.',
    createdAt: '2026-07-16T08:30:00Z',
    claimantId: 'user-1',
    claimantName: 'Chidi Okafor',
    imageUrl: 'https://images.unsplash.com/photo-1542013936693-8848e5744a9b?auto=format&fit=crop&q=80&w=600'
  }
];
