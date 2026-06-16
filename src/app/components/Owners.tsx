import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, CheckCircle2, Edit, Loader2, PlusCircle, Search, Trash2, X } from "lucide-react";
import { OwnerForm } from "./OwnerForm";
import { useDeleteOwner, useOwners } from "../../hooks/useOwners";
import { usePatients } from "../../hooks/usePatients";
import type { Owner } from "../../types/owners";

function getOwnerName(owner: Owner): string {
  return `${owner.first_name} ${owner.last_name ?? ""}`.trim();
}

function getDeleteErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.toLowerCase().includes("registered patients")) {
    return "No se puede eliminar el propietario porque tiene pacientes asociados.";
  }

  return error instanceof Error ? error.message : "No fue posible eliminar el propietario.";
}

const ownerWithPatientsMessage = "No se puede eliminar el propietario porque tiene mascotas asociadas.";

export function Owners() {
  const navigate = useNavigate();
  const { data: owners, loading, error, refetch } = useOwners();
  const { data: patients, loading: patientsLoading, error: patientsError } = usePatients();
  const deleteOwner = useDeleteOwner();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const filteredOwners = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return owners;
    }

    return owners.filter((owner) => {
      const fields = [
        owner.first_name,
        owner.last_name ?? "",
        owner.email ?? "",
        owner.phone ?? "",
      ];

      return fields.some((field) => field.toLowerCase().includes(query));
    });
  }, [owners, search]);

  const handleNewOwner = () => {
    setEditingOwner(null);
    setShowForm(true);
    setLocalError(null);
    setStatusMessage(null);
  };

  const handleEditOwner = (owner: Owner) => {
    setEditingOwner(owner);
    setShowForm(true);
    setLocalError(null);
    setStatusMessage(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingOwner(null);
  };

  const handleDeleteOwner = async (owner: Owner) => {
    const linkedPatients = patients.filter((patient) => patient.owner.id === owner.id || patient.owner_id === owner.id);

    if (patientsLoading) {
      setLocalError("Espera a que cargue la informacion de mascotas antes de eliminar propietarios.");
      setStatusMessage(null);
      return;
    }

    if (patientsError) {
      setLocalError("No se pudo verificar si el propietario tiene mascotas asociadas.");
      setStatusMessage(null);
      return;
    }

    if (linkedPatients.length > 0) {
      setLocalError(ownerWithPatientsMessage);
      setStatusMessage(null);
      return;
    }

    const confirmed = window.confirm(
      `Confirma la eliminacion del propietario ${getOwnerName(owner)}. Esta accion solo se aplicara si el backend lo permite.`
    );

    if (!confirmed) {
      return;
    }

    setLocalError(null);
    setStatusMessage(null);

    try {
      await deleteOwner.submit(owner.id);
      setStatusMessage("Propietario eliminado correctamente.");
      await refetch();
    } catch (err) {
      setLocalError(getDeleteErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion de Propietarios</h1>
          <p className="text-gray-600 mt-1">
            Registra responsables clinicos antes de asociarlos a pacientes.
          </p>
        </div>
        <button
          onClick={handleNewOwner}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Nuevo propietario
        </button>
      </div>

      {(error || patientsError || localError || deleteOwner.error) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{localError ?? deleteOwner.error ?? patientsError ?? error}</p>
        </div>
      )}

      {(statusMessage || deleteOwner.success) && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-800">{statusMessage ?? deleteOwner.success}</p>
        </div>
      )}

      {showForm && !editingOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Nuevo propietario</h2>
                <p className="text-sm text-gray-600">
                  Registra un responsable clinico.
                </p>
              </div>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <OwnerForm
              mode="create"
              initialOwner={null}
              onCancel={closeForm}
              onAfterCreate={refetch}
              onCreated={(owner) => {
                setStatusMessage(`Propietario ${getOwnerName(owner)} registrado correctamente.`);
                closeForm();
              }}
            />
          </div>
        </div>
      )}

      {showForm && editingOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Actualizar propietario</h2>
                <p className="text-sm text-gray-600">
                  Modifica la informacion del propietario sin salir del listado.
                </p>
              </div>
              <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <OwnerForm
              mode="edit"
              initialOwner={editingOwner}
              onCancel={closeForm}
              onAfterUpdate={refetch}
              onUpdated={(owner) => {
                setStatusMessage(`Propietario ${getOwnerName(owner)} actualizado correctamente.`);
                closeForm();
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative mb-6">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, apellido, correo o telefono..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nombre completo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Telefono</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Correo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Direccion</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Mascotas</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-600">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cargando propietarios reales desde backend...
                    </span>
                  </td>
                </tr>
              )}

              {!loading && filteredOwners.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-600">
                    No hay propietarios registrados para los filtros actuales.
                  </td>
                </tr>
              )}

              {filteredOwners.map((owner) => {
                const linkedPatientsCount = patients.filter(
                  (patient) => patient.owner.id === owner.id || patient.owner_id === owner.id
                ).length;

                return (
                  <tr
                    key={owner.id}
                    onClick={() => navigate(`/owners/${owner.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-700 font-medium">{owner.first_name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{getOwnerName(owner)}</p>
                          <p className="text-xs text-gray-500">ID backend: {owner.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{owner.phone ?? "Sin telefono"}</td>
                    <td className="px-4 py-3 text-gray-700">{owner.email ?? "Sin correo"}</td>
                    <td className="px-4 py-3 text-gray-700">{owner.address ?? "Sin direccion"}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {patientsLoading ? "Verificando..." : linkedPatientsCount}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleEditOwner(owner);
                          }}
                          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDeleteOwner(owner);
                          }}
                          disabled={deleteOwner.loading}
                          className="inline-flex items-center gap-2 px-3 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {deleteOwner.loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
