<script lang="ts">
import { mapActions } from 'vuex'
import { Component, Vue } from 'vue-property-decorator'
import WordleKeyboard from './WordleKeyboard.vue'
import WordleCore from './WordleCore.vue'
import WordleHeader from './WordleHeader.vue'
import ErrorMessage from './ErrorMessage.vue'

@Component({
  components: {
    WordleKeyboard,
    WordleCore,
    WordleHeader,
    ErrorMessage,
  },
  methods: {
    ...mapActions(['addNewError']),
  },
})
export default class WordleHome extends Vue {
  private word: Array<string> = []
  private editorIndex: number = 0
  private correctLetters: Array<string> = []
  private wrongPositionLetters: Array<string> = []
  private wrongLetters: Array<string> = []
  private showResult: boolean = false

  $refs!: {
    core: WordleCore
  }

  mounted() {
    this.registerEventListeners()
  }

  destroyed() {
    this.unregisterEventListeners()
  }

  private addToWord(letter: string): void {
    if (this.word.length === 5) return
    this.word.splice(this.editorIndex, 1, letter)
    if (this.editorIndex < 4) this.editorIndex = this.word.length
  }

  private removeFromWord(): void {
    const index: number =
      this.editorIndex > this.word.length - 1
        ? this.word.length - 1
        : this.editorIndex

    if (~index) this.word.splice(index, 1)
    if (this.editorIndex > 0) this.editorIndex--
  }

  private registerEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown)
  }

  private unregisterEventListeners(): void {
    window.removeEventListener('keydown', this.handleKeyDown)
  }

  private handleKeyDown(event: KeyboardEvent): void {
    let id = ''

    if (event?.key === 'Enter') id = 'key-enter'
    if (event?.key === 'Backspace') id = 'key-backspace'

    if (
      (event?.which >= 97 && event?.which <= 122) ||
      (event?.which >= 65 && event?.which <= 90)
    )
      id = `key-${event?.key}`

    document.getElementById(id)?.click()
  }

  private checkResult(): void {
    this.$refs.core?.checkResult()
  }

  private addToListOfLetters(letter: string, list: string) {
    const listRef = (this as any)[list]
    if (!listRef.includes(letter)) listRef.push(letter)
  }

  private finishGame() {
    this.showResult = true
  }
}
</script>

<template>
  <main class="wordle-home">
    <WordleHeader />
    <ErrorMessage />
    <WordleCore
      ref="core"
      :word="word"
      :editor-index="editorIndex"
      @go-to-index="editorIndex = $event"
      @clear-current-try="word = []"
      @correct="addToListOfLetters($event, 'correctLetters')"
      @wrong-position="addToListOfLetters($event, 'wrongPositionLetters')"
      @wrong="addToListOfLetters($event, 'wrongLetters')"
      @end-game="finishGame"
      @no-valid-word="addNewError('A palavra não é válida.')"
      @not-enough-chars="addNewError('Digite 5 letras.')"
    />
    <WordleKeyboard
      :correct-letters="correctLetters"
      :wrong-position-letters="wrongPositionLetters"
      :wrong-letters="wrongLetters"
      @type="addToWord"
      @backspace="removeFromWord"
      @enter="checkResult"
    />
  </main>
</template>

<style scoped>
body {
  margin: 0;
}

.wordle-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #342e37;
}
</style>
