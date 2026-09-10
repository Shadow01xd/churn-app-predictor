import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import Layout from '../components/Layout';
import {
  deleteCustomer,
  listCustomers,
  repredictCustomer,
  type ListParams,
} from '../customers/api';
import { riskColor, type Customer, type RiskLabel } from '../customers/types';

const PAGE_SIZE = 20;

function RiskBadge({ customer }: { customer: Customer }) {
  const { risk_label, churn_probability } = customer;
  if (!risk_label || churn_probability == null) {
    return <span style={{ color: 'var(--muted)' }}>sin predicción</span>;
  }
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        fontSize: '0.8rem',
        fontWeight: 700,
        color: '#fff',
        background: riskColor(risk_label),
      }}
    >
      {risk_label} · {(churn_probability * 100).toFixed(0)}%
    </span>
  );
}

export default function CustomersListPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [risk, setRisk] = useState<RiskLabel | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ListParams = { page, limit: PAGE_SIZE };
      if (risk) params.risk = risk;
      if (search.trim()) params.search = search.trim();
      const res = await listCustomers(params);
      setCustomers(res.data);
      setTotal(res.total);
      setPages(res.pages);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar los clientes'));
    } finally {
      setLoading(false);
    }
  }, [page, risk, search]);

  // Debounce de la búsqueda / filtros
  useEffect(() => {
    const t = setTimeout(() => void load(), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  // Al cambiar filtros, volver a la página 1
  useEffect(() => {
    setPage(1);
  }, [risk, search]);

  async function handleDelete(customer: Customer) {
    if (!window.confirm(`¿Eliminar a ${customer.name}?`)) return;
    setBusyId(customer.id);
    try {
      await deleteCustomer(customer.id);
      void load();
    } catch (err) {
      alert(getErrorMessage(err, 'No se pudo eliminar'));
    } finally {
      setBusyId(null);
    }
  }

  async function handleRepredict(customer: Customer) {
    setBusyId(customer.id);
    try {
      const updated = await repredictCustomer(customer.id);
      setCustomers((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
    } catch (err) {
      alert(getErrorMessage(err, 'No se pudo recalcular'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Layout>
      <div className="page-head">
        <h2>Clientes {total > 0 && <small style={{ color: 'var(--muted)' }}>({total})</small>}</h2>
        <button onClick={() => navigate('/customers/new')}>+ Nuevo cliente</button>
      </div>

      <div className="filters">
        <input
          placeholder="Buscar por nombre o email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={risk} onChange={(e) => setRisk(e.target.value as RiskLabel | '')}>
          <option value="">Todos los riesgos</option>
          <option value="alto">Riesgo alto</option>
          <option value="medio">Riesgo medio</option>
          <option value="bajo">Riesgo bajo</option>
        </select>
      </div>

      {loading && <p>Cargando…</p>}

      {error && !loading && (
        <div className="alert" role="alert">
          {error}{' '}
          <button className="secondary" onClick={() => void load()}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <p style={{ color: 'var(--muted)' }}>
          {total === 0 && !risk && !search
            ? 'Todavía no hay clientes. Creá el primero con “+ Nuevo cliente”.'
            : 'Ningún cliente coincide con el filtro.'}
        </p>
      )}

      {!loading && !error && customers.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Riesgo de churn</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/customers/${c.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>
                      <RiskBadge customer={c} />
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {c.risk_label == null && (
                        <button
                          className="secondary"
                          style={{ marginRight: 8 }}
                          disabled={busyId === c.id}
                          onClick={() => void handleRepredict(c)}
                        >
                          {busyId === c.id ? '…' : 'Predecir'}
                        </button>
                      )}
                      <Link
                        to={`/customers/${c.id}/edit`}
                        className="secondary"
                        style={{ marginRight: 8 }}
                      >
                        Editar
                      </Link>
                      <button
                        className="danger"
                        disabled={busyId === c.id}
                        onClick={() => void handleDelete(c)}
                      >
                        {busyId === c.id ? '…' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="pager">
              <button
                className="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Anterior
              </button>
              <span>
                Página {page} de {pages}
              </span>
              <button
                className="secondary"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
