<template>
  <div class="workspace" :style="computedGridStyle">
    <actions-panel />
    <dashboard-panel />
    <navigation-panel />
    <profile-panel />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

import ActionsPanel from '@/components/workspace/actions/ActionsPanel.vue'
import DashboardPanel from '@/components/workspace/dashboard/DashboardPanel.vue'
import NavigationPanel from '@/components/workspace/navigation/NavigationPanel.vue'
import ProfilePanel from '@/components/workspace/profile/ProfilePanel.vue'

@Component({
  components: {
    ActionsPanel,
    DashboardPanel,
    NavigationPanel,
    ProfilePanel,
  },
})
export default class Workspace extends Vue {
  get workspaceConfig() {
    return this.$store.getters['workspaceConfig']
  }
  
  get computedGridStyle(): object {
    const navigation = this.workspaceConfig.panels.navigation.width
    const actions = this.workspaceConfig.panels.actions.width
    const profile = this.workspaceConfig.panels.profile.width

    return {
      'grid-template-columns': `${navigation} 1fr ${profile}`,
      'grid-template-rows': `${actions} 1fr`,
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/_variables.scss';

.workspace {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-areas: 'navigation actions actions' 'navigation dashboard profile';
  overflow: hidden;
}
</style>
