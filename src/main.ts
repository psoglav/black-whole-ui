import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import '@/services/registration'

Vue.config.productionTip = false

if (process.env.NODE_ENV === 'development') {
  require('@vue/devtools').connect()
}

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
