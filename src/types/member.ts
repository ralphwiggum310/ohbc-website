export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  relationship: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  isPrimary: boolean;
}

export interface Member {
  id: string;
  familyName: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: string;
  email: string;
  members: FamilyMember[];
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberDirectoryFilters {
  searchQuery?: string;
  letter?: string;
}
