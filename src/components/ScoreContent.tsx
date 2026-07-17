import { memo } from 'react'

interface Props {
  user1: number
  user2: number
}

const ScoreContent = memo(function ScoreContent({ user1, user2 }: Props) {
  return (
    <div style={{
      background: '#000', color: '#22c55e',
      padding: 8, textAlign: 'center',
      fontFamily: "'Arimo', monospace",
      borderWidth: 2, borderStyle: 'solid',
      borderColor: '#808080 #ffffff #ffffff #808080',
    }}>
      <div style={{ fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>MODELS</div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4 }}>
        {user1} : {user2}
      </div>
    </div>
  )
})

export default ScoreContent
