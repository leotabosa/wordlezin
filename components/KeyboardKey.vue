<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'

@Component
export default class KeyboardKey extends Vue {
  @Prop({ default: '', type: String }) readonly letter!: string
  @Prop({ default: false, type: Boolean }) readonly backspaceKey!: boolean
  @Prop({ default: false, type: Boolean }) readonly enterKey!: boolean

  private emitEvent(value: string) {
    if (this.backspaceKey) {
      this.backspace()
      return
    }

    if (this.enterKey) {
      this.enter()
      return
    }

    this.type(value)
  }

  get content(): string {
    if (this.enterKey) return 'Enter'
    if (this.backspaceKey) return 'Backspace'

    return this.letter
  }

  @Emit()
  private type(_value: string) {}

  @Emit()
  private enter() {}

  @Emit()
  private backspace() {}
}
</script>

<template>
  <div class="keyboard-key" @click="emitEvent(content)">{{ content }}</div>
</template>

<style scoped>
.keyboard-key {
  color: white;
  background-color: #6e5c62;
}
</style>
