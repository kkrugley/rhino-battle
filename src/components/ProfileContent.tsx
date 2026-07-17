import { memo, useCallback, useRef, useState } from 'react'

const VGY_KEY = import.meta.env.VITE_VGY_USERKEY || ''
const MAX_FILE_SIZE = 20 * 1024 * 1024
const API = '/api'

interface Props {
  username: string
  avatarUrl: string | null | undefined
  token: string | null
  onLogout: () => void
  onAvatarUpdate: (url: string) => void
}

function ChangePasswordModal({ token, onClose }: { token: string | null; onClose: () => void }) {
  const curRef = useRef<HTMLInputElement>(null)
  const newRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleSave = useCallback(async () => {
    const cur = curRef.current?.value
    const nw = newRef.current?.value
    const confirm = confirmRef.current?.value
    if (!cur || !nw || !confirm) { setError('All fields required'); return }
    if (nw !== confirm) { setError('New passwords do not match'); return }
    if (nw.length < 6) { setError('New password must be at least 6 characters'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(API + '/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ currentPassword: cur, newPassword: nw }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      setDone(true)
    } catch { setError('Network error') }
    finally { setSaving(false) }
  }, [token])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={done ? onClose : undefined}>
      <div className="win-window" style={{ width: 340 }} onClick={e => e.stopPropagation()}>
        <div className="win-title-sm" style={{ marginBottom: 4 }}>
          <span>Change Password</span>
          <button className="win-btn-sm" onClick={onClose} disabled={saving}><span style={{ fontWeight: 700, fontSize: 8 }}>x</span></button>
        </div>
        {done ? (
          <div style={{ padding: 16, textAlign: 'center', fontSize: 11 }}>
            <div style={{ color: '#008000', marginBottom: 12 }}>Password changed successfully</div>
            <button className="win-button win-button-default" onClick={onClose} style={{ padding: '4px 24px', height: 24 }}>OK</button>
          </div>
        ) : (
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ width: 100, flexShrink: 0 }}>Current:</label>
              <input ref={curRef} type="password" className="win-input" style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ width: 100, flexShrink: 0 }}>New:</label>
              <input ref={newRef} type="password" className="win-input" style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ width: 100, flexShrink: 0 }}>Confirm:</label>
              <input ref={confirmRef} type="password" className="win-input" style={{ flex: 1 }} />
            </div>
            {error && <div style={{ color: '#800000', fontSize: 10 }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4 }}>
              <button className="win-button win-button-default" onClick={handleSave} disabled={saving} style={{ padding: '4px 24px', height: 24 }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="win-button" onClick={onClose} style={{ padding: '4px 16px', height: 24 }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const ProfileContent = memo(function ProfileContent({ username, avatarUrl, token, onLogout, onAvatarUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return
    if (file.size > MAX_FILE_SIZE) { setError(`File too large (max 20 MB)`); setUploading(false); return }
    setUploading(true)
    setError('')

    const fd = new FormData()
    fd.append('file', file)
    if (VGY_KEY) fd.append('userkey', VGY_KEY)
    try {
      const res = await fetch('https://vgy.me/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) { setError('Upload failed'); return }

      const avatarUrl = data.image
      const saveRes = await fetch(API + '/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ avatarUrl }),
      })
      if (!saveRes.ok) { setError('Failed to save avatar'); return }

      onAvatarUpdate(avatarUrl)
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [token, onAvatarUpdate])

  return (
    <div style={{ background: '#c0c0c0', padding: 8, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid #000', boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080' }}>
      <div className="win-profile-card" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderWidth: 2, borderStyle: 'solid', borderColor: '#808080 #ffffff #ffffff #808080' }} />
        ) : (
          <div style={{ width: 32, height: 32, background: '#000080', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, borderWidth: 2, borderStyle: 'solid', borderColor: '#808080 #ffffff #ffffff #808080' }}>
            {username[0]}
          </div>
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: 11, color: '#000' }}>{username}</div>
          <div style={{ fontSize: 10, color: '#008000' }}>Status: Online</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button className="win-button" style={{ width: '100%', justifyContent: 'flex-start', padding: '2px 8px', height: 'auto' }}
          onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Change Avatar'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
        <button className="win-button" style={{ width: '100%', justifyContent: 'flex-start', padding: '2px 8px', height: 'auto' }}
          onClick={() => setShowChangePassword(true)}>Change Password</button>
        <button className="win-button" style={{ width: '100%', justifyContent: 'flex-start', padding: '2px 8px', height: 'auto' }}
          onClick={() => alert('Preferences - coming soon!')}>Preferences</button>
        <button className="win-button" style={{ width: '100%', justifyContent: 'flex-start', padding: '2px 8px', height: 'auto' }}
          onClick={onLogout}>Logout</button>
      </div>
      {error && <div style={{ color: '#800000', fontSize: 10 }}>{error}</div>}
      {showChangePassword && token && (
        <ChangePasswordModal token={token} onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  )
})

export default ProfileContent
