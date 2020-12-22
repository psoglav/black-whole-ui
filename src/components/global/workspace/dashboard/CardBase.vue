<template>
  <div class="card">
    <div class="card_new-slot"></div>
    <div class="card_slot">
      <div class="card_slot-movable">
        <div class="card_slot-movable_header">
          <div class="card_slot-movable_header_title">{{ title }}</div>
          <div
            :class="['card_slot-movable_header_dots', moving ? 'active' : '']"
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

<script>
import { Component, Watch } from 'vue-property-decorator'
import * as math from 'mathjs'

import Advanced from '@/mixins/advanced-component'

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
      this.detachCard()
    } else {
      this.insertCard()
    }
  }

  mx = 0
  my = 0
  startx = 0
  starty = 0
  dx = 0
  dy = 0
  moving = false
  movementDenied = false
  bindings = null
  distanceToChangeSlot = 2.2

  mounted() {
    this.setBindings()
    this.registerEvents()
  }

  setBindings() {
    const set = {
      card: this.$el,
      slot: this.$('.card_slot'),
      newSlot: this.$('.card_new-slot'),
      movable: this.$('.card_slot-movable'),
      header: this.$('.card_slot-movable_header'),
      dots: this.$('.card_slot-movable_header_dots'),
    }

    set.movableRect = set.movable.getBoundingClientRect()
    set.cardRect = set.card.getBoundingClientRect()

    this.bindings = set
  }

  insertCard() {
    this.movementDenied = true

    this.updateStartPosition()

    this.bindings.slot.style.cursor = 'default'
    this.bindings.header.style.cursor = 'pointer'
    this.bindings.movable.style.transition =
      'transform .3s, box-shadow .3s, top .3s, left .3s'
    this.bindings.movable.style.top = this.starty + 'px'
    this.bindings.movable.style.left = this.startx + 'px'
    this.bindings.newSlot.style.top = this.starty + 'px'

    setTimeout(() => {
      this.movementDenied = false

      this.bindings.movable.style.transition = 'transform 0.3s, box-shadow 0.3s'
      this.bindings.newSlot.style.width = '100%'
      this.bindings.newSlot.style.top = 0
      this.bindings.movable.style.top = 0
      this.bindings.movable.style.left = 0
      this.bindings.dots.style.opacity = ''
      this.bindings.card.style.position = 'relative'
      this.bindings.slot.style.position = 'relative'
      this.bindings.movable.style.transform = ''
      this.bindings.movable.style.width = '100%'
      this.bindings.movable.style['box-shadow'] = 'none'
      this.bindings.movable.style['z-index'] = 0
      this.bindings.movable.style.opacity = 1
    }, 300)
  }

  getIndex(el) {
    if (!el) return -1
    let i = 0
    do {
      i++
    } while ((el = el.previousElementSibling))
    return i
  }

  detachCard() {
    this.updateStartPosition()

    this.dx = this.mx - this.bindings.movableRect.x
    this.dy = this.my - this.bindings.movableRect.y

    this.bindings.card.style.position = 'initial'
    this.bindings.slot.style.position = 'initial'
    this.bindings.slot.style.cursor = 'move'
    this.bindings.newSlot.style.width = this.bindings.card.clientWidth + 'px'
    this.bindings.newSlot.style.height = this.bindings.card.clientHeight + 'px'
    this.bindings.newSlot.style.top = this.starty + 'px'
    this.bindings.header.style.cursor = 'move'
    this.bindings.dots.style.opacity = 1
    this.bindings.movable.style.transform = 'scale(1.03)'
    this.bindings.movable.style.width = this.bindings.slot.clientWidth + 'px'
    this.bindings.movable.style['box-shadow'] = '0 0 35px #00000077'
    this.bindings.movable.style['z-index'] = 10
    this.bindings.movable.style.left = this.startx + 'px'
    this.bindings.movable.style.top = this.starty + 'px'
  }

  changingOrder() {
    this.setBindings()

    const { movableRect, movable } = this.bindings

    const cards = document.querySelectorAll('.card')

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i]
      const cardRect = card.getBoundingClientRect()

      const movablex = movableRect.x + movable.clientWidth / 2
      const movabley = movableRect.y + movable.clientHeight / 2
      const cardx = cardRect.x + card.clientWidth / 2
      const cardy = cardRect.y + card.clientHeight / 2

      const d = math.distance([movablex, movabley], [cardx, cardy])
      const trigger = movable.clientWidth / this.distanceToChangeSlot

      if (d < trigger) {
        this.updateStartPosition()
        this.bindings.newSlot.style.top = this.starty + 'px'

        if (this.$el != card) {
          let replacement = card.nextSibling

          if (this.getIndex(card) < this.getIndex(this.$el)) {
            replacement = card
          }

          this.$parent.$el.insertBefore(this.$el, replacement)
          break
        }
      }
    }
  }

  move(e) {
    this.setBindings()

    this.bindings.movable.style.top = e.y - this.dy + 'px'
    this.bindings.movable.style.left = e.x - this.dx + 'px'
  }

  scroll() {
    this.updateStartPosition()

    this.bindings.movable.style.top = this.starty + 'px'
    this.bindings.movable.style.left = this.startx + 'px'
    this.bindings.newSlot.style.top = this.starty + 'px'
  }

  updateStartPosition() {
    this.setBindings()

    this.startx = this.bindings.cardRect.x
    this.starty = this.bindings.cardRect.y
  }

  maintainCardInView(e) {
    if (e.y < 200) this.$parent.$el.scrollTop--
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
        this.maintainCardInView(e)
        this.changingOrder()
        this.move(e)
      }
    })

    document.addEventListener('mouseup', () => {
      this.moving = false
    })

    document.addEventListener('keydown', () => {
      this.moving = false
    })

    // this.$parent.$el.addEventListener('scroll', () => {
    // if (this.moving) {
    // this.scroll()
    // }
    // })
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

  &_new-slot {
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

      &_header {
        width: calc(100% - 20px);
        padding-left: 20px;
        height: 40px;
        font-size: 0.96rem;
        display: flex;
        align-items: center;
        user-select: none;
        text-align: left;
        cursor: pointer;

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
