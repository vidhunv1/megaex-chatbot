import { State, StateFlow } from 'chats/types'
import { CacheHelper } from 'lib/CacheHelper'

export function getNextStateKey<T extends State<T>>(
  flow: Omit<StateFlow<T>, 'currentMessageKey' | 'key'>,
  current: keyof T | null
): keyof T | null {
  if (current) {
    // @ts-ignore
    return flow[current]
  }
  return null
}

export async function moveToNextState<T extends State<T>>(
  state: T,
  flow: StateFlow<Omit<StateFlow<T>, 'currentMessageKey' | 'key'>>,
  id: number,
  expiry?: number, // seconds,
  nextStateOverride?: keyof T
) {
  const next = {
    ...state,
    currentMessageKey: nextStateOverride
      ? nextStateOverride
      : getNextStateKey<T>(flow, state.currentMessageKey)
  }

  if (next.currentMessageKey === null) {
    // State ended
    await CacheHelper.clearState(id)
    return null
  } else {
    await CacheHelper.setState(next, id, expiry)
    return next
  }
}
