import { State, StateFlow } from '../../types'

export function getNextState<T extends State<T>>(
  flow: StateFlow<T>,
  current: keyof T | null
): keyof T | null {
  if (current) {
    return flow[current]
  }
  return null
}

export function moveToNextState<T extends State<T>>(
  state: T,
  flow: Record<keyof T, keyof T | null>
): T {
  return {
    ...state,
    current: getNextState<T>(flow, state.current)
  }
}
