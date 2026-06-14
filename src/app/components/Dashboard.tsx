import { useNavigate } from "react-router";
import { Users, FileText, PlusCircle, Search, Activity, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { usePatients } from "../../hooks/usePatients";

export function Dashboard() {
  const navigate = useNavigate();
  const { data: patients, loading, error, refetch } = usePatients();
  const recentPatients = patients.slice(0, 3);

  const stats = [
    { label: "Pacientes registrados", value: String(patients.length), icon: Users, color: "bg-blue-500" },
    { label: "Evaluaciones hoy", value: "N/D", icon: FileText, color: "bg-green-500" },
    { label: "Casos criticos", value: "N/D", icon: Activity, color: "bg-red-500" },
    { label: "Tasa de exito", value: "N/D", icon: TrendingUp, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen operativo basado en datos reales del backend.</p>
      </div>

      {loading && (
        <p className="text-gray-600 flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando indicadores...
        </p>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => void refetch()} className="text-sm text-red-700 underline mt-1">
              Reintentar
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones rapidas</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/patients?action=new")}
              className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group"
            >
              <PlusCircle className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-indigo-900">Registrar paciente</p>
                <p className="text-sm text-gray-500">Agregar un nuevo paciente al sistema</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/evaluation")}
              className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group"
            >
              <FileText className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-indigo-900">Nueva evaluacion clinica</p>
                <p className="text-sm text-gray-500">Crear una evaluacion para un paciente</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/patients")}
              className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group"
            >
              <Search className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-indigo-900">Buscar paciente</p>
                <p className="text-sm text-gray-500">Consultar pacientes y su historial</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pacientes recientes</h2>
          {recentPatients.length === 0 && !loading ? (
            <p className="text-sm text-gray-600">No hay pacientes registrados para mostrar.</p>
          ) : (
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{patient.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">
                        {patient.species.name} - {patient.owner.first_name} {patient.owner.last_name ?? ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    Registrado
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
