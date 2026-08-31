import { useState } from 'react'
import { login as apiLogin, signup as apiSignup } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

export default function AuthForm() {
  const [mode,    setMode]    = useState('login')
  const [form,    setForm]    = useState({ username: '', password: '', confirm: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const { loginCtx } = useAuth()

  const change = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  const switchMode = (m) => { setMode(m); setError(''); setForm({ username: '', password: '', confirm: '' }) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (mode === 'signup' && form.password !== form.confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    setLoading(true)
    try {
      let res
      if (mode === 'signup') {
        res = await apiSignup({ username: form.username, password: form.password })
      } else {
        res = await apiLogin({ username: form.username, password: form.password })
      }
      loginCtx(res.data.token, res.data.username)
    } catch (e) {
      setError(e.response?.data?.message ?? '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-logo">TodoList</h1>
        <p className="auth-sub">할일을 효율적으로 관리하세요</p>

        <div className="auth-tabs">
          <button className={`auth-tab${mode === 'login'  ? ' active' : ''}`} onClick={() => switchMode('login')}>로그인</button>
          <button className={`auth-tab${mode === 'signup' ? ' active' : ''}`} onClick={() => switchMode('signup')}>회원가입</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>아이디</label>
            <input
              value={form.username}
              onChange={change('username')}
              placeholder="3~20자 영문/숫자"
              required minLength={3} maxLength={20}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={change('password')}
              placeholder="6자 이상"
              required minLength={6}
            />
          </div>
          {mode === 'signup' && (
            <div className="form-group">
              <label>비밀번호 확인</label>
              <input
                type="password"
                value={form.confirm}
                onChange={change('confirm')}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>
          )}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn primary auth-submit" disabled={loading}>
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  )
}
