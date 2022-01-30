export const state = () => ({
  errors: [],
})

export const getters = {
  errors: (state) => state.errors,
}

export const actions = {
  addNewError({ commit }, message) {
    commit('ADD_NEW_ERROR', message)

    setTimeout(() => {
      commit('REMOVE_ERROR')
    }, 5000)
  },
  removeError({ commit }, errorId) {
    commit('REMOVE_ERROR', errorId)
  },
}

export const mutations = {
  ADD_NEW_ERROR(state, message) {
    state.errors.push({ message, id: generateUniqueId() })
  },
  REMOVE_ERROR(state, errorId) {
    if (errorId) {
      const index = state.errors.findIndex(({ id }) => id === errorId)
      if (~index) state.errors.splice(index, 1)
    } else state.errors.shift()
  },
}

function generateUniqueId() {
  const randomNumber = Math.floor(Math.random() * 100000)
  return Math.floor(randomNumber * Date.now())
}
