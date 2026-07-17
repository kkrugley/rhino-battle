import { memo } from 'react'

interface Props {
  seconds: number
}

function fmt(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

const ScoreContent = memo(function ScoreContent({ seconds }: Props) {
  return (
    <div className="win-timer">{fmt(seconds)}</div>
  )
})

export default ScoreContent
