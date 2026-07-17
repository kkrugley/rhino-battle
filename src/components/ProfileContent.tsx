import { memo } from 'react'

interface Props {
  username: string
  avatarUrl: string | null | undefined
  onLogout: () => void
}

const ProfileContent = memo(function ProfileContent({ username, avatarUrl, onLogout }: Props) {
  return (
    <div style={{ background: '#c0c0c0', padding: 8, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid #000', boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080' }}>
      <div className="win-profile-card" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ width: 32, height: 32, borderWidth: 2, borderStyle: 'solid', borderColor: '#808080 #ffffff #ffffff #808080' }} />
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
          onClick={() => alert('Account Settings - coming soon!')}>Account Settings</button>
        <button className="win-button" style={{ width: '100%', justifyContent: 'flex-start', padding: '2px 8px', height: 'auto' }}
          onClick={() => alert('Preferences - coming soon!')}>Preferences</button>
        <button className="win-button" style={{ width: '100%', justifyContent: 'flex-start', padding: '2px 8px', height: 'auto' }}
          onClick={onLogout}>Logout</button>
      </div>
    </div>
  )
})

export default ProfileContent
