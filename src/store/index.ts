import Vue from 'vue'
import Vuex from 'vuex'

import workspace from './modules/workspace'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    workspace,
  },
})
