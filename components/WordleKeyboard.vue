<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import Letters from '../static/letters'
import KeyboardKey from './KeyboardKey.vue'

@Component({
  components: {
    KeyboardKey,
  },
})
export default class WordleKeyboard extends Vue {
  @Prop({ default: () => [], type: Array })
  readonly wrongLetters!: Array<string>

  @Prop({ default: () => [], type: Array })
  readonly correctLetters!: Array<string>

  @Prop({ default: () => [], type: Array })
  readonly wrongPositionLetters!: Array<string>

  data(): {
    letters: Array<string>
  } {
    return {
      letters: Letters,
    }
  }
}
</script>

<template>
  <section class="keyboard">
    <div class="keyboard__keys">
      <KeyboardKey
        v-for="(letter, index) in letters"
        :key="`${letter}-${index}`"
        :letter="letter"
        :correct-letters="correctLetters"
        :wrong-position-letters="wrongPositionLetters"
        :wrong-letters="wrongLetters"
        @type="$emit('type', $event)"
      />
      <KeyboardKey
        class="keyboard__enter-key"
        enter-key
        @enter="$emit('enter')"
      />
      <KeyboardKey
        class="keyboard__backspace-key"
        backspace-key
        @backspace="$emit('backspace')"
      />
    </div>

    <div class="keyboard__actions"></div>
  </section>
</template>

<style scoped lang="scss">
.keyboard {
  padding: 8px;
  width: 100%;
  &__keys {
    height: var(--keyboard-height);
    display: grid;
    gap: 0.8em;
    grid-template-columns: repeat(32, 1fr);
  }

  &__enter-key {
    font-size: min(3.6em, calc(var(--keyboard-height) / 7));
    grid-column: 25 / span 8 !important;
  }

  &__backspace-key {
    grid-area: 2 / 30 / 2 / 33 !important;
  }
}
</style>
