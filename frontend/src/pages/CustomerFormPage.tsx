import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import Layout from '../components/Layout';
import { createCustomer, getCustomer, updateCustomer } from '../customers/api';
import {
  CUSTOMER_FIELDS,
  EMPTY_CUSTOMER,
  type CustomerInput,
} from '../customers/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CustomerFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<CustomerInput>(EMPTY_CUSTOMER);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getCustomer(id)
      .then((c) => {
        if (cancelled) return;
        const { name, email } = c;
        const next: CustomerInput = { ...EMPTY_CUSTOMER, name, email };
        for (const field of CUSTOMER_FIELDS) {
          (next as Record<string, unknown>)[field.key] = c[field.key];
        }
        setForm(next);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'No se pudo cargar el cliente'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function setField(key: keyof CustomerInput, value: string) {
    const field = CUSTOMER_FIELDS.find((f) => f.key === key);
    let parsed: string | number = value;
    if (field?.type === 'number' || key === 'SeniorCitizen') {
      parsed = value === '' ? 0 : Number(value);
    }
    setForm((prev) => ({ ...prev, [key]: parsed }));
  }

  function validate(): string | null {
    if (!form.name.trim() || form.name.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres.';
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      return 'Ingresá un email válido.';
    }
    if (form.tenure < 0 || form.MonthlyCharges < 0 || form.TotalCharges < 0) {
      return 'Los valores numéricos no pueden ser negativos.';
    }
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload: CustomerInput = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      };
      const saved = isEdit
        ? await updateCustomer(id!, payload)
        : await createCustomer(payload);
      navigate(`/customers/${saved.id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar el cliente'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <p>Cargando…</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-head">
        <h2>{isEdit ? 'Editar cliente' : 'Nuevo cliente'}</h2>
        <button className="secondary" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>

      {error && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Nombre</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
            />
          </div>

          {CUSTOMER_FIELDS.map((field) => (
            <div className="field" key={field.key}>
              <label htmlFor={field.key}>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  id={field.key}
                  value={String(form[field.key])}
                  onChange={(e) => setField(field.key, e.target.value)}
                >
                  {field.options.map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.key}
                  type="number"
                  min={field.min}
                  step={field.step}
                  value={String(form[field.key])}
                  onChange={(e) => setField(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving}>
            {saving
              ? 'Guardando…'
              : isEdit
                ? 'Guardar cambios'
                : 'Crear y predecir'}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancelar
          </button>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 8 }}>
          Al guardar, la API calcula la probabilidad de churn con el modelo ML.
        </p>
      </form>
    </Layout>
  );
}
