import { useEffect } from 'react'

export function useTimer(ticking: boolean, onTick: () => void) {
  useEffect(() => {
    if (!ticking) return
    const id = setInterval(onTick, 1000)
    return () => clearInterval(id)
  }, [ticking, onTick])
}
