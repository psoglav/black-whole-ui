<template>
  <div class="cards-pocket">
    <slot />
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'cards-pocket',
})
export default class CardsPocket extends Vue {

  created() {
    this.$root.$on('card-detached', this.onCardDetached)
    this.$root.$on('card-inserted', this.onCardInserted)
  }

  mounted() {
    // console.log(this.$slots)
  }

  beforeDestroy() {
    this.$root.$off('card-detached', this.onCardDetached)
    this.$root.$off('card-inserted', this.onCardInserted)
  }

  onCardDetached(id) {
    console.log(id)
  }

  onCardInserted(id) {
    console.log(id)
  }
}
</script>

<style lang="scss">
@import '@/scss/_variables.scss';

.cards-pocket {
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  padding: 20px;
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(calc(20rem - 40px), 1fr));
  flex-wrap: wrap;
  background-color: $background;
  overflow: auto;
}

</style>
