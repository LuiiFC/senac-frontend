import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch {
      setErro('Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Overlay escuro */}
      <div style={styles.overlay} />

      {/* Conteúdo */}
      <div style={styles.content}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <div style={styles.logoBox}>
            <span style={styles.logoS}>S</span>
            <span style={styles.logoEnac}>enac</span>
          </div>
        </div>

        <h1 style={styles.titulo}>Área do Aluno</h1>
        <p style={styles.bemVindo}>Seja bem vindo.</p>
        <p style={styles.instrucao}>Faça o login para ter acesso à sua conta.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputBox}>
            <label style={styles.inputLabel}>Informe seu e-mail *</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            {email && (
              <button type="button" style={styles.clearBtn} onClick={() => setEmail('')}>✕</button>
            )}
          </div>

          <div style={styles.inputBox}>
            <label style={styles.inputLabel}>Senha *</label>
            <input
              style={styles.input}
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
            />
            {senha && (
              <button type="button" style={styles.clearBtn} onClick={() => setSenha('')}>✕</button>
            )}
          </div>

          {erro && <p style={styles.erro}>{erro}</p>}

          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>

        <div style={styles.links}>
          <Link to="/esqueceu-senha" style={styles.linkEsqueceu}>
            Esqueceu o e-mail ou a senha?
          </Link>
          <p style={styles.cadastroText}>
            Aluno? <Link to="/registro" style={styles.linkCadastro}>Cadastre-se aqui</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'sans-serif',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    maxWidth: 480,
    padding: '0 32px',
  },
  logoArea: {
    marginBottom: 24,
  },
  logoBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
  },
  logoS: {
    background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: 48,
    fontWeight: 900,
    fontFamily: 'sans-serif',
    lineHeight: 1,
  },
  logoEnac: {
    color: '#4A9EDB',
    fontSize: 40,
    fontWeight: 700,
    fontFamily: 'sans-serif',
    lineHeight: 1,
  },
  titulo: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 700,
    margin: '0 0 8px',
    fontFamily: 'sans-serif',
  },
  bemVindo: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    margin: '0 0 4px',
    fontFamily: 'sans-serif',
  },
  instrucao: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    margin: '0 0 32px',
    fontFamily: 'sans-serif',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  inputBox: {
    position: 'relative',
    background: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: '12px 16px',
  },
  inputLabel: {
    display: 'block',
    color: '#4A9EDB',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 4,
    fontFamily: 'sans-serif',
  },
  input: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: 15,
    background: 'transparent',
    color: '#1A1A1A',
    fontFamily: 'sans-serif',
    boxSizing: 'border-box',
    paddingRight: 24,
  },
  clearBtn: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: 14,
    padding: 0,
  },
  erro: {
    color: '#FF6B6B',
    fontSize: 13,
    margin: 0,
    fontFamily: 'sans-serif',
  },
  btn: {
    background: '#4A9EDB',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    padding: '16px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 1,
    fontFamily: 'sans-serif',
    marginTop: 8,
    transition: 'background 0.2s',
  },
  links: {
    marginTop: 24,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  linkEsqueceu: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textDecoration: 'underline',
    fontFamily: 'sans-serif',
  },
  cadastroText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    margin: 0,
    fontFamily: 'sans-serif',
  },
  linkCadastro: {
    color: '#F7931E',
    fontWeight: 600,
    textDecoration: 'none',
  },
};
