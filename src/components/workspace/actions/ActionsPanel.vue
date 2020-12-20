<template>
  <div class="panel"></div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class ActionsPanel extends Vue {
  name = 'actions-panel'
}
</script>

<style lang="scss" scoped>
@import '@/scss/_variables.scss';

.panel {
  grid-area: actions;
  width: 100%;
  height: 100%;
  background-color: $postground;
}
</style>
