import { memo, useCallback, useRef, useState } from 'react'
import type { AuthResponse } from '../types'

const API = '/api'

interface Props {
  onLogin: (token: string, user: AuthResponse['user']) => void
}

const LoginModal = memo(function LoginModal({ onLogin }: Props) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const loginRef = useRef<HTMLInputElement>(null)
  const passRef = useRef<HTMLInputElement>(null)
  const rememberRef = useRef<HTMLInputElement>(null)

  const handleLogin = useCallback(async () => {
    const login = loginRef.current?.value.trim() || ''
    const password = passRef.current?.value || ''
    const remember = rememberRef.current?.checked || false

    if (!login || !password) { setError('Please enter login and password'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Invalid credentials')
      }

      const data: AuthResponse = await res.json()

      if (remember) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      onLogin(data.token, data.user)
    } catch (e: any) {
      setError(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }, [onLogin])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }, [handleLogin])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div className="win-window" style={{ width: 370, zIndex: 60, pointerEvents: 'auto' }}>
        <div className="win-title" style={{ height: 18, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>security</span>
            <span>Login.exe</span>
          </div>
          <button className="win-btn" style={{ width: 16, height: 14, paddingBottom: 2, fontSize: 10 }}>
            <span style={{ fontWeight: 700 }}>x</span>
          </button>
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#006565' }}>key</span>
            <div style={{ flex: 1 }}>
              <p style={{ marginBottom: 16, fontSize: 11, lineHeight: '18px' }}>
                Welcome to Rhino Battle.<br />Please enter your credentials to authenticate.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: 70, display: 'block', fontSize: 11 }}>Login:</label>
                  <input type="text" ref={loginRef} className="win-input" id="loginUser" defaultValue="learner1" style={{ flex: 1 }} onKeyDown={handleKey} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: 70, display: 'block', fontSize: 11 }}>Password:</label>
                  <input type="password" ref={passRef} className="win-input" id="loginPass" defaultValue="password123" style={{ flex: 1 }} onKeyDown={handleKey} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 4, marginLeft: 70 }}>
                  <input type="checkbox" ref={rememberRef} className="win-checkbox" id="remember" defaultChecked />
                  <label htmlFor="remember" style={{ fontSize: 11, marginLeft: 4 }}>Remember my password</label>
                </div>
              </div>
              {error && (
                <div style={{ color: '#800000', fontSize: 10, marginTop: 8 }}>{error}</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button className="win-button win-button-default" onClick={handleLogin} disabled={loading} style={{ padding: '4px 24px', fontWeight: 400, height: 24 }}>
              {loading ? '...' : 'OK'}
            </button>
            <button className="win-button" style={{ padding: '4px 16px', fontWeight: 400, height: 24 }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default LoginModal
