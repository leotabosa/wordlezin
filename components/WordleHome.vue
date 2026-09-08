<script lang="ts">
import { mapActions } from 'vuex'
import { Component, Vue } from 'vue-property-decorator'
import { getDay, getWordOfTheDay } from '../utils/words'
import { encryptData, decryptData } from '../utils/crypto'
import WordleKeyboard from './WordleKeyboard.vue'
import WordleCore from './WordleCore.vue'
import WordleHeader from './WordleHeader.vue'
import ToastMessage from './ToastMessage.vue'
import GameResults from './GameResults.vue'
import SettingsModal from './SettingsModal.vue'

interface KeyboardState {
  correct: Set<string>
  wrongPosition: Set<string>
  wrong: Set<string>
}

@Component({
  components: {
    WordleKeyboard,
    WordleCore,
    WordleHeader,
    ToastMessage,
    GameResults,
    SettingsModal,
  },
  methods: {
    ...mapActions(['addNewToast']),
  },
})
export default class WordleHome extends Vue {
  [x: string]: any
  private word: Array<string> = []
  private editorIndex: number = 0
  private correctLetters: Array<string> = []
  private wrongPositionLetters: Array<string> = []
  private wrongLetters: Array<string> = []
  private showResults: boolean = false
  private gameWon: boolean = false
  private tries: Array<any> = []
  private keyboardState: KeyboardState = {
    correct: new Set(),
    wrongPosition: new Set(),
    wrong: new Set(),
  }
  private animatingTiles: boolean = false
  private gameCompleted: boolean = false
  private showSettings: boolean = false
  private hardMode: boolean = false
  private hardModeDisabled: boolean = false

  $refs!: {
    core: WordleCore
  }

  mounted() {
    this.registerEventListeners()
    this.loadHardModePreference()
    this.checkIfGameAlreadyPlayed()
    this.restoreInProgressGame()
  }

  destroyed() {
    this.unregisterEventListeners()
  }

  private async checkIfGameAlreadyPlayed(): Promise<void> {
    if (process.client) {
      const today = getDay()
      const storedData = localStorage.getItem('wordlezin_completed')
      
      if (storedData) {
        try {
          const decrypted = await decryptData(storedData)
          const data = JSON.parse(decrypted)
          
          if (data.day === today) {
            this.tries = data.tries
            this.gameWon = data.won
            this.showResults = true
            this.gameCompleted = true
          }
        } catch (error) {
          localStorage.removeItem('wordlezin_completed')
        }
      }
    }
  }

  private async restoreInProgressGame(): Promise<void> {
    if (process.client && !this.gameCompleted) {
      const today = getDay()
      const storedData = localStorage.getItem('wordlezin_progress')
      
      if (storedData) {
        try {
          const decrypted = await decryptData(storedData)
          const data = JSON.parse(decrypted)
          
          if (data.day === today && this.$refs.core) {
            this.$nextTick(() => {
              this.word = data.word || []
              this.editorIndex = data.editorIndex || 0
              if (data.tries) {
                this.$refs.core.tries = data.tries
                this.$refs.core.remainingChances = 5 - data.tries.length
                
                if (data.revealedLetters) {
                  this.$refs.core.revealedLetters = new Map(
                    data.revealedLetters.map(([key, value]: [string, number[]]) => [key, new Set(value)])
                  )
                }
                
                if (data.revealedYellowLetters) {
                  this.$refs.core.revealedYellowLetters = new Set(data.revealedYellowLetters)
                }
                
                data.tries.forEach((tryItem: any) => {
                  tryItem.word.forEach((letter: string, index: number) => {
                    const result = tryItem.result[index]
                    this.updateKeyboardStateWithPriority(letter, result)
                  })
                })
                
                this.hardModeDisabled = data.tries.length > 0
              }
            })
          } else if (data.day !== today) {
            localStorage.removeItem('wordlezin_progress')
          }
        } catch (error) {
          localStorage.removeItem('wordlezin_progress')
        }
      }
    }
  }

  private async saveInProgressGame(): Promise<void> {
    if (process.client && !this.gameCompleted) {
      const today = getDay()
      const data = {
        day: today,
        word: this.word,
        editorIndex: this.editorIndex,
        tries: this.$refs.core?.tries || [],
        revealedLetters: this.$refs.core ? Array.from(this.$refs.core.revealedLetters.entries()).map(([key, value]) => [key, Array.from(value)]) : [],
        revealedYellowLetters: this.$refs.core ? Array.from(this.$refs.core.revealedYellowLetters) : [],
      }
      
      try {
        const encrypted = await encryptData(JSON.stringify(data))
        localStorage.setItem('wordlezin_progress', encrypted)
      } catch (error) {
        console.error('Failed to save progress')
      }
    }
  }

  private updateKeyboardStateWithPriority(letter: string, result: string): void {
    if (result === 'correct') {
      this.keyboardState.correct.add(letter)
      this.keyboardState.wrongPosition.delete(letter)
      this.keyboardState.wrong.delete(letter)
    } else if (result === 'wrong-position' && !this.keyboardState.correct.has(letter)) {
      this.keyboardState.wrongPosition.add(letter)
      this.keyboardState.wrong.delete(letter)
    } else if (result === 'wrong' && !this.keyboardState.correct.has(letter) && !this.keyboardState.wrongPosition.has(letter)) {
      this.keyboardState.wrong.add(letter)
    }

    this.correctLetters = Array.from(this.keyboardState.correct)
    this.wrongPositionLetters = Array.from(this.keyboardState.wrongPosition)
    this.wrongLetters = Array.from(this.keyboardState.wrong)
  }

