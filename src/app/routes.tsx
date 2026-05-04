import { createBrowserRouter } from "react-router";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { Patients } from "./components/Patients";
import { PatientDetail } from "./components/PatientDetail";
import { ClinicalEvaluation } from "./components/ClinicalEvaluation";
import { InferenceEngine } from "./components/InferenceEngine";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "patients", Component: Patients },
      { path: "patients/:id", Component: PatientDetail },
      { path: "evaluation", Component: ClinicalEvaluation },
      { path: "evaluation/:id", Component: ClinicalEvaluation },
      { path: "inference/:evaluationId", Component: InferenceEngine },
    ],
  },
]);
