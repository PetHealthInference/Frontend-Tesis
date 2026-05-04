import { useNavigate } from 'react-router';
import { Users, FileText, Brain, PlusCircle, Search, Activity, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Pacientes Activos', value: '127', icon: Users, color: 'bg-blue-500' },
    { label: 'Evaluaciones Hoy', value: '8', icon: FileText, color: 'bg-green-500' },
    { label: 'Casos Críticos', value: '3', icon: Activity, color: 'bg-red-500' },
    { label: 'Tasa de Éxito', value: '94%', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bienvenido al sistema de gestión clínica veterinaria</p>
      </div>

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
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/patients?action=new')}
              className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group"
            >
              <PlusCircle className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-indigo-900">Registrar Paciente</p>
                <p className="text-sm text-gray-500">Agregar un nuevo paciente al sistema</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/evaluation')}
              className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group"
            >
              <FileText className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-indigo-900">Nueva Evaluación Clínica</p>
                <p className="text-sm text-gray-500">Crear una evaluación para un paciente</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/patients')}
              className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition group"
            >
              <Search className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 group-hover:text-indigo-900">Buscar Paciente</p>
                <p className="text-sm text-gray-500">Consultar pacientes y su historial</p>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Pacientes Recientes</h2>
          <div className="space-y-3">
            {[
              { name: 'Max', species: 'Perro', owner: 'Juan Pérez', status: 'Estable' },
              { name: 'Luna', species: 'Gato', owner: 'María García', status: 'En Observación' },
              { name: 'Rocky', species: 'Perro', owner: 'Carlos López', status: 'Crítico' },
            ].map((patient, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/patients/${idx + 1}`)}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{patient.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-500">{patient.species} - {patient.owner}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    patient.status === 'Crítico'
                      ? 'bg-red-100 text-red-700'
                      : patient.status === 'En Observación'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {patient.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
