import { memo } from 'react'

interface Props {
  name1: string
  count1: number
  name2: string
  count2: number
}

const ScoreContent = memo(function ScoreContent({ name1, count1, name2, count2 }: Props) {
  return (
    <div style={{
      background: '#000', color: '#22c55e',
      padding: 8, textAlign: 'center',
      fontFamily: "'Arimo', monospace",
      borderWidth: 2, borderStyle: 'solid',
      borderColor: '#808080 #ffffff #ffffff #808080',
    }}>
      <div style={{ fontSize: 11, letterSpacing: 1, marginBottom: 2 }}>{name1}</div>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4 }}>
        {count1} : {count2}
      </div>
      <div style={{ fontSize: 11, letterSpacing: 1, marginTop: 2 }}>{name2}</div>
    </div>
  )
})

export default ScoreContent
