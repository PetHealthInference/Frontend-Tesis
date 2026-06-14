export const API_ROUTES = {
  auth: {
    login: "/api/v1/auth/login",
  },
  catalogs: {
    species: "/api/v1/species",
    breeds: (speciesId: number) => `/api/v1/breeds?species_id=${speciesId}`,
    symptoms: "/api/v1/symptoms",
    clinicalVariables: "/api/v1/clinical-variables",
    diseases: "/api/v1/diseases",
    riskLevels: "/api/v1/risk-levels",
  },
  evaluations: {
    create: "/api/v1/evaluations",
    byId: (evaluationId: number) => `/api/v1/evaluations/${evaluationId}`,
    byPatient: (patientId: number) => `/api/v1/patients/${patientId}/evaluations`,
    history: (patientId: number) => `/api/v1/patients/${patientId}/history`,
    process: (evaluationId: number) => `/api/v1/evaluaciones/${evaluationId}/procesar`,
    results: (evaluationId: number) => `/api/v1/evaluations/${evaluationId}/results`,
    activatedRules: (resultId: number) => `/api/v1/results/${resultId}/activated-rules`,
  },
  owners: {
    collection: "/api/v1/owners/",
    byId: (ownerId: number) => `/api/v1/owners/${ownerId}`,
  },
  patients: {
    collection: "/api/v1/patients",
    byId: (patientId: number) => `/api/v1/patients/${patientId}`,
  },
};
