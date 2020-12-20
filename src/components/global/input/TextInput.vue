<template>
  <input class="text-input" type="text" />
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator'

@Component({
  name: 'text-input'
})
export default class TextInput extends Vue{
}
</script>

<style lang="scss" scoped>
$padding: 10px;

.text-input {
  height: 30px;
  width: calc(100% - #{$padding * 2});
  border-radius: 5px;
  display: flex;
  justify-content: center;
  cursor: pointer;
  background-color: #00000044;
  outline: none;
  color: white;
  font-family: Roboto, Montserrat;
  font-size: 0.9rem;
  padding: 2px 10px;
  border: 0;

  &::selection {
    background-color: #00000088;
    color: #ffffff99;
  }
}
</style>
