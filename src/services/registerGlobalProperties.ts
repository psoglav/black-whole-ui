import Vue from 'vue'

const properties = {}

Object.entries(properties).forEach(prop => {
  Vue.prototype['$' + prop[0]] = prop[1]
})
