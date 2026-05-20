export default function AvaliacaoCard({ avaliacao }) {
  const cor = avaliacao.nota >= 7 ? '#1A7A4A' : avaliacao.nota >= 5 ? '#B45309' : '#C8102E';
  const tipo = avaliacao.usuarios?.tipo;

  const getBadge = () => {
    if (tipo === 'empresa_parceira') return { label: '🏢 Empresa Parceira', bg: '#FEF3C7', color: '#B45309' };
    if (tipo === 'coordenador') return { label: '🎓 Coordenador', bg: '#EDE9FE', color: '#6B21A8' };
    if (tipo === 'professor') return { label: '👨‍🏫 Professor', bg: '#E8F5EE', color: '#1A7A4A' };
    if (tipo === 'admin') return { label: '⚙️ Admin', bg: '#E0E7FF', color: '#003366' };
    return { label: '👤 Aluno', bg: '#E3F0FF', color: '#1565C0' };
  };

  const badge = getBadge();

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.avatar}>{avaliacao.usuarios?.nome?.[0]}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={styles.nome}>{avaliacao.usuarios?.nome || 'Usuário'}</p>
            <span style={{ ...styles.badge, background: badge.bg, color: badge.color }}>
              {badge.label}
            </span>
          </div>
          <p style={styles.tipo}>{new Date(avaliacao.criado_em).toLocaleDateString('pt-BR')}</p>
        </div>
        {avaliacao.nota !== null && (
          <div style={{ ...styles.nota, background: cor + '15', color: cor }}>
            {avaliacao.nota.toFixed(1)}
          </div>
        )}
      </div>
      {avaliacao.comentario && <p style={styles.comentario}>{avaliacao.comentario}</p>}
    </div>
  );
}

const styles = {
  card: { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 38, height: 38, borderRadius: '50%', background: '#003366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  nome: { fontWeight: 600, fontSize: 14, color: '#1A1A1A', margin: 0 },
  badge: { padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  tipo: { color: '#999', fontSize: 12, margin: '2px 0 0' },
  nota: { marginLeft: 'auto', fontWeight: 700, fontSize: 20, padding: '6px 14px', borderRadius: 10, flexShrink: 0 },
  comentario: { color: '#444', fontSize: 14, lineHeight: 1.6, margin: 0, paddingTop: 10, borderTop: '1px solid #F0F0F0' },
};