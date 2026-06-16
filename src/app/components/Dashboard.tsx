import { useNavigate } from "react-router";
import { Activity, AlertCircle, FileText, Loader2, PawPrint, Users } from "lucide-react";
import { useDashboard } from "../../hooks/useDashboard";
import type { PatientResponse } from "../../types/patients";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Fecha no disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-PE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function getOwnerName(patient: PatientResponse) {
  return `${patient.owner.first_name} ${patient.owner.last_name ?? ""}`.trim();
}

export function Dashboard() {
  const navigate = useNavigate();
  const {
    recentPatients,
    totalPatients,
    ownersTotal,
    evaluationsTodayTotal,
    criticalCasesTotal,
    loading,
    error,
    warnings,
    refetch,
  } = useDashboard();

  const stats = [
    { label: "Total de pacientes", value: String(totalPatients), icon: PawPrint, color: "bg-sky-600" },
    { label: "Total de propietarios", value: ownersTotal === null ? "N/D" : String(ownersTotal), icon: Users, color: "bg-emerald-600" },
    {
      label: "Evaluaciones hoy",
      value: evaluationsTodayTotal === null ? "N/D" : String(evaluationsTodayTotal),
      icon: FileText,
      color: "bg-violet-600",
    },
    {
      label: "Casos criticos",
      value: criticalCasesTotal === null ? "N/D" : String(criticalCasesTotal),
      icon: Activity,
      color: "bg-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-gray-600 mt-1 dark:text-slate-300">Resumen clinico-operativo basado en datos reales del backend.</p>
      </div>

      {loading && (
        <p className="text-gray-600 flex items-center gap-2 dark:text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando indicadores...
        </p>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 dark:bg-red-950/40 dark:border-red-900">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0 dark:text-red-300" />
          <div>
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            <button onClick={() => void refetch()} className="text-sm text-red-700 underline mt-1 dark:text-red-200">
              Reintentar
            </button>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-100">
          {warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-300">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 dark:text-slate-100">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-slate-900 dark:border dark:border-slate-800">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Pacientes recientes</h2>
            <p className="text-sm text-gray-600 dark:text-slate-300">Ordenados por fecha de registro descendente.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {recentPatients.length === 0 && !loading ? (
            <p className="text-sm text-gray-600 dark:text-slate-300">No hay pacientes registrados para mostrar.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                  <th className="px-3 py-3 font-semibold">Paciente</th>
                  <th className="px-3 py-3 font-semibold">Especie</th>
                  <th className="px-3 py-3 font-semibold">Raza</th>
                  <th className="px-3 py-3 font-semibold">Propietario</th>
                  <th className="px-3 py-3 font-semibold">Fecha de registro</th>
                  <th className="px-3 py-3 font-semibold text-right">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {recentPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/70">
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center dark:bg-sky-950">
                          <PawPrint className="w-5 h-5 text-sky-700 dark:text-sky-200" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-slate-100">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-700 dark:text-slate-300">{patient.species.name}</td>
                    <td className="px-3 py-4 text-sm text-gray-700 dark:text-slate-300">{patient.breed?.name ?? "Sin raza registrada"}</td>
                    <td className="px-3 py-4 text-sm text-gray-700 dark:text-slate-300">{getOwnerName(patient)}</td>
                    <td className="px-3 py-4 text-sm text-gray-700 dark:text-slate-300">{formatDate(patient.created_at)}</td>
                    <td className="px-3 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        className="text-sm font-medium text-indigo-700 hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-100"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
