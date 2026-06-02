import { useParams, useNavigate } from "react-router";
import { ArrowLeft, FileText, Calendar, Activity, AlertCircle, Loader2, History } from "lucide-react";
import { usePatient } from "../../hooks/usePatients";
import { PatientEvaluationHistory } from "./PatientEvaluationHistory";

function formatDate(value: string | null): string {
  if (!value) {
    return "No registrada";
  }

  return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium" }).format(new Date(value));
}

function formatOwnerName(firstName: string, lastName: string | null): string {
  return `${firstName} ${lastName ?? ""}`.trim();
}

export function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patientId = id && Number.isFinite(Number(id)) ? Number(id) : null;
  const { data: patient, loading, error, refetch } = usePatient(patientId);

  if (!patientId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-600">Identificador de paciente invalido.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Cargando paciente desde backend...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-4">{error ?? "Paciente no encontrado."}</p>
        <button
          onClick={() => void refetch()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const ownerName = formatOwnerName(patient.owner.first_name, patient.owner.last_name);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/patients")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Pacientes
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-indigo-700">{patient.name[0]}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-gray-600">
                {patient.species.name} - {patient.breed?.name ?? "Sin raza registrada"}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(`/evaluation?patient_id=${patient.id}`)}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <FileText className="w-5 h-5" />
              Nueva Evaluacion
            </button>
            <button
              onClick={() => document.getElementById("historial")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <History className="w-5 h-5" />
              Ver historial
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Propietario</p>
            <p className="font-medium text-gray-900">{ownerName}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Sexo</p>
            <p className="font-medium text-gray-900">{patient.sex}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Peso</p>
            <p className="font-medium text-gray-900">
              {patient.weight ? `${patient.weight} kg` : "No registrado"}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Fecha de nacimiento</p>
            <p className="font-medium text-gray-900">{formatDate(patient.birth_date)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Fecha de registro</p>
            <p className="font-medium text-gray-900">{formatDate(patient.created_at)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">ID backend</p>
            <p className="font-medium text-gray-900">#{patient.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">Estado actual</h2>
        </div>
        <div className="mb-6">
          <span className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-700">
            Paciente registrado
          </span>
        </div>

        <div id="historial" className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">Historial clinico</h2>
        </div>

        <PatientEvaluationHistory patientId={patient.id} />
      </div>
    </div>
  );
}
