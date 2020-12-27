<template>
  <div
    class="card"
    @mouseover="mouseOverHandler"
    @mouseleave="mouseLeaveHandler"
  >
    <div class="card_back"></div>
    <div
      class="card_slot"
      :class="{ ['parent_' + id]: true, deactivated: elseCardIsMoving }"
    >
      <div
        class="card_slot-movable"
        :class="{ 'ready-to-leave': readyToLeave }"
        :id="id"
      >
        <div class="card_slot-movable_header" :style="movableHeaderStyle">
          <div class="card_slot-movable_header_title">{{ title }}</div>
          <div class="card_slot-movable_header_dots">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <div class="card_slot-movable_content">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator'
import { customAlphabet } from 'nanoid'

import Advanced from '@/mixins/advanced-component'
// import { Log } from '@/services/decorators'

/* eslint-disable */

@Component({
  name: 'card',
  props: {
    title: String,
  },
})
export default class CardBase extends Advanced {
  @Watch('moving')
  onMovingChanged(moving) {
    if (moving) {
      this.needInUpdate = true
      this.detachCard()
    } else {
      this.needInUpdate = false
      this.insertCard()
    }
  }

  @Watch('needInUpdate')
  updateWatcher(need) {
    if (need) this.update()
  }

  mouseOverHandler() {
    this.$root.$emit('over-card', this.id)
  }

  mouseLeaveHandler() {
    if (this.readyToLeave) {
      this.$root.$emit('card-unfocused', this.id)
      this.readyToLeave = false
    }
  }

  //#region DATA

  id = customAlphabet('abcdefghijklmnopqrstuvwxyz', 25)()

  mx = 0
  my = 0
  startx = 0
  starty = 0
  startYScroll = 0
  dx = 0
  dy = 0

  moving = false
  elseCardIsMoving = false
  readyToLeave = false
  scrolling = false
  movementDenied = false
  needInUpdate = false

  bindings = null
  replacementNode = null

  distanceToChangeSlot = 2.5

  //#endregion

  get cardConfig() {
    return this.$store.getters['workspaceConfig'].card
  }

  get movableHeaderStyle() {
    const cursorStyle = this.cardConfig.cursorGrabStyle

    return {
      cursor: cursorStyle == 1 ? 'pointer' : 'grab',
    }
  }

  created() {
    this.registerMixinMouseEvents()

    this.$root.$on('over-card', this.readyToReplace)
    this.$root.$on('card-unfocused', this.readyCardUnfocused)
    this.$root.$on('card-detached', this.elseCardDetached)
    this.$root.$on('card-inserted', this.elseCardInserted)
  }

  mounted() {
    this.setBindings()
    this.registerEvents()
  }

  update() {
    this.keepCardInView()

    if (this.needInUpdate) requestAnimationFrame(this.update)
  }

  beforeDestroy() {
    this.removeMixinMouseEvents()

    this.$root.$off('over-card', this.readyToReplace)
    this.$root.$off('card-unfocused', this.readyCardUnfocused)
    this.$root.$off('card-detached', this.elseCardDetached)
    this.$root.$off('card-inserted', this.elseCardInserted)
  }

  setBindings() {
    const movable = document.querySelector(`.card_slot-movable#${this.id}`)
    const header = movable.querySelector('.card_slot-movable_header')

    const set = {
      card: this.$el,
      slot: this.$('.card_slot'),
      movable,
      header,
      dots: header.querySelector('.card_slot-movable_header_dots'),
      app: document.querySelector('#app'),
      workspace: document.querySelector('.workspace'),
      movableRect: movable.getBoundingClientRect(),
      cardRect: this.$el.getBoundingClientRect(),
    }

    this.bindings = set
  }

  elseCardInserted(id) {
    this.elseCardIsMoving = false
    this.readyToLeave = false
    this.updateHeaderBehaviour()

    if (this.id == id) {
      this.bindings.dots.classList.remove('active')
    }
  }

  elseCardDetached(id) {
    this.elseCardIsMoving = true

    if (this.id == id) {
      this.bindings.dots.classList.add('active')
    }
  }