  private addToWord(letter: string): void {
    if (this.word.length === 5 || this.gameCompleted || this.animatingTiles) return
    this.word.splice(this.editorIndex, 1, letter)
    if (this.editorIndex < 4) this.editorIndex = this.word.length
    this.saveInProgressGame()
  }

  private removeFromWord(): void {
    if (this.gameCompleted || this.animatingTiles) return
    const index: number =
      this.editorIndex > this.word.length - 1
        ? this.word.length - 1
        : this.editorIndex

    if (~index) this.word.splice(index, 1)
    if (this.editorIndex > 0) this.editorIndex = index
    this.saveInProgressGame()
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
    if (this.animatingTiles || this.gameCompleted) return
    this.animatingTiles = true
    
    if (!this.hardModeDisabled && this.$refs.core && this.$refs.core.tries.length === 0) {
      this.hardModeDisabled = true
    }
    
    this.$refs.core?.checkResult()
  }

  private addToListOfLetters(letter: string, result: string): void {
    setTimeout(() => {
      this.updateKeyboardStateWithPriority(letter, result)
    }, 1500)
  }

  private async finishGame(tries: Array<any>): Promise<void> {
    this.animatingTiles = false
    this.tries = tries
    this.gameWon = true
    this.gameCompleted = true

    const today = getDay()
    const solution = getWordOfTheDay()
    const data = {
      day: today,
      tries: tries,
      won: true,
      word: solution,
    }

    try {
      const encrypted = await encryptData(JSON.stringify(data))
      localStorage.setItem('wordlezin_completed', encrypted)
      localStorage.removeItem('wordlezin_progress')
    } catch (error) {
      console.error('Failed to save game')
    }

    setTimeout(() => {
      this.showResults = true
    }, 1500)
  }

  private async handleGameLoss(): Promise<void> {
    this.animatingTiles = false
    this.gameWon = false
    this.gameCompleted = true

    const today = getDay()
    const solution = getWordOfTheDay()
    const data = {
      day: today,
      tries: this.$refs.core.tries,
      won: false,
      word: solution,
    }

    try {
      const encrypted = await encryptData(JSON.stringify(data))
      localStorage.setItem('wordlezin_completed', encrypted)
      localStorage.removeItem('wordlezin_progress')
    } catch (error) {
      console.error('Failed to save game')
    }

    setTimeout(() => {
      this.showResults = true
    }, 1500)
  }

  private handleTileAnimationComplete(): void {
    this.animatingTiles = false
    this.saveInProgressGame()

    if (this.$refs.core && this.$refs.core.remainingChances === -1 && !this.$refs.core.isCorrect) {
      this.handleGameLoss()
    }
  }

  private handleCopySuccess(): void {
    this.addNewToast({
      type: 'success',
      message: 'Imagem copiada!',
    })
  }

  private handleCopyError(): void {
    this.addNewToast({
      type: 'error',
      message: 'Erro ao copiar imagem',
    })
  }

  private toggleSettings(): void {
    this.showSettings = !this.showSettings
  }

  private toggleHardMode(): void {
    this.hardMode = !this.hardMode
    if (process.client) {
      localStorage.setItem('wordlezin_hard_mode', this.hardMode ? '1' : '0')
    }
  }

  private loadHardModePreference(): void {
    if (process.client) {
      const saved = localStorage.getItem('wordlezin_hard_mode')
      this.hardMode = saved === '1'
    }
  }

  private handleHardModeViolation(message: string): void {
    this.animatingTiles = false
    this.addNewToast({
      type: 'error',
      message: message,
    })
  }
}
</script>

<template>
  <main class="wordle-home">
    <GameResults
      v-if="showResults"
      :attempts="tries.length"
      :word="$refs.core ? $refs.core.solution : ''"
      :won="gameWon"
      :tries="tries"
      @copy-success="handleCopySuccess"
      @copy-error="handleCopyError"
    />
    <SettingsModal
      :show="showSettings"
      :hard-mode="hardMode"
      :hard-mode-disabled="hardModeDisabled"
      @close="showSettings = false"
      @toggle-hard-mode="toggleHardMode"
    />
    <WordleHeader @open-settings="toggleSettings" />
    <ToastMessage />
    <WordleCore
      ref="core"
      :word="word"
      :editor-index="editorIndex"
      :hard-mode="hardMode"
      @go-to-index="editorIndex = $event"
      @clear-current-try="word = []; editorIndex = 0"
      @correct="addToListOfLetters($event, 'correct')"
      @wrong-position="addToListOfLetters($event, 'wrong-position')"
      @wrong="addToListOfLetters($event, 'wrong')"
      @end-game="finishGame"
      @tile-animation-complete="handleTileAnimationComplete"
      @hard-mode-violation="handleHardModeViolation"
      @no-valid-word="
        addNewToast({ type: 'error', message: 'A palavra não é válida.' }); animatingTiles = false
      "
      @not-enough-chars="
        addNewToast({ type: 'error', message: 'Digite 5 letras.' }); animatingTiles = false
      "
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

<style scoped lang="scss">
.wordle-home {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #342e37;
}
</style>
