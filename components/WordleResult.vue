<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'

@Component
export default class WordleResult extends Vue {
  @Prop({ default: () => [], type: Array }) readonly word!: Array<string>
  @Prop({ default: () => [], type: Array }) readonly tries!: Array<string>

  @Emit()
  private goToIndex(_index: number) {}
}
</script>

<template>
  <section>
    <div class="result current-try">
      <div
        v-for="tryPosition in 5"
        :key="`try-${tryPosition}`"
        @click="goToIndex(tryPosition - 1)"
      >
        {{ word[tryPosition - 1] }}
      </div>
    </div>
  </section>
</template>

<style scoped>
.result {
  display: flex;
  gap: 15px;
  color: white;
  background-color: #6e5c62;
}
</style>