  removeMovableReplacements() {
    const existing = this.$el.querySelectorAll('.ready-to-join')
    const hiddenExisting = this.$el.querySelectorAll('.hidden')

    if (existing.length) {
      existing.forEach(el => {
        this.bindings.slot.removeChild(el)
      })
    }

    if (hiddenExisting.length) {
      hiddenExisting.forEach(el => {
        this.bindings.slot.removeChild(el)
      })
    }
  }

  readyToReplace(id) {
    if (this.moving && this.id != id) {
      this.removeMovableReplacements()

      let replacement = document.querySelector(
        '.card_slot-movable#' + id,
      ) as any

      this.replacementNode = replacement
      replacement = replacement.cloneNode(true)
      replacement.classList.remove('ready-to-leave')
      replacement.style = {}

      this.bindings.movable.id = replacement.id // swap ids
      replacement.id = this.id

      replacement.classList.add('ready-to-join')

      this.bindings.slot.appendChild(replacement)
    }

    this.readyToLeave = this.id == id && this.elseCardIsMoving && !this.moving
  }

  readyCardUnfocused() {
    this.removeMovableReplacements()
    this.replacementNode = null
  }

  insertCard() {
    const bs = this.bindings

    bs.movable.style = {}

    if (this.replacementNode) {
      // we have chosen replacement
      const replacementParent = this.replacementNode.parentNode
      const replacementMovableClone = this.$el.querySelector(
        '.ready-to-join',
      ) as any

      replacementParent.removeChild(this.replacementNode) // remove the replacement from parent
      replacementParent.appendChild(bs.movable) // and append our movable to it

      this.replacementNode = null

      replacementMovableClone.classList.remove('ready-to-join')
      replacementMovableClone.style = {}
    } else {
      // otherwise bring the movable one back
      bs.movable.id = this.id
      bs.slot.appendChild(bs.movable)
    }

    this.updateCursor()
    this.$root.$emit('card-inserted', this.id)
    this.$store.commit('ACTIVATE_INPUT')
  }

  detachCard() {
    const bs = this.bindings

    this.fitParentPosition()
    this.updateCursor()

    // detaching movable element from this card slot
    // and inserting it to the app
    bs.app.insertBefore(bs.slot.removeChild(bs.movable), bs.workspace)

    this.setBindings()

    this.dx = this.mx - bs.cardRect.x
    this.dy = this.my - bs.cardRect.y
    this.startYScroll = this.$parent.$el.scrollTop

    bs.movable.style.width = bs.slot.clientWidth + 'px'
    bs.movable.style['box-shadow'] = '0 0 35px #00000077'
    bs.movable.style['z-index'] = 10
    bs.movable.style['pointer-events'] = 'none'
    bs.movable.style.transform = 'scale(1.03)'
    bs.movable.style.left = this.startx + 'px'
    bs.movable.style.top = this.starty + 'px'

    this.$root.$emit('card-detached', this.id)
    this.$store.commit('DEACTIVATE_INPUT')
  }

  updateCursor() {
    let cursorStyle

    switch (this.cardConfig.cursorGrabStyle) {
      case 1:
        cursorStyle = this.moving ? 'move' : ''
        break
      case 2:
        cursorStyle = this.moving ? 'grabbing' : ''
        break
    }

    this.bindings.app.style.cursor = cursorStyle
  }

  getIndex(el) {
    if (!el) return -1
    let i = 0
    do {
      i++
    } while ((el = el.previousElementSibling))
    return i
  }

  move(e) {
    const x = e.x - this.dx
    const y = e.y - this.dy - this.startYScroll

    this.bindings.movable.style.top = y + 'px'
    this.bindings.movable.style.left = x + 'px'
  }

  fitParentPosition() {
    this.setBindings()

    this.startx = this.bindings.cardRect.x
    this.starty = this.bindings.cardRect.y
  }

