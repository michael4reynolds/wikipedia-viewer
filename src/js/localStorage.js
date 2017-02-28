export const loadState = () => {
  try {
    const serializedState = window.localStorage.getItem('state')
    return serializedState === null ? undefined : JSON.parse(serializedState)
  } catch (err) {
    return undefined
  }
}

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state)
    window.localStorage.setItem('state', serializedState)
  } catch (err) {
    console.log(err)
  }
}
