<template>
  <div class="workspace" :style="computedGridStyle"></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { workspaceConfig } from '@/config/workspace'

@Component({
  components: {},
})
export default class Workspace extends Vue {
  get computedGridStyle(): object {
    const navigation = workspaceConfig.navigation.width
    const actions = workspaceConfig.actions.width
    const profile = workspaceConfig.profile.width

    return {
      'grid-template-columns': `${navigation} 1fr ${profile}`,
      'grid-template-rows': `${actions} 1fr`,
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../scss/_variables.scss';

.workspace {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-areas: 'navigation actions actions' 'navigation dashboard profile';
  overflow: hidden;
}
</style>
