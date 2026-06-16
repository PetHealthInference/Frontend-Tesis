import { useEffect, useState } from "react";
import { Loader2, Save, UserPlus } from "lucide-react";
import { useCreateOwner, useUpdateOwner } from "../../hooks/useOwners";
import type { Owner, OwnerCreate, OwnerUpdate } from "../../types/owners";

interface OwnerFormProps {
  mode?: "create" | "edit";
  initialOwner?: Owner | null;
  onCreated?: (owner: Owner) => void;
  onUpdated?: (owner: Owner) => void;
  onAfterCreate?: () => Promise<void> | void;
  onAfterUpdate?: () => Promise<void> | void;
  onCancel?: () => void;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{6,20}$/;

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function ownerToForm(owner?: Owner | null) {
  return {
    first_name: owner?.first_name ?? "",
    last_name: owner?.last_name ?? "",
    phone: owner?.phone ?? "",
    email: owner?.email ?? "",
    address: owner?.address ?? "",
  };
}

export function OwnerForm({
  mode = "create",
  initialOwner = null,
  onCreated,
  onUpdated,
  onAfterCreate,
  onAfterUpdate,
  onCancel,
}: OwnerFormProps) {
  const createOwner = useCreateOwner();
  const updateOwner = useUpdateOwner();
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState(ownerToForm(initialOwner));

  const isEdit = mode === "edit";
  const loading = isEdit ? updateOwner.loading : createOwner.loading;
  const error = isEdit ? updateOwner.error : createOwner.error;
  const success = isEdit ? updateOwner.success : createOwner.success;

  useEffect(() => {
    setForm(ownerToForm(initialOwner));
    setLocalError(null);
    createOwner.reset();
    updateOwner.reset();
  }, [initialOwner?.id, mode]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!form.first_name.trim()) {
      setLocalError("El nombre del propietario es obligatorio.");
      return;
    }

    if (form.email.trim() && !emailPattern.test(form.email.trim())) {
      setLocalError("Ingresa un correo electronico valido.");
      return;
    }

    if (form.phone.trim() && !phonePattern.test(form.phone.trim())) {
      setLocalError("Ingresa un telefono valido, con 6 a 20 caracteres.");
      return;
    }

    const payload: OwnerCreate | OwnerUpdate = {
      first_name: form.first_name.trim(),
      last_name: normalizeOptional(form.last_name),
      phone: normalizeOptional(form.phone),
      email: normalizeOptional(form.email),
      address: normalizeOptional(form.address),
    };

    if (isEdit) {
      if (!initialOwner) {
        setLocalError("Selecciona un propietario valido para editar.");
        return;
      }

      const owner = await updateOwner.submit(initialOwner.id, payload);
      await onAfterUpdate?.();
      onUpdated?.(owner);
      return;
    }

    const owner = await createOwner.submit(payload as OwnerCreate);
    await onAfterCreate?.();
    onCreated?.(owner);
    setForm(ownerToForm(null));
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        {isEdit ? (
          <Save className="w-5 h-5 text-indigo-600" />
        ) : (
          <UserPlus className="w-5 h-5 text-indigo-600" />
        )}
        <h2 className="font-semibold text-gray-900">
          {isEdit ? "Editar propietario" : "Registrar propietario"}
        </h2>
      </div>

      {(localError || error) && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {localError ?? error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {success}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombres</label>
          <input
            type="text"
            value={form.first_name}
            onChange={(event) => setForm({ ...form, first_name: event.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
          <input
            type="text"
            value={form.last_name}
            onChange={(event) => setForm({ ...form, last_name: event.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefono</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="+51 999 999 999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Correo</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="correo@dominio.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Direccion</label>
          <input
            type="text"
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "Guardando..." : isEdit ? "Actualizar propietario" : "Crear propietario"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
