import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

import '@/services/registerGlobalComponents'
import '@/services/registerGlobalProperties'
import '@/services/registerFaIconComponent'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
