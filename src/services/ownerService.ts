import type { Owner, OwnerCreate, OwnerResponse, OwnerUpdate } from "../types/owners";
import { apiClient } from "./apiClient";
import { API_ROUTES } from "./apiRoutes";

export const ownerService = {
  createOwner(payload: OwnerCreate): Promise<OwnerResponse> {
    return apiClient.post<OwnerResponse>(API_ROUTES.owners.collection, payload);
  },

  getOwners(): Promise<Owner[]> {
    return apiClient.get<Owner[]>(API_ROUTES.owners.collection);
  },

  getOwnerById(ownerId: number): Promise<OwnerResponse> {
    return apiClient.get<OwnerResponse>(API_ROUTES.owners.byId(ownerId));
  },

  updateOwner(ownerId: number, payload: OwnerUpdate): Promise<OwnerResponse> {
    return apiClient.put<OwnerResponse>(API_ROUTES.owners.byId(ownerId), payload);
  },

  deleteOwner(ownerId: number): Promise<void> {
    return apiClient.delete<void>(API_ROUTES.owners.byId(ownerId));
  },
};
