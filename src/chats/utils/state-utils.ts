import { State, StateFlow } from 'chats/types'
import { CacheHelper } from 'lib/CacheHelper'

export function getNextStateKey<T extends State<T>>(
  flow: Omit<StateFlow<T>, 'currentMessageKey'>,
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
  flow: StateFlow<Omit<StateFlow<T>, 'currentMessageKey'>>,
  id: number,
  expiry?: number // seconds
) {
  const next = {
    ...state,
    currentMessageKey: getNextStateKey<T>(flow, state.currentMessageKey)
  }
  await CacheHelper.setState(next, id, expiry)

  return next
}
