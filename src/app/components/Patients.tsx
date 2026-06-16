import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { Search, PlusCircle, Filter, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useBreeds, useSpecies } from "../../hooks/useCatalogs";
import { useOwners } from "../../hooks/useOwners";
import { useCreatePatient, usePatients } from "../../hooks/usePatients";
import { PATIENT_SEX_OPTIONS } from "../../config/patientCatalogs";
import type { PatientCreate } from "../../types/patients";
import { OwnerForm } from "./OwnerForm";

export function Patients() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const showNewForm = searchParams.get("action") === "new" || location.pathname.endsWith("/new");
  const ownerIdParam = searchParams.get("owner_id");

  const { data: species, loading: speciesLoading, error: speciesError } = useSpecies();
  const { data: owners, loading: ownersLoading, error: ownersError, refetch: refetchOwners } = useOwners();
  const { data: patients, loading: patientsLoading, error: patientsError, refetch: refetchPatients } = usePatients();
  const createPatient = useCreatePatient();
  const [search, setSearch] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [showQuickOwnerForm, setShowQuickOwnerForm] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [patientSuccess, setPatientSuccess] = useState<string | null>(null);
  const [newPatient, setNewPatient] = useState({
    name: "",
    owner_id: "",
    species_id: "",
    breed_id: "",
    sex: "",
    birth_date: "",
    weight: "",
  });

  useEffect(() => {
    if (!showNewForm || !ownerIdParam) {
      return;
    }

    const ownerExists = owners.some((owner) => owner.id === Number(ownerIdParam));
    if (!ownerExists) {
      return;
    }

    setNewPatient((current) =>
      current.owner_id === ownerIdParam ? current : { ...current, owner_id: ownerIdParam }
    );
  }, [ownerIdParam, owners, showNewForm]);

  const selectedSpeciesId = newPatient.species_id ? Number(newPatient.species_id) : null;
  const {
    data: breeds,
    loading: breedsLoading,
    error: breedsError,
  } = useBreeds(selectedSpeciesId);

  const filteredPatients = patients.filter((patient) => {
    const ownerName = `${patient.owner.first_name} ${patient.owner.last_name ?? ""}`.trim();
    const matchesSearch =
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      ownerName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterSpecies === "all" || patient.species.name === filterSpecies;
    return matchesSearch && matchesFilter;
  });

  const handleSpeciesChange = (speciesId: string) => {
    setNewPatient({ ...newPatient, species_id: speciesId, breed_id: "" });
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatientError(null);
    setPatientSuccess(null);

    if (!newPatient.owner_id) {
      setPatientError("Selecciona o registra un propietario antes de crear el paciente.");
      return;
    }

    if (!owners.some((owner) => owner.id === Number(newPatient.owner_id))) {
      setPatientError("El propietario seleccionado no existe en el listado cargado desde backend.");
      return;
    }

    if (!newPatient.name.trim() || !newPatient.species_id || !newPatient.breed_id || !newPatient.sex) {
      setPatientError("Completa nombre, propietario, especie, raza y sexo del paciente.");
      return;
    }

    const selectedBreed = breeds.find((breed) => breed.id === Number(newPatient.breed_id));
    if (!selectedBreed || selectedBreed.species_id !== Number(newPatient.species_id)) {
      setPatientError("La raza seleccionada no pertenece a la especie elegida.");
      return;
    }

    if (newPatient.weight && Number(newPatient.weight) <= 0) {
      setPatientError("El peso debe ser un numero positivo.");
      return;
    }

    const payload: PatientCreate = {
      name: newPatient.name.trim(),
      owner_id: Number(newPatient.owner_id),
      species_id: Number(newPatient.species_id),
      breed_id: Number(newPatient.breed_id),
      sex: newPatient.sex,
      birth_date: newPatient.birth_date || null,
      weight: newPatient.weight ? Number(newPatient.weight) : null,
    };

    try {
      const createdPatient = await createPatient.submit(payload);
      setPatientSuccess(`Paciente ${createdPatient.name} registrado con propietario ${createdPatient.owner.first_name}.`);
      await refetchPatients();
      setNewPatient({
        name: "",
        owner_id: ownerIdParam ?? "",
        species_id: "",
        breed_id: "",
        sex: "",
        birth_date: "",
        weight: "",
      });
    } catch (error) {
      setPatientError(error instanceof Error ? error.message : "No fue posible registrar el paciente.");
    }
  };

  if (showNewForm) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Registrar Nuevo Paciente</h1>
            <button
              onClick={() => navigate("/patients")}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {(speciesError || breedsError || ownersError || createPatient.error || patientError) && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">
                {speciesError ?? breedsError ?? ownersError ?? createPatient.error ?? patientError}
              </p>
            </div>
          )}

          {(patientSuccess || createPatient.success) && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800">{patientSuccess ?? createPatient.success}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Propietario del paciente</h2>
                  <p className="text-sm text-gray-600">
                    Flujo principal: crear el propietario en el modulo Propietarios y seleccionarlo aqui.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickOwnerForm((current) => !current)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition text-sm font-medium"
                >
                  {showQuickOwnerForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                  {showQuickOwnerForm ? "Ocultar acceso rapido" : "Crear propietario rapido"}
                </button>
              </div>

              {showQuickOwnerForm && (
                <OwnerForm
                  onCancel={() => setShowQuickOwnerForm(false)}
                  onAfterCreate={refetchOwners}
                  onCreated={(owner) => {
                    setNewPatient((current) => ({ ...current, owner_id: String(owner.id) }));
                    setShowQuickOwnerForm(false);
                  }}
                />
              )}
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Propietario
                </label>
                <select
                  value={newPatient.owner_id}
                  onChange={(e) => setNewPatient({ ...newPatient, owner_id: e.target.value })}
                  disabled={ownersLoading || Boolean(ownersError)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  required
                >
                  <option value="">
                    {ownersLoading ? "Cargando propietarios..." : "Selecciona un propietario"}
                  </option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      #{owner.id} - {owner.first_name} {owner.last_name ?? ""}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  El listado proviene de GET /api/v1/owners/. El payload final envia owner_id numerico al backend.
                </p>
              </div>

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
                  value={newPatient.species_id}
                  onChange={(e) => handleSpeciesChange(e.target.value)}
                  disabled={speciesLoading || Boolean(speciesError)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  required
                >
                  <option value="">
                    {speciesLoading ? "Cargando especies..." : "Selecciona una especie"}
                  </option>
                  {species.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raza
                </label>
                <select
                  value={newPatient.breed_id}
                  onChange={(e) => setNewPatient({ ...newPatient, breed_id: e.target.value })}
                  disabled={!newPatient.species_id || breedsLoading || Boolean(breedsError)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                  required
                >
                  <option value="">
                    {!newPatient.species_id
                      ? "Selecciona una especie primero"
                      : breedsLoading
                      ? "Cargando razas..."
                      : "Selecciona una raza"}
                  </option>
                  {breeds.map((breed) => (
                    <option key={breed.id} value={breed.id}>
                      {breed.name}
                    </option>
                  ))}
                </select>
                {newPatient.species_id && !breedsLoading && !breedsError && breeds.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    No hay razas registradas para la especie seleccionada.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sexo
                </label>
                <select
                  value={newPatient.sex}
                  onChange={(e) => setNewPatient({ ...newPatient, sex: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecciona sexo</option>
                  {PATIENT_SEX_OPTIONS.map((sex) => (
                    <option key={sex} value={sex}>
                      {sex}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={newPatient.birth_date}
                  onChange={(e) => setNewPatient({ ...newPatient, birth_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={newPatient.weight}
                  onChange={(e) => setNewPatient({ ...newPatient, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Kg"
                />
              </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={
                    createPatient.loading ||
                    !newPatient.owner_id ||
                    !newPatient.species_id ||
                    !newPatient.breed_id ||
                    !newPatient.sex ||
                    speciesLoading ||
                    ownersLoading ||
                    Boolean(speciesError || ownersError)
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {createPatient.loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {createPatient.loading ? "Guardando..." : "Guardar Paciente"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/patients")}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion de Pacientes</h1>
          <p className="text-gray-600 mt-1">Administra y consulta el registro de pacientes</p>
        </div>
        <button
          onClick={() => navigate("/patients/new")}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Nuevo Paciente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {patientsError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{patientsError}</p>
          </div>
        )}

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
              {species.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nacimiento</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patientsLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                    Cargando pacientes reales desde backend...
                  </td>
                </tr>
              )}
              {!patientsLoading && filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-600">
                    No hay pacientes registrados para los filtros actuales.
                  </td>
                </tr>
              )}
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
                  <td className="px-4 py-3 text-gray-700">
                    {patient.species.name} - {patient.breed?.name ?? "Sin raza"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {patient.owner.first_name} {patient.owner.last_name ?? ""}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {patient.birth_date ?? "Sin fecha"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Registrado
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
