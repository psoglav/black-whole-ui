<template>
  <div
    class="card"
    @mouseover="mouseOverHandler"
    @mouseleave="mouseLeaveHandler"
  >
    <div class="card_back"></div>
    <div :class="['card_slot', 'parent_' + id]">
      <div
        class="card_slot-movable"
        :class="{ 'ready-remove': readyRemove }"
        :id="id"
      >
        <div class="card_slot-movable_header" :style="movableHeaderStyle">
          <div class="card_slot-movable_header_title">{{ title }}</div>
          <div
            class="card_slot-movable_header_dots"
            :class="{ active: moving }"
          >
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
import { Log } from '@/services/decorators'

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
    if (this.readyRemove) {
      this.$root.$emit('card-unfocused', this.id)
      this.readyRemove = false
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
  readyRemove = false
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
    const set = {
      card: this.$el,
      slot: this.$('.card_slot'),
      movable,
      header: this.$('.card_slot-movable_header'),
      dots: this.$('.card_slot-movable_header_dots'),
      app: document.querySelector('#app'),
      workspace: document.querySelector('.workspace'),
      movableRect: movable.getBoundingClientRect(),
      cardRect: this.$el.getBoundingClientRect(),
    }

    this.bindings = set
  }

  elseCardInserted() {
    this.elseCardIsMoving = false
  }

  elseCardDetached() {
    this.elseCardIsMoving = true
  }

  removeMovableReplacements() {
    const existing = this.$el.querySelectorAll('.ready-append')
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

      let replacement = document.querySelector('.card_slot-movable#' + id)
      this.replacementNode = replacement
      replacement = replacement.cloneNode(true) as Element
      replacement.classList.remove('ready-remove')
      replacement.classList.add('hidden')

      setTimeout(() => {
        replacement.classList.remove('hidden')
        replacement.classList.add('ready-append')
      }, 5)

      this.bindings.slot.appendChild(replacement)
    }

    // turn it off on unfocused cards
    this.readyRemove = false

    if (
      this.id != id || // when it's the same card
      !this.elseCardIsMoving || // when no cards is being moved
      (this.id == id && this.moving) // when it's the card which user is moving
    ) {
      return
    }

    // and opposite on focused card
    this.readyRemove = true
  }

  readyCardUnfocused() {
    const existing = this.$el.querySelector('.ready-append')

    if (existing) {
      existing.classList.remove('ready-append')
      existing.classList.add('hidden')
    }
  }

  insertCard() {
    const bs = this.bindings

    this.$root.$emit('card-inserted', this.id)

    this.mx = 0
    this.my = 0
    this.dx = 0
    this.dy = 0

    // this.updateStartPosition()

    // this.movementDenied = true

    if (this.replacementNode) {
      const replacementParent = this.replacementNode.parentNode

      const thisId = this.id
      const replacementId = replacementParent.classList[1].split('_')[1]

      bs.movable.id = replacementId
      this.replacementNode.id = thisId
      replacementParent.removeChild(this.replacementNode)
      replacementParent.appendChild(bs.movable)
      this.replacementNode = null

      const replacementMovableClone = this.$el.querySelector('.ready-append')

      replacementMovableClone.classList.remove('ready-append')
      // this.removeMovableReplacements()
    } else {
      bs.slot.appendChild(bs.movable)
    }

    this.setBindings()

    bs.movable.style.transition = 'transform .3s, box-shadow .3s'
    bs.movable.style.top = ''
    bs.movable.style.left = ''
    bs.movable.style['z-index'] = 1
    bs.movable.style['pointer-events'] = 'all'
    bs.movable.style.transform = ''
    bs.movable.style.width = '100%'
  }

  detachCard() {
    const bs = this.bindings

    this.$root.$emit('card-detached', this.id)

    this.updateStartPosition()
    this.updateCursor()

    // detaching movable element from this card slot
    // and inserting it to the app
    bs.app.insertBefore(bs.slot.removeChild(bs.movable), bs.workspace)

    this.setBindings()

    this.dx = this.mx - bs.movableRect.x
    this.dy = this.my - bs.movableRect.y
    this.startYScroll = this.$parent.$el.scrollTop

    bs.movable.style.width = bs.slot.clientWidth + 'px'
    bs.movable.style['box-shadow'] = '0 0 35px #00000077'
    bs.movable.style['z-index'] = 10
    bs.movable.style['pointer-events'] = 'none'
    bs.movable.style.transform = 'scale(1.03)'
    bs.movable.style.left = this.startx + 'px'
    bs.movable.style.top = this.starty + 'px'
  }

  // FIX: doesnt work properly because of pointer-events turned off
  updateCursor() {
    let cursorStyle

    switch (this.cardConfig.cursorGrabStyle) {
      case 1:
        cursorStyle = this.moving ? 'move' : 'pointer'
        break
      case 2:
        cursorStyle = this.moving ? 'grabbing' : 'grab'
        break
    }

    this.bindings.header.style.cursor = cursorStyle
    this.bindings.dots.style.cursor = cursorStyle
    // document.body.style.cursor = cursorStyle
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

  updateStartPosition() {
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

  registerEvents() {
    this.bindings.header.addEventListener('mousedown', e => {
      if (!this.movementDenied && e.button == 0) {
        this.mx = e.x
        this.my = e.y
        this.moving = true
      } else {
        this.moving = false
      }
    })

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
    &-movable {
      position: absolute;
      width: 100%;
      transition: transform 0.3s, box-shadow 0.3s, opacity 0.2s;
      background-color: #26262644;
      border-radius: 5px;
      backdrop-filter: blur(10px);

      &.ready-remove {
        // opacity: 0.65;
        // filter: blur(5px);
        // backdrop-filter: none;
        transform: translateY(10%);
      }

      &.ready-append {
        // opacity: 0.65;
        transform: translateY(-90%);
      }

      &.hidden {
        // // opacity: 0.65;
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
