import { memo } from 'react'

interface Props {
  username: string
  onLogout: () => void
}

const ProfileContent = memo(function ProfileContent({ username, onLogout }: Props) {
  return (
    <div style={{ background: '#c0c0c0', padding: 8, display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid #000', boxShadow: 'inset 1px 1px 0 #ffffff, inset -1px -1px 0 #808080' }}>
      <div className="win-profile-card">
        <div style={{ fontWeight: 700, fontSize: 11, color: '#000' }}>{username}</div>
        <div style={{ fontSize: 10, color: '#008000' }}>Status: Online</div>
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
