<template>
  <div
    class="fluid-button"
    :class="{ disabled: disabled || deactivated }"
    @click="action"
  >
    <div class="fluid-button_slider" :class="{ selective }">
      <h3 class="fluid-button_slider_label">
        <fa icon="bullhorn" v-if="messageIsVisible" /> {{ text || label }}
      </h3>
      <div class="fluid-button_slider_order">
        <div
          class="fluid-button_slider_order-markers"
          :class="{
            'changing-order': changingOrder,
            invisible: !modifiableOrder,
          }"
        >
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div class="fluid-button_slider_back" :class="{ dissolution }"></div>
    </div>
  </div>
</template>

<script>
import * as math from 'mathjs'
import { Component } from 'vue-property-decorator'
import Advanced from '@/mixins/advanced-component'

import { mapGetters } from 'vuex'

@Component({
  name: 'fluid-button',
  props: {
    label: {
      type: String,
      default: 'Untitled',
    },
    dissolution: {
      type: Boolean,
      default: false,
    },
    triggers: {
      type: Object,
      validator(value) {
        const availableTriggers = ['right', 'left']
        const availableTriggerKeys = ['name', 'message', 'action', 'width']

        if (typeof value != 'object' || !value)
          throw new Error('Triggers must be an object')
        else if (
          Object.keys(value).length &&
          Object.keys(value).filter(key => !availableTriggers.includes(key))
            .length
        )
          throw new Error('Provided triggers keys are invalid')
        else if (
          Object.keys(value.right).length &&
          Object.keys(value.right).filter(
            key => !availableTriggerKeys.includes(key),
          ).length
        )
          throw new Error('Provided right trigger keys are invalid')
        else if (
          Object.keys(value.left).length &&
          Object.keys(value.left).filter(
            key => !availableTriggerKeys.includes(key),
          ).length
        )
          throw new Error('Provided left trigger keys are invalid')
        else if (
          typeof value.left.action != 'function' ||
          typeof value.right.action != 'function'
        )
          throw new Error('Trigger action must be a function')
        else return true
      },
    },
    width: {
      type: String,
      default: '50%',
    },
    message: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters({
      deactivated: 'input-deactivated'
    })
  }
})
export default class FluidButton extends Advanced {
  get selective() {
    if (!this.triggers) return false

    const { right, left } = this.triggers
    let hasName, hasAction

    if (right) {
      hasName = right.name && typeof right.name == 'string'
      hasAction = typeof right.action == 'function'

      if (hasName && hasAction) return true
      else return false
    }

    if (left) {
      hasName = left.name && typeof left.name == 'string'
      hasAction = typeof left.action == 'function'

      if (hasName && hasAction) return true
      else return false
    }

    return false
  }

  get currentSide() {
    if (this.currentAction == -1) return 'left'
    else if (this.currentAction == 1) return 'right'
    else return ''
  }

  get currentWidth() {
    return this.currentSide ? this.triggers[this.currentSide].width : this.width
  }

  get messageIsVisible() {
    return [
      this.message,
      this.triggers?.left?.message,
      this.triggers?.right?.message,
    ].includes(this.text)
  }

  text = ''
  x = 0
  fadeDuration = 100
  currentAction = 0
  pressed = false
  makingChoice = false
  changingOrder = false
  modifiableOrder = false

  mounted() {
    this.modifiableOrder = this.$parent.$options.propsData?.modifiableOrder
    this.text = this.label

    if (this.selective) {
      this.registerSelectiveEvents()
      this.inspectTriggers()
    }

    if (this.modifiableOrder) {
      this.registerMarkersEvents()
    }
  }

  beforeDestroy() {
    this.removeSelectiveEvents()
    this.removeMarkersEvents()
  }

  action(side) {
    if (this.disabled || this.deactivated) return

    if (typeof side == 'string') {
      const message = this.triggers[side].message

      if (message) this.throwMessage(message)

      this.triggers[side].action()
    } else {
      if (this.message) this.throwMessage(this.message)
      if (!this.changingOrder) this.$emit('click')

      this.changingOrder = false
    }
  }

