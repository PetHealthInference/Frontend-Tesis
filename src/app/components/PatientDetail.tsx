import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, FileText, Calendar, Activity, AlertCircle } from 'lucide-react';

const mockPatientDetails = {
  '1': {
    name: 'Max',
    species: 'Perro',
    breed: 'Golden Retriever',
    owner: 'Juan Pérez',
    age: '3 años',
    weight: '32 kg',
    status: 'Estable',
    history: [
      { date: '2026-04-15', type: 'Consulta', description: 'Revisión general - Estado saludable' },
      { date: '2026-03-10', type: 'Vacunación', description: 'Vacuna antirrábica aplicada' },
      { date: '2026-02-05', type: 'Evaluación', description: 'Evaluación por tos persistente - Diagnosticado con traqueobronquitis' },
    ],
  },
};

export function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = mockPatientDetails[id as keyof typeof mockPatientDetails];

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-600">Paciente no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/patients')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Pacientes
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-indigo-700">{patient.name[0]}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-gray-600">{patient.species} - {patient.breed}</p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/evaluation?patientId=${id}`)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <FileText className="w-5 h-5" />
            Nueva Evaluación
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Propietario</p>
            <p className="font-medium text-gray-900">{patient.owner}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Edad</p>
            <p className="font-medium text-gray-900">{patient.age}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Peso</p>
            <p className="font-medium text-gray-900">{patient.weight}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">Estado Actual</h2>
        </div>
        <div className="mb-6">
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
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

        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-700" />
          <h2 className="text-xl font-bold text-gray-900">Historial Clínico</h2>
        </div>

        <div className="space-y-3">
          {patient.history.map((entry, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-indigo-600">{entry.date}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {entry.type}
                    </span>
                  </div>
                  <p className="text-gray-700">{entry.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
