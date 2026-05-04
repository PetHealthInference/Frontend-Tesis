import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search, PlusCircle, Filter, X } from 'lucide-react';

const mockPatients = [
  { id: 1, name: 'Max', species: 'Perro', breed: 'Golden Retriever', owner: 'Juan Pérez', age: '3 años', status: 'Estable' },
  { id: 2, name: 'Luna', species: 'Gato', breed: 'Siamés', owner: 'María García', age: '2 años', status: 'En Observación' },
  { id: 3, name: 'Rocky', species: 'Perro', breed: 'Pastor Alemán', owner: 'Carlos López', age: '5 años', status: 'Crítico' },
  { id: 4, name: 'Michi', species: 'Gato', breed: 'Persa', owner: 'Ana Martínez', age: '1 año', status: 'Estable' },
  { id: 5, name: 'Toby', species: 'Perro', breed: 'Beagle', owner: 'Luis Rodríguez', age: '4 años', status: 'Estable' },
];

export function Patients() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const showNewForm = searchParams.get('action') === 'new';

  const [search, setSearch] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('all');
  const [newPatient, setNewPatient] = useState({
    name: '',
    species: 'Perro',
    breed: '',
    owner: '',
    age: '',
  });

  const filteredPatients = mockPatients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.owner.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterSpecies === 'all' || patient.species === filterSpecies;
    return matchesSearch && matchesFilter;
  });

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({});
    navigate('/patients');
  };

  if (showNewForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Registrar Nuevo Paciente</h1>
            <button
              onClick={() => setSearchParams({})}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreatePatient} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Paciente
                </label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especie
                </label>
                <select
                  value={newPatient.species}
                  onChange={(e) => setNewPatient({ ...newPatient, species: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option>Perro</option>
                  <option>Gato</option>
                  <option>Conejo</option>
                  <option>Ave</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raza
                </label>
                <input
                  type="text"
                  value={newPatient.breed}
                  onChange={(e) => setNewPatient({ ...newPatient, breed: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad
                </label>
                <input
                  type="text"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: 3 años"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Propietario
                </label>
                <input
                  type="text"
                  value={newPatient.owner}
                  onChange={(e) => setNewPatient({ ...newPatient, owner: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Guardar Paciente
              </button>
              <button
                type="button"
                onClick={() => setSearchParams({})}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-600 mt-1">Administra y consulta el registro de pacientes</p>
        </div>
        <button
          onClick={() => setSearchParams({ action: 'new' })}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Nuevo Paciente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre de paciente o propietario..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">Todas las especies</option>
              <option value="Perro">Perros</option>
              <option value="Gato">Gatos</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Paciente</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Especie/Raza</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Propietario</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Edad</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-700 font-medium">{patient.name[0]}</span>
                      </div>
                      <span className="font-medium text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{patient.species} - {patient.breed}</td>
                  <td className="px-4 py-3 text-gray-700">{patient.owner}</td>
                  <td className="px-4 py-3 text-gray-700">{patient.age}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        patient.status === 'Crítico'
                          ? 'bg-red-100 text-red-700'
                          : patient.status === 'En Observación'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {patient.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