  selectTrigger(side) {
    if (this.text == this.triggers[side].name) return

    this.throughFade().then(() => {
      if (this.pressed) {
        this.currentAction = side == 'right' ? 1 : -1
        this.text = this.triggers[side].name
        this.updateSliderWidth()
      } else {
        this.text = this.label
      }
    })
  }

  deselect() {
    if (this.text == this.label) return

    if (!this.triggers[this.currentSide]?.message) {
      this.throughFade().then(() => {
        this.text = this.label
      })
    }

    this.currentAction = 0
  }

  throughFade() {
    return new Promise(resolve => {
      const labelNode = this.$('.fluid-button_slider_label')

      labelNode.style.opacity = 0

      setTimeout(() => {
        labelNode.style.opacity = 1
        resolve()
      }, this.fadeDuration * 2)
    })
  }

  throwMessage(text) {
    this.throughFade().then(() => {
      this.text = text

      setTimeout(() => {
        if (this.text == text) {
          this.throughFade().then(() => {
            this.text = this.label
          })
        }
      }, 1000)
    })
  }

  updateSliderWidth() {
    this.$style('.selective', {
      width: `calc(${this.currentWidth} + 20px)`,
    })
  }

  controlSlider(e) {
    const slider = this.$('.fluid-button_slider')
    const rect = slider.getBoundingClientRect()
    const hw = slider.clientWidth / 2
    const hh = slider.clientHeight / 2
    const d = math.distance([e.x, e.y], [rect.x + hw, rect.y + hh]) / (hw * 1.2)
    const x = (e.x - rect.x - slider.clientWidth / 2) / (d + 5)
    const right = ((this.$el.clientWidth - slider.clientWidth) / 2) * -1
    const left = (this.$el.clientWidth - slider.clientWidth) / 2

    if (x < left && x > right) {
      this.x = x
    } else if (x < right) {
      this.x = right
    } else if (x > left) {
      this.x = left
    }

    slider.style.left = this.x + 'px'

    if (this.makingChoice) {
      const bx = this.$el.getBoundingClientRect().x
      const bw = this.$el.clientWidth
      const edge = bw / 7

      if (e.x < bx + edge) {
        this.selectTrigger('left')
      } else if (e.x > bx + bw - edge) {
        this.selectTrigger('right')
      }
    }
  }

  handleMouseMove(e) {
    if (!this.pressed) return

    this.controlSlider(e)
  }

  handleMousePress() {
    if (!this.changingOrder && this.selective) {
      this.pressed = true

      setTimeout(() => {
        if (!this.changingOrder && this.pressed) {
          this.makingChoice = true
          this.updateSliderWidth()
        }
      }, 300)

      if (this.text != this.label) {
        this.throughFade().then(() => {
          this.text = this.label
        })
      }
    }
  }

  handleMouseRelease() {
    this.$style('.fluid-button_slider', { left: '0px' })
    this.$style('.selective', {
      width: '100%',
    })

    if (this.pressed) {
      if (this.currentAction === 1) {
        this.action('right')
      } else if (this.currentAction === -1) {
        this.action('left')
      }

      this.deselect()
    }

    this.pressed = false
    this.makingChoice = false
    this.x = 0
  }

  handleMarkersPress(e) {
    if (e.target.classList.contains('fluid-button_slider_order-markers')) {
      this.changingOrder = true
    }
  }

  handleMarkersRelease() {
    this.changingOrder = false
  }

  registerSelectiveEvents() {
    document.addEventListener('mousemove', this.handleMouseMove)
    this.$el.addEventListener('mousedown', this.handleMousePress)
    document.addEventListener('mouseup', this.handleMouseRelease)
  }

  registerMarkersEvents() {
    this.$el.addEventListener('mousedown', this.handleMarkersPress)
    document.addEventListener('mouseup', this.handleMarkersRelease)
  }

