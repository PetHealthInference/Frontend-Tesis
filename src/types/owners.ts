export interface Owner {
  id: number;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface OwnerCreate {
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface OwnerUpdate {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export type OwnerResponse = Owner;
