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

  mounted() {
    console.log('cardsPocket')
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
