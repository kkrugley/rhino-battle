import { useReducer, useEffect } from 'react'
import { appReducer, createInitialState } from './reducer'
import Desktop from './components/Desktop'
import type { User } from './types'

function loadSession() {
  const token = localStorage.getItem('token')
  const raw = localStorage.getItem('user')
  if (token && raw) {
    try {
      const user: User = JSON.parse(raw)
      return { token, user }
    } catch { /* ignore */ }
  }
  return null
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState)

  useEffect(() => {
    const session = loadSession()
    if (session) {
      dispatch({ type: 'LOGIN', user: session.user, token: session.token })
    }
  }, [])

  return <Desktop state={state} dispatch={dispatch} />
}
