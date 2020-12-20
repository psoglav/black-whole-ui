import Vue from 'vue'

const requireComponent = require.context(
  '@/components/global',
  true,
  /.+\.vue/,
)

requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName)
  const componentName = componentConfig.default.options.name

  Vue.component(componentName, componentConfig.default || componentConfig)
})
