import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';

export default function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await api.get('/usuarios');
        const filtradas = res.data.filter((u) => u.tipo === 'empresa_parceira');
        setEmpresas(filtradas);
      } catch (err) {
        console.error('Erro ao carregar empresas:', err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const getIniciais = (nome) =>
    nome?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <h1 style={styles.titulo}>🏢 Empresas Parceiras</h1>
        <p style={styles.sub}>Empresas vinculadas ao sistema de avaliação de projetos</p>

        {loading ? (
          <p style={{ color: '#888' }}>Carregando...</p>
        ) : empresas.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: 48 }}>🏢</p>
            <p style={{ color: '#888' }}>Nenhuma empresa parceira cadastrada.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {empresas.map((e) => (
              <div key={e.id} style={styles.card}>
                <div style={styles.logoBox}>
                  <span style={styles.iniciais}>{getIniciais(e.nome)}</span>
                </div>
                <div style={styles.badge}>🏢 Empresa Parceira</div>
                <h3 style={styles.nome}>{e.nome}</h3>
                <p style={styles.email}>{e.email}</p>
                {e.matricula && (
                  <p style={styles.info}>CNPJ: {e.matricula}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  main: { flex: 1, padding: 40, background: '#F8F7F5' },
  titulo: { fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: 0 },
  sub: { color: '#666', marginTop: 8, marginBottom: 32 },
  empty: { textAlign: 'center', padding: '60px 0' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid #eee',
    transition: 'box-shadow 0.2s',
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #003366, #0055AA)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    boxShadow: '0 4px 16px rgba(0,51,102,0.25)',
  },
  iniciais: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 2,
  },
  badge: {
    background: 'linear-gradient(135deg, #FF6B35, #FF9A5C)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 20,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  nome: { fontSize: 17, fontWeight: 700, color: '#1A1A1A', margin: '0 0 6px' },
  email: { fontSize: 13, color: '#666', margin: '0 0 6px' },
  info: { fontSize: 12, color: '#999', margin: 0 },
};