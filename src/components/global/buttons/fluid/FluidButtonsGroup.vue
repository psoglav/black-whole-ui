<template>
  <div class="fluid-buttons">
    <slot />
    <!-- <transition-group name="list" tag="div"> -->
    <!-- <component -->
    <!-- :is="button" -->
    <!-- v-for="button in buttons" -->
    <!-- :key="button._uid" -->
    <!-- class="fluid-item" -->
    <!-- /> -->
    <!-- </transition-group> -->
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'fluid-buttons-group',
  props: {
    sequencing: {
      type: Boolean,
    },
  },
})
export default class FluidButtonsGroup extends Vue {}
</script>

<style lang="scss" scoped>
$buttons-gap: 20px;

.fluid-button {
  margin-bottom: $buttons-gap;
}

.fluid-buttons {
  width: calc(100% - 40px);
  padding: 20px;
  position: relative;
}
</style>
