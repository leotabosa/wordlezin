export const state = () => ({
  error: {},
})

export const getters = {
  error: (state) => state.error,
}

export const actions = {
  addNewError({ commit }, message) {
    commit('REMOVE_ERROR')
    commit('ADD_NEW_ERROR', message)

    setTimeout(() => {
      commit('REMOVE_ERROR')
    }, 5000)
  },
  removeError({ commit }) {
    commit('REMOVE_ERROR')
  },
}

export const mutations = {
  ADD_NEW_ERROR(state, message) {
    state.error = { message }
  },
  REMOVE_ERROR(state) {
    state.error = {}
  },
}
