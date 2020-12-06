import Vue from 'vue'

import { faBullhorn } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faBullhorn)

Vue.component('fa', FontAwesomeIcon)