import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Workspace from '../views/Workspace.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Workspace',
    component: Workspace
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

export default router