  keepCardInView() {
    const my = this.mouse.y
    const multiplier = 2.5

    let Yacceleration = 200 / my

    if (my < 50) {
      Yacceleration = 200 / 50
    } else if (my > window.innerHeight - 150) {
      Yacceleration = 200 / -50
    } else if (my > window.innerHeight - 200) {
      Yacceleration = 200 / -(window.innerHeight - my)
    }

    if (my < 200 || my > window.innerHeight - 200) {
      this.scrolling = true
      this.$parent.$el.scrollTop -= Yacceleration * multiplier
    } else {
      this.scrolling = false
    }
  }

  headerClickHandler(e) {
    if (!this.movementDenied && e.button == 0) {
      this.mx = e.x
      this.my = e.y
      this.moving = true
    } else {
      this.moving = false
    }
  }

  updateHeaderBehaviour() {
    this.removeHeaderEvent()
    this.setBindings()
    this.registerHeaderEvent()
    this.bindings.dots.classList.remove('active')
  }

  removeHeaderEvent() {
    this.bindings.header.removeEventListener(
      'mousedown',
      this.headerClickHandler,
    )
  }

  registerHeaderEvent() {
    this.bindings.header.addEventListener('mousedown', this.headerClickHandler)
  }

  registerEvents() {
    this.registerHeaderEvent()

    document.addEventListener('mousemove', e => {
      if (this.moving) {
        this.move(e)
      }
    })

    document.addEventListener('mouseup', () => {
      this.moving = false
    })

    document.addEventListener('keydown', () => {
      this.moving = false
    })
  }
}
</script>

<style lang="scss" scoped>
$height: 300px;

.card {
  position: relative;
  height: $height;
  transition: opacity 0.3s;
  overflow: hidden;

  &_back {
    position: absolute;
    pointer-events: none;
    border-radius: 5px;
    box-shadow: inset 0 0 40px black;
    opacity: 0.7;
    width: 100%;
    height: 100%;
    background-color: #00000033;
    transition: opacity 0.3s;
  }

  &_slot {
    &.deactivated {
      pointer-events: none;
    }

    &-movable {
      position: absolute;
      width: 100%;
      transition: transform 0.3s, box-shadow 0.3s, opacity 0.2s;
      background-color: #26262644;
      border-radius: 5px;
      backdrop-filter: blur(10px);

      &.ready-to-leave {
        transform: translateY(10%);
      }

      &.ready-to-join {
        transform: translateY(-90%);
      }

      &.hidden {
        transform: translateY(-100%);
      }

      &_header {
        width: calc(100% - 20px);
        padding-left: 20px;
        height: 40px;
        font-size: 0.96rem;
        display: flex;
        align-items: center;
        user-select: none;
        text-align: left;

        &:hover &_dots {
          opacity: 1;
        }

        &_title {
          width: 100%;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }

        &_dots {
          position: relative;
          opacity: 0.2;
          transition: opacity 0.2s;
          margin: 0 15px;
          height: 50%;
          width: 12px;
          display: grid;
          align-items: center;
          justify-items: center;
          justify-content: space-between;
          align-content: space-between;
          grid-template-columns: repeat(1, 1fr);
          grid-template-rows: repeat(1, 1fr);

          div {
            position: absolute;
            width: 5px;
            height: 5px;
            background-color: white;
            border-radius: 100%;
            transition: all 0.2s;

            &:nth-child(1) {
              opacity: 0.3;
              top: 0%;
              left: 0%;
            }

            &:nth-child(2) {
              opacity: 0.3;
              top: 0%;
              left: 100%;
            }

            &:nth-child(3) {
              transition-delay: 0.1s;
              opacity: 0.5;
              top: 50%;
              left: 0%;
            }

            &:nth-child(4) {
              transition-delay: 0.1s;
              opacity: 0.5;
              top: 50%;
              left: 100%;
            }

            &:nth-child(5) {
              opacity: 0.3;
              top: 100%;
              left: 0%;
            }

            &:nth-child(6) {
              opacity: 0.3;
              top: 100%;
              left: 100%;
            }
          }
        }

        &_dots.active {
          opacity: 1;

          div {
            top: 50%;
            left: 50%;
          }
        }
      }

      &_content {
        width: calc(100% - 40px);
        padding: 20px;
        min-height: $height - 80px;
        max-height: $height - 80px;
        overflow: hidden;
      }
    }
  }
}
</style>
