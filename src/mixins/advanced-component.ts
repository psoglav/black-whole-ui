import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Advanced extends Vue {
  get workspaceConfig() {
    return this.$store.getters['workspaceConfig']
  }

  mouse = {
    x: 0,
    y: 0,
    lButtonPressed: false,
    rButtonPressed: false,
    mButtonPressed: false,
  }

  $(query) {
    const quantity = query.split(/[.#]/)[0]

    if (!quantity || quantity == 'one') {
      return this.$el.querySelector(query.replace(quantity, ''))
    } else if (quantity == 'all') {
      return this.$el.querySelectorAll(query.replace(quantity, ''))
    }
  }
  $style(query, style) {
    if (typeof style != 'object') {
      this.$el.querySelectorAll(query)?.forEach(el => {
        el.style = {}
      })
    } else {
      Object.entries(style).forEach(prop => {
        this.$el.querySelectorAll(query)?.forEach(el => {
          el.style[prop[0]] = prop[1]
        })
      })
    }
  }
  handleMouseDown(e) {
    this.mouse.lButtonPressed = e.button == 0
    this.mouse.rButtonPressed = e.button == 2
  }
  handleMouseMove(e) {
    this.mouse.x = e.x
    this.mouse.y = e.y
  }
  registerMixinMouseEvents() {
    document.addEventListener('mousedown', this.handleMouseDown)
    document.addEventListener('mousemove', this.handleMouseMove)
  }
  removeMixinMouseEvents() {
    document.removeEventListener('mousedown', this.handleMouseDown)
    document.removeEventListener('mousemove', this.handleMouseMove)
  }
}
