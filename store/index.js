export const state = () => ({
  toast: {},
})

export const getters = {
  toast: (state) => state.toast,
}

export const actions = {
  addNewToast({ commit }, toast) {
    commit('REMOVE_TOAST')
    commit('ADD_NEW_TOAST', toast)

    setTimeout(() => {
      commit('REMOVE_TOAST')
    }, 50000000)
  },
  removeToast({ commit }) {
    commit('REMOVE_TOAST')
  },
}

export const mutations = {
  ADD_NEW_TOAST(state, toast) {
    state.toast = toast
  },
  REMOVE_TOAST(state) {
    state.toast = {}
  },
}
