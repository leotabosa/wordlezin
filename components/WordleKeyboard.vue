<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Letters from '../static/letters'
import KeyboardKey from './KeyboardKey.vue'

@Component({
  components: {
    KeyboardKey,
  },
})
export default class WordleKeyboard extends Vue {
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
  <section>
    <KeyboardKey
      v-for="(letter, index) in letters"
      :key="`${letter}-${index}`"
      :letter="letter"
      @type="$emit('type', $event)"
    />

    <div class="keyboard-actions">
      <KeyboardKey enter-key @enter="$emit('enter')" />
      <KeyboardKey backspace-key @backspace="$emit('backspace')" />
    </div>
  </section>
</template>