  removeSelectiveEvents() {
    document.removeEventListener('mousemove', this.handleMouseMove)
    this.$el.removeEventListener('mousedown', this.handleMousePress)
    document.removeEventListener('mouseup', this.handleMouseRelease)
  }

  removeMarkersEvents() {
    this.$el.removeEventListener('mousedown', this.handleMarkersPress)
    document.removeEventListener('mouseup', this.handleMarkersRelease)
  }

  inspectTriggers() {
    if (!this.triggers) this.triggers = {}

    if (!this.triggers.right) {
      this.triggers.right = {
        name: this.label,
        action: this.action,
      }
    } else if (!this.triggers.left) {
      this.triggers.left = {
        name: this.label,
        action: this.action,
      }
    }
  }
}
</script>

<style lang="scss" scope>
@import '@/scss/_variables.scss';

.fluid-button {
  position: relative;
  height: 30px;
  width: 100%;
  box-shadow: inset 0 0 0 #ffffff00;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  cursor: pointer;

  &.disabled {
    cursor: inherit;
    opacity: 0.65;
  }

  &:hover:not(.disabled) &_slider {
    color: white;
  }

  &:active:not(.disabled) {
    transition: box-shadow 0.5s;
    box-shadow: inset 0 0 20px #ffffff33;
    cursor: pointer;
  }

  &:hover:not(.disabled) &_slider_back {
    background-color: white;
    opacity: 0.4;
    transform: scale(1);
  }

  &:active:not(.disabled) &_slider_back {
    background-color: #ffffff00;
    box-shadow: inset 0 0 10px white;
    opacity: 0.5;
    transform: scale(1);
  }

  &_slider_back.dissolution {
    box-shadow: inset 0 0 0px white;
  }

  &:hover:not(.disabled) &_slider_back.dissolution {
    box-shadow: inset 0 0 40px white;
  }

  &:active:not(.disabled) &_slider_back.dissolution {
    box-shadow: inset 0 0 40px white;
  }

  &_slider {
    position: relative;
    height: 100%;
    width: 100%;
    display: grid;
    align-items: center;
    transition: width 0.23s cubic-bezier(0.175, 0.885, 0.32, 1.275);

    &_label {
      z-index: 2;
      padding: 5px 10px;
      user-select: none;
      font-weight: 500;
      letter-spacing: 0.05rem;
      font-size: 0.9rem;
      transition: opacity 0.1s, color 0.4s;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      width: calc(100% - 15px);
    }

    &_order {
      position: absolute;
      width: 20px;
      display: flex;
      flex-direction: column;
      left: 2.5px;
      height: calc(100%);
      &-markers {
        z-index: 5;
        cursor: pointer;
        height: 100%;
        width: 100%;
        transform: scale(0.8);
        position: relative;
        transition: opacity 0.3s;
        opacity: 0.15;
        &:hover {
          opacity: 1;
        }
        div {
          position: absolute;
          width: 5px;
          height: 5px;
          background-color: white;
          border-radius: 100%;
          transition: all 0.2s;

          &:nth-child(1) {
            top: 10%;
            left: 0%;
          }

          &:nth-child(2) {
            top: 10%;
            left: calc(80% - 5px);
          }

          &:nth-child(3) {
            top: calc(50% - 2.5px);
            left: 0%;
          }

          &:nth-child(4) {
            top: calc(50% - 2.5px);
            left: calc(80% - 5px);
          }

          &:nth-child(5) {
            top: calc(90% - 5px);
            left: 0%;
          }

          &:nth-child(6) {
            top: calc(90% - 5px);
            left: calc(80% - 5px);
          }
        }
        &.changing-order {
          opacity: 1;
          div {
            background-color: black;
          }
        }
      }
    }

    &_back {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transform: scale(0.9);
      transition: all 0.2s;
      border-radius: 5px;
    }
  }
}

.invisible {
  display: none;
}
</style>
