<template>
  <div class="dashboard-panel">
    <cards-pocket>
      <card title="Course" />
      <card title="Thikness" />
      <card title="Support">
        <text-input />
      </card>
      <card title="Diargam" />
      <card title="Lorem" />
      <card title="Ipsum" />
      <card title="Pickle" />
      <card title="Move" />
      <card title="Bucket" />
      <card title="Time for traveling to Zimbabua" />
      <card title="Shit" />
      <card title="Happens">
        <fluid-button label="Orders" />
        <fluid-button label="Prices" />
        <fluid-button label="Bisquit" />
        <fluid-button label="Plate" />
        <fluid-button label="Honor" />
        <fluid-button label="Direct" />
      </card>
      <card title="Bear" />
      <card title="Pearer" />
      <card title="Urban" />
      <card title="Milk" />
    </cards-pocket>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator'

@Component({
  name: 'dashboard-panel',
})
export default class DashboardPanel extends Vue {}
</script>

<style lang="scss" scoped>
@import '@/scss/_variables.scss';

.dashboard-panel {
  grid-area: dashboard;
  width: 100%;
  height: 100%;
  background-color: $background;
  overflow: auto;
}
</style>
