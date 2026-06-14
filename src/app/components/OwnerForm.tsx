import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { useCreateOwner } from "../../hooks/useOwners";
import type { Owner, OwnerCreate } from "../../types/owners";

interface OwnerFormProps {
  onCreated: (owner: Owner) => void;
  onAfterCreate?: () => Promise<void> | void;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]{6,20}$/;

function normalizeOptional(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function OwnerForm({ onCreated, onAfterCreate }: OwnerFormProps) {
  const { loading, error, success, submit } = useCreateOwner();
  const [localError, setLocalError] = useState<string | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    address: "",
  });

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

    const payload: OwnerCreate = {
      first_name: form.first_name.trim(),
      last_name: normalizeOptional(form.last_name),
      phone: normalizeOptional(form.phone),
      email: normalizeOptional(form.email),
      address: normalizeOptional(form.address),
    };

    const owner = await submit(payload);
    await onAfterCreate?.();
    onCreated(owner);
    setForm({ first_name: "", last_name: "", phone: "", email: "", address: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-indigo-600" />
        <h2 className="font-semibold text-gray-900">Registrar propietario</h2>
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

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Registrando..." : "Crear propietario"}
      </button>
    </form>
  );
}
