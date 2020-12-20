<template>
  <div class="dashboard-panel">
    <card title="Course" />
    <card title="Thikness" />
    <card title="Support">
      <text-input />
    </card>
    <card title="Diargam" />
    <card title="Lorem" />
    <card title="Ipsum" />
    <card title="Time" />
    <card title="Time" />
    <card title="Time" />
    <card title="Time for traveling to Zimbabua" />
    <card title="Time" />
    <card title="Work">
      <fluid-button value="Orders" />
      <fluid-button value="Orders" />
      <fluid-button value="Prices" />
      <fluid-button value="Orders" />
      <fluid-button value="Orders" />
      <fluid-button value="Prices" />
      <fluid-button value="Direct" />
    </card>
    <card title="Time" />
    <card title="Time" />
    <card title="Time" />
    <card title="Time" />
  </div>
</template>

<script>
export default {
  name: 'dashboard-panel',
}
</script>

<style lang="scss" scoped>
@import '@/scss/_variables.scss';

.dashboard-panel {
  grid-area: dashboard;
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
