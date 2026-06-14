import type { Owner, OwnerCreate, OwnerResponse, OwnerUpdate } from "../types/owners";
import { apiClient } from "./apiClient";

export const ownerService = {
  createOwner(payload: OwnerCreate): Promise<OwnerResponse> {
    return apiClient.post<OwnerResponse>("/api/v1/owners/", payload);
  },

  getOwners(): Promise<Owner[]> {
    return apiClient.get<Owner[]>("/api/v1/owners/");
  },

  getOwnerById(ownerId: number): Promise<OwnerResponse> {
    return apiClient.get<OwnerResponse>(`/api/v1/owners/${ownerId}`);
  },

  updateOwner(ownerId: number, payload: OwnerUpdate): Promise<OwnerResponse> {
    return apiClient.put<OwnerResponse>(`/api/v1/owners/${ownerId}`, payload);
  },

  deleteOwner(ownerId: number): Promise<void> {
    return apiClient.delete<void>(`/api/v1/owners/${ownerId}`);
  },
};
