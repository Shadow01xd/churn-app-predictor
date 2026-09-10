import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import Layout from '../components/Layout';
import { deleteCustomer, getCustomer, repredictCustomer } from '../customers/api';
import { CUSTOMER_FIELDS, riskColor, type Customer } from '../customers/types';

function labelFor(key: string, value: unknown): string {
  const field = CUSTOMER_FIELDS.find((f) => f.key === key);
  if (field?.type === 'select') {
    const opt = field.options.find((o) => String(o.value) === String(value));
    return opt ? opt.label : String(value);
  }
  return String(value);
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [repredicting, setRepredicting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setCustomer(await getCustomer(id));
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo cargar el cliente'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete() {
    if (!customer) return;
    if (!window.confirm(`¿Eliminar a ${customer.name}?`)) return;
    try {
      await deleteCustomer(customer.id);
      navigate('/', { replace: true });
    } catch (err) {
      alert(getErrorMessage(err, 'No se pudo eliminar'));
    }
  }

  async function handleRepredict() {
    if (!customer) return;
    setRepredicting(true);
    try {
      setCustomer(await repredictCustomer(customer.id));
    } catch (err) {
      alert(getErrorMessage(err, 'No se pudo calcular la predicción'));
    } finally {
      setRepredicting(false);
    }
  }

  return (
    <Layout>
      <div className="page-head">
        <button className="secondary" onClick={() => navigate('/')}>
          ← Clientes
        </button>
      </div>

      {loading && <p>Cargando…</p>}
      {error && !loading && (
        <div className="alert" role="alert">
          {error}
        </div>
      )}

      {customer && !loading && (
        <>
          <div className="page-head">
            <h2>{customer.name}</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate(`/customers/${customer.id}/edit`)}>
                Editar
              </button>
              <button className="danger" onClick={() => void handleDelete()}>
                Eliminar
              </button>
            </div>
          </div>

          <div className="prediction-card">
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              Última predicción
            </span>
            {customer.risk_label && customer.churn_probability != null ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <strong
                  style={{ fontSize: '2rem', color: riskColor(customer.risk_label) }}
                >
                  {(customer.churn_probability * 100).toFixed(1)}%
                </strong>
                <span
                  style={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: riskColor(customer.risk_label),
                  }}
                >
                  riesgo {customer.risk_label}
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <p style={{ margin: 0 }}>Sin predicción todavía.</p>
                <button disabled={repredicting} onClick={() => void handleRepredict()}>
                  {repredicting ? 'Calculando…' : 'Calcular ahora'}
                </button>
              </div>
            )}
            {customer.predicted_at && (
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>
                calculada el{' '}
                {new Date(customer.predicted_at).toLocaleString('es')}
              </span>
            )}
          </div>

          <h3>Datos</h3>
          <div className="detail-grid">
            <div>
              <span className="detail-label">Email</span>
              <span>{customer.email}</span>
            </div>
            {CUSTOMER_FIELDS.map((field) => (
              <div key={field.key}>
                <span className="detail-label">{field.label}</span>
                <span>{labelFor(field.key, customer[field.key])}</span>
              </div>
            ))}
            <div>
              <span className="detail-label">Alta</span>
              <span>{new Date(customer.createdAt).toLocaleString('es')}</span>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
