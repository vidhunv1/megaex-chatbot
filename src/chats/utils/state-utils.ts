import { CacheHelper } from 'lib/CacheHelper'
import { State } from 'chats/types'

export async function moveToNextState<StateKey>(
  state: any | null,
  id: number,
  nextStateKey: StateKey | null,
  expiry?: number // seconds,
) {
  if (state == null) {
    await CacheHelper.clearState(id)
    return null
  }
  const nextState: State<StateKey> = {
    ...state,
    previousStateKey: state.currentStateKey,
    currentStateKey: nextStateKey
  }

  if (nextState.currentStateKey === null) {
    // State ended
    await CacheHelper.clearState(id)
    return null
  } else {
    await CacheHelper.setState(nextState, id, expiry)
    return nextState
  }
}
