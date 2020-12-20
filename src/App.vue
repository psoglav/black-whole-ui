<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
@import 'scss/_smart-grid.scss';
@import 'scss/_variables.scss';

* {
  margin: 0;
  padding: 0;
}

p, a, div, span {
  color: $plain-text;
  font-family: Roboto, Montserrat;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 16px;
  background-color: #000;
}

body {
  background-color: $background;
  overflow: hidden;
}
</style>
