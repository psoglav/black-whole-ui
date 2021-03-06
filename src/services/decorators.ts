import moment from 'moment'

import { createDecorator } from 'vue-class-component'
import { ComponentOptions, DefaultComputed } from 'vue/types/options'
import Methods from 'vue/types'

import * as env from '@/config/decorators'

export const Log = createDecorator(
  (options: ComponentOptions<Methods>, key) => {
    if (!env.METHODS_LOGGING) return

    const originalMethod = options.methods[key]

    options.methods[key] = function wrapperMethod(...args) {
      const date = moment().format('HH:mm:ss')
      console.log(`Invoked:\n\t${key}(`, ...args, `)\n\tin ${date}`)

      originalMethod.apply(this, args)
    }
  },
)

export const NoCache = createDecorator((options: DefaultComputed, key) => {
  if (!env.NO_CACHE_ENABLED) return

  options.computed[key].cache = false
})
