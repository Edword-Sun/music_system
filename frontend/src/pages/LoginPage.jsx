import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/client';

export default function LoginPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ account: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.account || !form.password) {
      setMsg('请输入账号和密码');
      return;
    }
    setLoading(true);
    setMsg('');
    try {
      const res = await login(form);
      if (res.Message === '登录成功') {
        nav('/'); // 跳到首页
      } else {
        setMsg(res.Message || '登录失败');
      }
    } catch (e) {
      setMsg('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: '80px auto', textAlign: 'center' }}>
      <h2>登录</h2>
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
      <button
        onClick={handleLogin}
        disabled={loading}
        style={{ width: '100%', padding: 8, marginTop: 16 }}
      >
        {loading ? '登录中...' : '登录'}
      </button>
      <p style={{ marginTop: 12 }}>
        还没有账号？<Link to="/register">立即注册</Link>
      </p>
    </div>
  );
}