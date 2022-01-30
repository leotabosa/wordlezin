<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'

@Component
export default class KeyboardKey extends Vue {
  @Prop({ default: '', type: String }) readonly letter!: string
  @Prop({ default: false, type: Boolean }) readonly backspaceKey!: boolean
  @Prop({ default: false, type: Boolean }) readonly enterKey!: boolean
  @Prop({ default: () => [], type: Array })
  readonly wrongLetters!: Array<string>

  @Prop({ default: () => [], type: Array })
  readonly correctLetters!: Array<string>

  @Prop({ default: () => [], type: Array })
  readonly wrongPositionLetters!: Array<string>

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
    if (this.enterKey) return 'ENTER'
    if (this.backspaceKey) return '⌫'

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
  <button
    :id="`key-${backspaceKey ? 'backspace' : content.toLowerCase()}`"
    class="keyboard-key"
    :class="{
      'keyboard-key__a': content === 'A',
      'keyboard-key__z': content === 'Z',
      'keyboard-key__correct': correctLetters.includes(content),
      'keyboard-key__wrong-position': wrongPositionLetters.includes(content),
      'keyboard-key__wrong':
        wrongLetters.includes(content) && !correctLetters.includes(letter),
    }"
    @click="emitEvent(content)"
  >
    {{ content }}
  </button>
</template>

<style scoped lang="scss">
.keyboard-key {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background-color: #6e5c62;
  font-size: min(4em, calc(var(--keyboard-height) / 10));
  border-radius: 4px;
  appearance: button;
  grid-column: span 3;
  transition: all 0.2s ease;

  &__wrong {
    background-color: #333;
    opacity: 0.8;
  }

  &__wrong-position {
    background-color: #d3ad69;
  }

  &__correct {
    background-color: #3aa394;
  }

  &__a {
    grid-column: 2 / span 3;
  }

  &__z {
    grid-column: 3 / span 3;
  }

  &:active {
    box-shadow: inset -2px -2px 3px rgba(255, 255, 255, 0.6),
      inset 2px 2px 3px rgba(0, 0, 0, 0.6);
  }
}
</style>
