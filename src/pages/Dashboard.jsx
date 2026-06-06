import { useEffect, useState, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function BarChart({ dados, canvasRef, animRef }) {
  useEffect(() => {
    if (!canvasRef.current || dados.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const GRADIENTS = [
      ['#FF6B35', '#FF9A5C'],
      ['#00C9FF', '#0077B6'],
      ['#A855F7', '#7C3AED'],
      ['#10B981', '#059669'],
      ['#F59E0B', '#D97706'],
    ];

    const maxMedia = 10;
    const barW = 60;
    const gap = 50;
    const totalW = dados.length * (barW + gap) - gap;
    const startX = (W - totalW) / 2;
    const baseY = H - 70;
    const maxH = H - 150;

    let progress = 0;
    const duration = 80;

    const draw = (prog) => {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#0F1923');
      bg.addColorStop(1, '#1A2535');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 16);
      ctx.fill();

      for (let i = 0; i <= 5; i++) {
        const y = baseY - (maxH * i) / 5;
        const val = i * 2;
        ctx.beginPath();
        ctx.strokeStyle = i === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)';
        ctx.lineWidth = i === 0 ? 1.5 : 1;
        ctx.setLineDash(i === 0 ? [] : [4, 6]);
        ctx.moveTo(startX - 20, y);
        ctx.lineTo(startX + totalW + 20, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(val.toString(), startX - 28, y + 4);
      }

      dados.forEach((proj, i) => {
        const x = startX + i * (barW + gap);
        const targetH = (proj.media / maxMedia) * maxH;
        const barH = targetH * Math.min(prog / duration, 1);
        const [c1, c2] = GRADIENTS[i % GRADIENTS.length];

        const glowGrad = ctx.createLinearGradient(x, baseY - barH, x + barW, baseY);
        glowGrad.addColorStop(0, c1 + '22');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(x - 8, baseY - barH - 8, barW + 16, barH + 16);

        const grad = ctx.createLinearGradient(x, baseY - barH, x, baseY);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2 + 'AA');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, baseY - barH, barW, barH, [8, 8, 0, 0]);
        ctx.fill();

        if (barH > 5) {
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.beginPath();
          ctx.roundRect(x + 4, baseY - barH, barW - 8, 3, 2);
          ctx.fill();
        }

        if (prog > duration * 0.7) {
          const alpha = Math.min((prog - duration * 0.7) / (duration * 0.3), 1);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(proj.media.toString(), x + barW / 2, baseY - barH - 14);
          ctx.globalAlpha = 1;
        }

        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        const nome = proj.nome.length > 10 ? proj.nome.substring(0, 10) + '…' : proj.nome;
        ctx.fillText(nome, x + barW / 2, baseY + 22);
      });
    };

    const animate = () => {
      progress++;
      draw(progress);
      if (progress < duration) animRef.current = requestAnimationFrame(animate);
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, [dados]);

  return (
    <canvas
      ref={canvasRef}
      width={720}
      height={380}
      style={{ width: '100%', maxWidth: '720px', display: 'block', margin: '0 auto', borderRadius: 16 }}
    />
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ usuarios: 0, projetos: 0, turmas: 0 });
  const [topGlobal, setTopGlobal] = useState([]);
  const [topCurso, setTopCurso] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState('global');
  const [usuarioCurso, setUsuarioCurso] = useState('');
  const [usuarioTipo, setUsuarioTipo] = useState('');

  const canvasGlobalRef = useRef(null);
  const animGlobalRef = useRef(null);
  const canvasCursoRef = useRef(null);
  const animCursoRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const payload = parseJwt(token);
    const curso = payload?.curso_vinculo || payload?.curso || '';
    const tipo = payload?.tipo || '';
    setUsuarioCurso(curso);
    setUsuarioTipo(tipo);

    const carregar = async () => {
      try {
        const [u, p, t] = await Promise.all([
          api.get('/usuarios'),
          api.get('/projetos'),
          api.get('/turmas'),
        ]);

        setStats({
          usuarios: u.data.length,
          projetos: p.data.length,
          turmas: t.data.length,
        });

        const todosProjetos = p.data;

        const comAvaliacao = await Promise.all(
          todosProjetos.map(async (proj) => {
            try {
              const av = await api.get(`/avaliacoes/${proj.id}`);
              const avaliacoesComNota = av.data.filter((a) =>
                a.nota !== null &&
                ['professor', 'coordenador', 'empresa_parceira'].includes(a.tipo_avaliador)
              );
              const media = avaliacoesComNota.length
                ? avaliacoesComNota.reduce((s, a) => s + a.nota, 0) / avaliacoesComNota.length
                : 0;
              return {
                nome: proj.titulo.length > 18 ? proj.titulo.substring(0, 18) + '...' : proj.titulo,
                nomeCompleto: proj.titulo,
                media: parseFloat(media.toFixed(1)),
                avaliacoes: avaliacoesComNota.length,
                curso: proj.turmas?.curso || '—',
              };
            } catch {
              return null;
            }
          })
        );

        const validos = comAvaliacao.filter((p) => p && p.avaliacoes > 0);

        // Melhor projeto de cada curso
        const porCurso = {};
        validos.forEach((proj) => {
          if (!porCurso[proj.curso] || proj.media > porCurso[proj.curso].media) {
            porCurso[proj.curso] = proj;
          }
        });
        setTopGlobal(Object.values(porCurso).sort((a, b) => b.media - a.media));

        // Top 5 do curso do usuário
        if (curso) {
          const cursoData = validos
            .filter((proj) => proj.curso === curso)
            .sort((a, b) => b.media - a.media)
            .slice(0, 5);
          setTopCurso(cursoData);
        }
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      }
    };

    carregar();
  }, []);

  const mostrarAbaCurso = ['aluno', 'professor', 'coordenador'].includes(usuarioTipo);

  const cards = [
    { label: 'Usuários', valor: stats.usuarios, cor: '#003366', emoji: '👥' },
    { label: 'Projetos', valor: stats.projetos, cor: '#FF6B35', emoji: '📁' },
    { label: 'Turmas', valor: stats.turmas, cor: '#1A7A4A', emoji: '🎓' },
  ];

  const GRADIENTS_CSS = [
    'linear-gradient(135deg, #FF6B35, #FF9A5C)',
    'linear-gradient(135deg, #00C9FF, #0077B6)',
    'linear-gradient(135deg, #A855F7, #7C3AED)',
    'linear-gradient(135deg, #10B981, #059669)',
    'linear-gradient(135deg, #F59E0B, #D97706)',
  ];

  const dadosAtivos = abaAtiva === 'global' ? topGlobal : topCurso;
  const canvasAtivo = abaAtiva === 'global' ? canvasGlobalRef : canvasCursoRef;
  const animAtivo = abaAtiva === 'global' ? animGlobalRef : animCursoRef;

  return (
    <div style={styles.layout}>
      <Sidebar />
      <main style={styles.main}>
        <h1 style={styles.titulo}>Dashboard</h1>
        <p style={styles.sub}>Bem-vindo ao Sistema de Projetos Integrados do Senac</p>

        <div style={styles.grid}>
          {cards.map((c) => (
            <div key={c.label} style={{ ...styles.card, borderTop: `4px solid ${c.cor}` }}>
              <span style={styles.emoji}>{c.emoji}</span>
              <p style={styles.valor}>{c.valor}</p>
              <p style={styles.cardLabel}>{c.label}</p>
            </div>
          ))}
        </div>

        <div style={styles.chartCard}>
          <div style={styles.abas}>
            <button
              style={{ ...styles.aba, ...(abaAtiva === 'global' ? styles.abaAtiva : {}) }}
              onClick={() => setAbaAtiva('global')}
            >
              🏫 Ranking da Instituição
            </button>
            {mostrarAbaCurso && (
              <button
                style={{ ...styles.aba, ...(abaAtiva === 'curso' ? styles.abaAtiva : {}) }}
                onClick={() => setAbaAtiva('curso')}
              >
                🎓 Top do Meu Curso
              </button>
            )}
          </div>

          <div style={styles.chartHeader}>
            <div>
              {abaAtiva === 'global' ? (
                <>
                  <h2 style={styles.chartTitulo}>🏆 Melhor Projeto por Curso</h2>
                  <p style={styles.chartSub}>O projeto mais bem avaliado de cada curso da instituição</p>
                </>
              ) : (
                <>
                  <h2 style={styles.chartTitulo}>🎯 Top 5 do Curso: {usuarioCurso}</h2>
                  <p style={styles.chartSub}>Os 5 projetos mais bem avaliados do seu curso</p>
                </>
              )}
            </div>
          </div>

          {dadosAtivos.length === 0 ? (
            <div style={styles.emptyChart}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>📊</p>
              <p style={{ color: '#888' }}>Nenhuma avaliação registrada ainda.</p>
            </div>
          ) : (
            <>
              <BarChart dados={dadosAtivos} canvasRef={canvasAtivo} animRef={animAtivo} />
              <div style={styles.legenda}>
                {dadosAtivos.map((p, i) => (
                  <div key={i} style={styles.legendaItem}>
                    <div style={{ ...styles.legendaCor, background: GRADIENTS_CSS[i] }} />
                    <span style={styles.legendaTexto}>{p.nomeCompleto}</span>
                    {abaAtiva === 'global' && (
                      <span style={styles.legendaCurso}>{p.curso}</span>
                    )}
                    <span style={styles.legendaMedia}>
                      {p.media} ⭐ ({p.avaliacoes} avaliações)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' },
  main: { flex: 1, padding: 40, background: '#F8F7F5' },
  titulo: { fontSize: 28, fontWeight: 700, color: '#1A1A1A', margin: 0 },
  sub: { color: '#666', marginTop: 8, marginBottom: 32 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 32 },
  card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  emoji: { fontSize: 32 },
  valor: { fontSize: 40, fontWeight: 700, margin: '8px 0 4px', color: '#1A1A1A' },
  cardLabel: { color: '#666', fontSize: 14, margin: 0 },
  chartCard: { background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  abas: { display: 'flex', gap: 12, marginBottom: 24 },
  aba: {
    padding: '10px 20px', borderRadius: 10, border: '2px solid #e5e7eb',
    background: 'transparent', cursor: 'pointer', fontSize: 14, fontWeight: 600,
    color: '#666', transition: 'all 0.2s',
  },
  abaAtiva: {
    background: '#FF6B35', borderColor: '#FF6B35', color: '#fff',
  },
  chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  chartTitulo: { fontSize: 20, fontWeight: 700, color: '#1A1A1A', margin: '0 0 4px' },
  chartSub: { color: '#888', fontSize: 13, margin: 0 },
  emptyChart: { textAlign: 'center', padding: '60px 0' },
  legenda: { marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 },
  legendaItem: { display: 'flex', alignItems: 'center', gap: 12 },
  legendaCor: { width: 14, height: 14, borderRadius: 4, flexShrink: 0 },
  legendaTexto: { fontSize: 13.5, color: '#333', flex: 1 },
  legendaCurso: { fontSize: 12, color: '#888', background: '#f3f4f6', padding: '2px 8px', borderRadius: 6 },
  legendaMedia: { fontSize: 13, fontWeight: 700, color: '#FF6B35' },
};