<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator'

@Component
export default class WordleHeader extends Vue {
  @Emit()
  openSettings() {}
}
</script>

<template>
  <header class="header">
    <div class="header__spacer"></div>
    <div class="header__title">Wordlezin</div>
    <button class="header__settings" @click="openSettings">
      ⚙
    </button>
  </header>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 4vh;
  height: 6vh;
  color: white;
  width: 100%;
  padding: 0 20px;

  &__spacer {
    width: 40px;
  }

  &__title {
    flex: 1;
    text-align: center;
  }

  &__settings {
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.7;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
