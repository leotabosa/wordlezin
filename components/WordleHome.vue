<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import WordleKeyboard from './WordleKeyboard.vue'
import WordleResult from './WordleResult.vue'

@Component({
  components: {
    WordleKeyboard,
    WordleResult,
  },
})
export default class WordleHome extends Vue {
  private word: Array<string> = []
  private editorIndex: number = 0

  private addToWord(letter: string): void {
    this.word.splice(this.editorIndex, 1, letter)
    if (this.editorIndex < 4) this.editorIndex++
  }

  private removeFromWord(): void {
    const index: number =
      this.editorIndex > this.word.length - 1
        ? this.word.length - 1
        : this.editorIndex

    if (~index) this.word.splice(index, 1)
    if (this.editorIndex > 0) this.editorIndex--
  }
}
</script>

<template>
  <main class="wordle-home">
    <WordleResult :word="word" @go-to-index="editorIndex = $event" />
    <WordleKeyboard @type="addToWord" @backspace="removeFromWord" />
  </main>
</template>

<style scoped>
body {
  margin: 0;
}

.wordle-home {
  width: 100vw;
  height: 100vh;
  background-color: #342e37;
}
</style>
