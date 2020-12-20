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
  user-select: none;
}

*::-webkit-scrollbar {
  background-color: #000;
}

*::-webkit-scrollbar-thumb {
  background-color: #111;
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
  background: url('./assets/images/bg001.png');
  background-size: cover;
  background-position: center;
}

body {
  background-color: $background;
  overflow: hidden;
}
</style>
