import { useReducer } from 'react'
import { appReducer, createInitialState } from './reducer'
import Desktop from './components/Desktop'

export default function App() {
  const [state, dispatch] = useReducer(appReducer, undefined, createInitialState)
  return <Desktop state={state} dispatch={dispatch} />
}
