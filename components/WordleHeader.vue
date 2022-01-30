<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class WordleHeader extends Vue {}
</script>

<template>
  <header class="header">Wordlezin</header>
</template>

<style scoped lang="scss">
.header {
  display: flex;
  font-size: 4vh;
  height: 6vh;
  color: white;
}
</style>
