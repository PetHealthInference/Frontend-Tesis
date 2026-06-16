import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Edit,
  Loader2,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  PlusCircle,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useDeleteOwner, useOwner } from "../../hooks/useOwners";
import { usePatients } from "../../hooks/usePatients";
import type { Owner } from "../../types/owners";
import { OwnerForm } from "./OwnerForm";

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

export function OwnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ownerId = id && Number.isFinite(Number(id)) ? Number(id) : null;
  const { data: owner, loading, error, refetch } = useOwner(ownerId);
  const { data: patients, loading: patientsLoading, error: patientsError } = usePatients();
  const deleteOwner = useDeleteOwner();
  const [showEditForm, setShowEditForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const ownerPatients = useMemo(() => {
    if (!ownerId) {
      return [];
    }

    return patients.filter((patient) => patient.owner.id === ownerId || patient.owner_id === ownerId);
  }, [ownerId, patients]);

  const handleDeleteOwner = async () => {
    if (!owner) {
      return;
    }

    if (patientsLoading) {
      setLocalError("Espera a que cargue la informacion de mascotas antes de eliminar el propietario.");
      setStatusMessage(null);
      return;
    }

    if (patientsError) {
      setLocalError("No se pudo verificar si el propietario tiene mascotas asociadas.");
      setStatusMessage(null);
      return;
    }

    if (ownerPatients.length > 0) {
      setLocalError(ownerWithPatientsMessage);
      setStatusMessage(null);
      return;
    }

    const confirmed = window.confirm(
      `Confirma la eliminacion del propietario ${getOwnerName(owner)}. El backend rechazara la operacion si tiene pacientes asociados.`
    );

    if (!confirmed) {
      return;
    }

    setLocalError(null);
    setStatusMessage(null);

    try {
      await deleteOwner.submit(owner.id);
      navigate("/owners");
    } catch (err) {
      setLocalError(getDeleteErrorMessage(err));
    }
  };

  if (!ownerId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-600">Identificador de propietario invalido.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Cargando propietario desde backend...
      </div>
    );
  }

  if (error || !owner) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-4">{error ?? "Propietario no encontrado."}</p>
        <button
          onClick={() => void refetch()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const ownerName = getOwnerName(owner);

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/owners")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Propietarios
      </button>

      {(localError || deleteOwner.error || patientsError) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{localError ?? deleteOwner.error ?? patientsError}</p>
        </div>
      )}

      {statusMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-800">{statusMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
              <UserRound className="w-10 h-10 text-indigo-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{ownerName}</h1>
              <p className="text-gray-600">Propietario registrado con ID backend #{owner.id}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setLocalError(null);
                setStatusMessage(null);
                setShowEditForm(true);
              }}
              className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <Edit className="w-5 h-5" />
              Editar
            </button>
            <button
              onClick={handleDeleteOwner}
              disabled={deleteOwner.loading || patientsLoading}
              className="flex items-center justify-center gap-2 border border-red-200 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleteOwner.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
              Eliminar
            </button>
          </div>
        </div>

        {showEditForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Editar informacion del propietario</h2>
                  <p className="text-sm text-gray-600">
                    Actualiza datos mediante PUT /api/v1/owners/:owner_id.
                  </p>
                </div>
                <button onClick={() => setShowEditForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <OwnerForm
                mode="edit"
                initialOwner={owner}
                onCancel={() => setShowEditForm(false)}
                onAfterUpdate={refetch}
                onUpdated={(updatedOwner) => {
                  setStatusMessage(`Propietario ${getOwnerName(updatedOwner)} actualizado correctamente.`);
                  setShowEditForm(false);
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Phone className="w-4 h-4" />
              Telefono
            </div>
            <p className="font-medium text-gray-900">{owner.phone ?? "No registrado"}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Mail className="w-4 h-4" />
              Correo
            </div>
            <p className="font-medium text-gray-900">{owner.email ?? "No registrado"}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <MapPin className="w-4 h-4" />
              Direccion
            </div>
            <p className="font-medium text-gray-900">{owner.address ?? "No registrada"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">Mascotas asociadas</h2>
          </div>
          <button
            onClick={() => navigate(`/patients/new?owner_id=${owner.id}`)}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <PlusCircle className="w-5 h-5" />
            Añadir mascota
          </button>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Paciente</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Especie/Raza</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sexo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Peso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patientsLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-600">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Cargando mascotas asociadas...
                    </span>
                  </td>
                </tr>
              )}

              {!patientsLoading && ownerPatients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-600">
                    Este propietario aun no tiene mascotas registradas.
                  </td>
                </tr>
              )}

              {ownerPatients.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{patient.name}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {patient.species.name} - {patient.breed?.name ?? "Sin raza"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{patient.sex}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {patient.weight ? `${patient.weight} kg` : "No registrado"}
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
