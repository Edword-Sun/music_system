import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/client';

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ account: '', password: '', email: '', auth: 3 });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!form.account || !form.password || !form.email) {
      setMsg('请完整填写信息');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const res = await register(form);
      const message = res?.message || res?.Message;
      if (message && message.includes('成功')) {
        nav('/login');
      } else {
        setMsg(message || '注册失败');
      }
    } catch (e) {
      setMsg('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: '80px auto', textAlign: 'center' }}>
      <h2>注册</h2>
      {msg && <p style={{ color: 'red' }}>{msg}</p>}
      <input
        name="account"
        placeholder="账号"
        value={form.account}
        onChange={handleChange}
        style={{ width: '100%', padding: 8, marginTop: 8 }}
      />
      <input
        name="password"
        type="password"
        placeholder="密码"
        value={form.password}
        onChange={handleChange}
        style={{ width: '100%', padding: 8, marginTop: 8 }}
      />
      <input
        name="email"
        type="email"
        placeholder="邮箱"
        value={form.email}
        onChange={handleChange}
        style={{ width: '100%', padding: 8, marginTop: 8 }}
      />
      <button
        onClick={handleRegister}
        disabled={loading}
        style={{ width: '100%', padding: 8, marginTop: 16 }}
      >
        {loading ? '注册中...' : '注册'}
      </button>
      <p style={{ marginTop: 12 }}>
        已有账号？<Link to="/login">立即登录</Link>
      </p>
    </div>
  );
}