import { Claim, User, Comment } from '../types';
import { INITIAL_USERS, INITIAL_CLAIMS } from '../mockData';
import { db, isFirebaseEnabled, withTimeout } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  limit 
} from 'firebase/firestore';

const USERS_KEY = 'civic_care_users';
const CLAIMS_KEY = 'civic_care_claims';
const COMMENTS_KEY = 'civic_care_comments';
const CURRENT_USER_KEY = 'civic_care_current_user';

export const initializeStorage = async () => {
  // 1. If Firebase is disabled, do classic LocalStorage initialization
  if (!isFirebaseEnabled) {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(CLAIMS_KEY)) {
      localStorage.setItem(CLAIMS_KEY, JSON.stringify(INITIAL_CLAIMS));
    }
    if (!localStorage.getItem(COMMENTS_KEY)) {
      const defaultComments: Comment[] = [
        {
          id: 'comment-1',
          claimId: 'claim-1',
          authorName: 'Lagos Public Infrastructure Centre',
          authorRole: 'admin',
          text: 'Assigned to the Lagos State Ministry of Works & Infrastructure road crew for physical inspection and speed bump assessment.',
          createdAt: '2026-07-14T10:30:00Z',
        },
        {
          id: 'comment-2',
          claimId: 'claim-3',
          authorName: 'Chidi Okafor',
          authorRole: 'claimant',
          text: 'The flow is increasing, some water is starting to flood the main entrance road near Wuse Mall as well.',
          createdAt: '2026-07-16T09:00:00Z',
        },
        {
          id: 'comment-3',
          claimId: 'claim-3',
          authorName: 'FCT Water Board Team',
          authorRole: 'admin',
          text: 'FCT Water Board Emergency Maintenance Team dispatched. Crew ETA is 20 minutes.',
          createdAt: '2026-07-16T09:15:00Z',
        }
      ];
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(defaultComments));
    }
    return;
  }

  // 2. If Firebase is active, check if Firestore has seed data and populate if empty
  try {
    const usersColRef = collection(db, 'users');
    const usersSnap = await withTimeout(getDocs(query(usersColRef, limit(1))));
    if (usersSnap.empty) {
      console.log('🌱 Seeding initial users to Firestore...');
      for (const u of INITIAL_USERS) {
        await withTimeout(setDoc(doc(db, 'users', u.id), u));
      }
    }

    const claimsColRef = collection(db, 'claims');
    const claimsSnap = await withTimeout(getDocs(query(claimsColRef, limit(1))));
    if (claimsSnap.empty) {
      console.log('🌱 Seeding initial claims to Firestore...');
      for (const c of INITIAL_CLAIMS) {
        await withTimeout(setDoc(doc(db, 'claims', c.id), c));
      }
    }

    const commentsColRef = collection(db, 'comments');
    const commentsSnap = await withTimeout(getDocs(query(commentsColRef, limit(1))));
    if (commentsSnap.empty) {
      console.log('🌱 Seeding initial comments to Firestore...');
      const defaultComments: Comment[] = [
        {
          id: 'comment-1',
          claimId: 'claim-1',
          authorName: 'Lagos Public Infrastructure Centre',
          authorRole: 'admin',
          text: 'Assigned to the Lagos State Ministry of Works & Infrastructure road crew for physical inspection and speed bump assessment.',
          createdAt: '2026-07-14T10:30:00Z',
        },
        {
          id: 'comment-2',
          claimId: 'claim-3',
          authorName: 'Chidi Okafor',
          authorRole: 'claimant',
          text: 'The flow is increasing, some water is starting to flood the main entrance road near Wuse Mall as well.',
          createdAt: '2026-07-16T09:00:00Z',
        },
        {
          id: 'comment-3',
          claimId: 'claim-3',
          authorName: 'FCT Water Board Team',
          authorRole: 'admin',
          text: 'FCT Water Board Emergency Maintenance Team dispatched. Crew ETA is 20 minutes.',
          createdAt: '2026-07-16T09:15:00Z',
        }
      ];
      for (const comm of defaultComments) {
        await withTimeout(setDoc(doc(db, 'comments', comm.id), comm));
      }
    }
  } catch (err) {
    console.error('⚠️ Failed to seed initial data to Firestore:', err);
  }
};

// Users functions
export const getUsers = async (): Promise<User[]> => {
  if (isFirebaseEnabled) {
    try {
      const usersCol = collection(db, 'users');
      const snap = await withTimeout(getDocs(usersCol));
      const list: User[] = [];
      snap.forEach(doc => {
        list.push(doc.data() as User);
      });
      return list;
    } catch (err) {
      console.error('Firestore getUsers failed, falling back to LocalStorage:', err);
    }
  }
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const registerUser = async (name: string, email: string, role: 'claimant' | 'admin'): Promise<User> => {
  if (isFirebaseEnabled) {
    try {
      const users = await getUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new Error('An account with this email already exists.');
      }
      const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role,
      };
      await withTimeout(setDoc(doc(db, 'users', newUser.id), newUser));
      return newUser;
    } catch (err: any) {
      console.error('Firestore registration failed:', err);
      throw err;
    }
  }

  // Local Fallback
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const existing = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email already exists.');
  }
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    role,
  };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

