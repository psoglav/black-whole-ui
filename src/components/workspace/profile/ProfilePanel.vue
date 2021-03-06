<template>
  <div class="profile-panel">
    <div class="profile-panel_resize"></div>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'profile-panel',
  data: () => ({
    resizing: false,
  }),
  watch: {
    resizing() {
      document.body.style.cursor = this.resizing ? 'col-resize' : 'default'
    },
    'workspaceConfig.panels.profile.sizable': 'registerResize',
  },
})
export default class ProfilePanel extends Vue {
  get workspaceConfig() {
    return this.$store.getters['workspaceConfig']
  }

  mounted() {
    this.registerResize(this.workspaceConfig.panels.profile.sizable)
  }

  resize(x) {
    const screenw = window.innerWidth
    const pixels = screenw - x
    const rem = pixels / 14

    let minDashboardWidth = this.workspaceConfig.panels.dashboard['min-width']
    let navigationWidth = this.workspaceConfig.panels.navigation.width
    let minProfileWidth = this.workspaceConfig.panels.profile['min-width']

    minDashboardWidth = +minDashboardWidth.replace('rem', '')
    minProfileWidth = +minProfileWidth.replace('rem', '')
    navigationWidth = +navigationWidth.replace('rem', '')

    if (rem < minProfileWidth) return
    else if ((navigationWidth + minDashboardWidth) * 14 > x) return

    this.$store.commit('SET_PROFILE_WIDTH', rem)
  }

  handleMouseDown(e) {
    if (!this.workspaceConfig.panels.profile.sizable) return

    if (e.target.classList && e.target.classList.contains('profile-panel_resize')) {
      this.resizing = true
    }
  }

  handleMouseMove(e) {
    if (!this.workspaceConfig.panels.profile.sizable) return

    if (this.resizing) {
      this.resize(e.x)
    } else {
      if (e.target.classList && e.target.classList.contains('profile-panel_resize')) {
        document.body.style.cursor = 'col-resize'
      } else {
        document.body.style.cursor = 'default'
      }
    }
  }

  handleMouseUp() {
    if (!this.workspaceConfig.panels.profile.sizable) return

    document.body.style.cursor = 'default'
    this.resizing = false
  }

  registerMouseEvents() {
    document.addEventListener('mousedown', this.handleMouseDown)
    document.addEventListener('mousemove', this.handleMouseMove)
    document.addEventListener('mouseup', this.handleMouseUp)
  }

  removeMouseEvents() {
    document.removeEventListener('mousedown', this.handleMouseDown)
    document.removeEventListener('mousemove', this.handleMouseMove)
    document.removeEventListener('mouseup', this.handleMouseUp)
  }

  registerResize(sizable) {
    this.removeMouseEvents()
    if (sizable) this.registerMouseEvents()
  }
}
</script>

<style lang="scss" scoped>
@import '@/scss/_variables.scss';

.profile-panel {
  position: relative;
  grid-area: profile;
  width: 100%;
  height: 100%;
  background-color: $sideground;

  &_resize {
    position: absolute;
    content: '';
    left: 0;
    width: 5px;
    height: 100%;
    border-left: 1px white solid;
    border-right: 1px gray solid;
    opacity: 0.2;
  }
}
</style>
