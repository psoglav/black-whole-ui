<template>
  <div class="panel">
    <fluid-buttons-group :sequencing="false">
      <fluid-button
        @click="
          () => {
            this.workspaceConfig.profile.sizable = !this.workspaceConfig.profile
              .sizable
          }
        "
        width="50%"
        :message="!workspaceConfig.profile.sizable ? 'Option on' : 'Option off'"
        :triggers="{
          left: {
            name: 'Off',
            action: () => {
              workspaceConfig.profile.sizable = false
            },
          },
          right: {
            name: 'On',
            action: () => {
              workspaceConfig.profile.sizable = true
            },
          },
        }"
        value="Sizable profile"
      />
      <fluid-button value="Members" />
      <fluid-button value="Hiring" />
    </fluid-buttons-group>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'navigation-panel',
})
export default class NavigationPanel extends Vue {
  get workspaceConfig() {
    return this.$store.getters['workspaceConfig']
  }
}
</script>

<style lang="scss" scoped>
@import '../../../scss/_variables.scss';

.panel {
  grid-area: navigation;
  width: 100%;
  height: 100%;
  background-color: $foreground;
  display: flex;
  align-items: center;
}
</style>