export const loginUser = async (email: string, role: 'claimant' | 'admin'): Promise<User> => {
  const users = await getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
  if (!user) {
    if (role === 'admin' && email === 'admin@city.gov') {
      const defaultAdmin = INITIAL_USERS.find(u => u.role === 'admin')!;
      if (isFirebaseEnabled) {
        try {
          await withTimeout(setDoc(doc(db, 'users', defaultAdmin.id), defaultAdmin));
        } catch (err) {
          console.error('Firestore default admin seed failed:', err);
        }
      } else {
        const localUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        localUsers.push(defaultAdmin);
        localStorage.setItem(USERS_KEY, JSON.stringify(localUsers));
      }
      return defaultAdmin;
    }
    if (role === 'claimant' && email === 'citizen@example.com') {
      const defaultClaimant = INITIAL_USERS.find(u => u.role === 'claimant')!;
      if (isFirebaseEnabled) {
        try {
          await withTimeout(setDoc(doc(db, 'users', defaultClaimant.id), defaultClaimant));
        } catch (err) {
          console.error('Firestore default claimant seed failed:', err);
        }
      } else {
        const localUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        localUsers.push(defaultClaimant);
        localStorage.setItem(USERS_KEY, JSON.stringify(localUsers));
      }
      return defaultClaimant;
    }
    throw new Error(`Invalid credentials for ${role === 'admin' ? 'Admin' : 'Claimant'} role.`);
  }
  return user;
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  return JSON.parse(stored);
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Claims functions
export const getClaims = async (): Promise<Claim[]> => {
  if (isFirebaseEnabled) {
    try {
      const claimsCol = collection(db, 'claims');
      const snap = await withTimeout(getDocs(claimsCol));
      const list: Claim[] = [];
      snap.forEach(doc => {
        list.push(doc.data() as Claim);
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error('Firestore getClaims failed, falling back to LocalStorage:', err);
    }
  }
  return JSON.parse(localStorage.getItem(CLAIMS_KEY) || '[]');
};

export const createClaim = async (claimData: Omit<Claim, 'id' | 'trackingNumber' | 'createdAt' | 'status'>): Promise<Claim> => {
  const trackingNumber = `CIVIC-${Math.floor(10000 + Math.random() * 90000)}-${
    claimData.category === 'roads' ? 'RD' : claimData.category === 'hospitals' ? 'HP' : 'IN'
  }`;
  
  const newClaim: Claim = {
    ...claimData,
    id: `claim-${Date.now()}`,
    trackingNumber,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseEnabled) {
    try {
      await withTimeout(setDoc(doc(db, 'claims', newClaim.id), newClaim));
      return newClaim;
    } catch (err) {
      console.error('Firestore createClaim failed, falling back to LocalStorage:', err);
    }
  }

  const claims = await getClaims();
  claims.unshift(newClaim);
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
  return newClaim;
};

export const updateClaimStatus = async (
  id: string, 
  status: 'pending' | 'in_progress' | 'resolved', 
  notes?: string
): Promise<Claim> => {
  if (isFirebaseEnabled) {
    try {
      const claimRef = doc(db, 'claims', id);
      const updateData: any = { status };
      if (status === 'resolved') {
        updateData.resolvedAt = new Date().toISOString();
        updateData.resolvedNotes = notes || 'The reported issue has been verified and successfully resolved by the municipal operations department.';
      } else {
        updateData.resolvedAt = null;
        updateData.resolvedNotes = null;
      }
      await withTimeout(updateDoc(claimRef, updateData));
      
      const claims = await getClaims();
      const updated = claims.find(c => c.id === id);
      if (!updated) throw new Error('Claim not found after update.');
      return updated;
    } catch (err) {
      console.error('Firestore updateClaimStatus failed, falling back to LocalStorage:', err);
    }
  }

  const claims = await getClaims();
  const index = claims.findIndex(c => c.id === id);
  if (index === -1) {
    throw new Error('Claim not found.');
  }
  
  const updatedClaim = { ...claims[index] };
  updatedClaim.status = status;
  
  if (status === 'resolved') {
    updatedClaim.resolvedAt = new Date().toISOString();
    updatedClaim.resolvedNotes = notes || 'The reported issue has been verified and successfully resolved by the municipal operations department.';
  } else {
    delete updatedClaim.resolvedAt;
    delete updatedClaim.resolvedNotes;
  }
  
  claims[index] = updatedClaim;
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
  return updatedClaim;
};

// Comments functions
export const getComments = async (claimId?: string): Promise<Comment[]> => {
  if (isFirebaseEnabled) {
    try {
      const commentsCol = collection(db, 'comments');
      const snap = await withTimeout(getDocs(commentsCol));
      const list: Comment[] = [];
      snap.forEach(doc => {
        list.push(doc.data() as Comment);
      });
      if (claimId) {
        return list
          .filter(c => c.claimId === claimId)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      return list;
    } catch (err) {
      console.error('Firestore getComments failed, falling back to LocalStorage:', err);
    }
  }

  const allComments: Comment[] = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  if (claimId) {
    return allComments.filter(c => c.claimId === claimId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  return allComments;
};

export const addComment = async (claimId: string, authorName: string, authorRole: 'claimant' | 'admin', text: string): Promise<Comment> => {
  const newComment: Comment = {
    id: `comment-${Date.now()}`,
    claimId,
    authorName,
    authorRole,
    text,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseEnabled) {
    try {
      await withTimeout(setDoc(doc(db, 'comments', newComment.id), newComment));
      return newComment;
    } catch (err) {
      console.error('Firestore addComment failed, falling back to LocalStorage:', err);
    }
  }

  const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]');
  allComments.push(newComment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
  return newComment;
};
