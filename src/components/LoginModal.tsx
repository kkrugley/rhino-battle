import { memo, useCallback } from 'react'

interface Props {
  onLogin: () => void
}

const LoginModal = memo(function LoginModal({ onLogin }: Props) {
  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onLogin()
  }, [onLogin])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div className="win-window" style={{ width: 350, zIndex: 60, pointerEvents: 'auto' }}>
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
                  <label style={{ width: 70, display: 'block', fontSize: 11 }}>User name:</label>
                  <input type="text" className="win-input" id="loginUser" defaultValue="Admin" style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <label style={{ width: 70, display: 'block', fontSize: 11 }}>Password:</label>
                  <input type="password" className="win-input" id="loginPass" defaultValue="********" style={{ flex: 1 }} onKeyDown={handleKey} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 4, marginLeft: 70 }}>
                  <input type="checkbox" className="win-checkbox" id="remember" defaultChecked />
                  <label htmlFor="remember" style={{ fontSize: 11, marginLeft: 4 }}>Remember my password</label>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button className="win-button win-button-default" onClick={onLogin} style={{ padding: '4px 24px', fontWeight: 400, height: 24 }}>OK</button>
            <button className="win-button" style={{ padding: '4px 16px', fontWeight: 400, height: 24 }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default LoginModal
