import { memo, useCallback, useRef, useState } from 'react'

const VGY_KEY = import.meta.env.VITE_VGY_USERKEY || ''
const API = '/api'

interface Props {
  username: string
  avatarUrl: string | null | undefined
  token: string | null
  onLogout: () => void
  onAvatarUpdate: (url: string) => void
}

const ProfileContent = memo(function ProfileContent({ username, avatarUrl, token, onLogout, onAvatarUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleAvatarChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return
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
          onClick={() => alert('Account Settings - coming soon!')}>Account Settings</button>
        <button className="win-button" style={{ width: '100%', justifyContent: 'flex-start', padding: '2px 8px', height: 'auto' }}
          onClick={() => alert('Preferences - coming soon!')}>Preferences</button>
        <button className="win-button" style={{ width: '100%', justifyContent: 'flex-start', padding: '2px 8px', height: 'auto' }}
          onClick={onLogout}>Logout</button>
      </div>
      {error && <div style={{ color: '#800000', fontSize: 10 }}>{error}</div>}
    </div>
  )
})

export default ProfileContent
