<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import { getWordOfTheDay, isValidWord } from '../utils/words'

interface Try {
  word: Array<string>
  result: Array<string>
  hitsByLetter: any
}

@Component
export default class WordleCore extends Vue {
  @Prop({ default: () => [], type: Array }) readonly word!: Array<string>
  @Prop({ default: () => 0, type: Number }) readonly editorIndex!: number
  @Prop({ default: false, type: Boolean }) readonly hardMode!: boolean

  private remainingChances: number = 5
  private tries: Array<Try> = []
  private solution: string = ''
  private isCorrect: boolean = false
  public revealedLetters: Map<string, Set<number>> = new Map()
  public revealedYellowLetters: Set<string> = new Set()

  mounted() {
    this.getTodaySolution()
  }

  @Emit()
  public goToIndex(_index: number) {}

  @Emit()
  public clearCurrentTry() {}

  @Emit()
  public correct(_letter: string) {}

  @Emit()
  public wrongPosition(_letter: string) {}

  @Emit()
  public wrong(_letter: string) {}

  @Emit()
  public endGame(_tries: Array<Try>) {}

  @Emit()
  public noValidWord() {}

  @Emit()
  public notEnoughChars() {}

  @Emit()
  public tileAnimationComplete() {}

  @Emit()
  public hardModeViolation(_message: string) {}

  private validateHardMode(): string | null {
    if (!this.hardMode || this.tries.length === 0) return null

    for (const [letter, positions] of this.revealedLetters.entries()) {
      for (const pos of positions) {
        if (this.word[pos] !== letter) {
          return `A letra ${letter} deve estar na posição ${pos + 1}`
        }
      }
    }

    const wordLetterCounts = new Map<string, number>()
    this.word.forEach((letter) => {
      wordLetterCounts.set(letter, (wordLetterCounts.get(letter) || 0) + 1)
    })

    for (const letter of this.revealedYellowLetters) {
      const count = wordLetterCounts.get(letter) || 0
      if (count === 0) {
        return `Deve conter a letra ${letter}`
      }
    }

    return null
  }

  private getTodaySolution(): void {
    const solution = getWordOfTheDay()
    this.solution = solution
  }

  private getOccurrencesForEachLetter(solution: Array<string>): any {
    const occurrenceByLetterOnSolution: any = {}
    const hitsByLetterOnTry: any = {}

    solution.forEach((letter) => {
      if (!occurrenceByLetterOnSolution[letter])
        occurrenceByLetterOnSolution[letter] = 1
      else occurrenceByLetterOnSolution[letter]++
    })

    this.word.forEach((letter) => {
      if (solution.includes(letter)) {
        if (!hitsByLetterOnTry[letter]) hitsByLetterOnTry[letter] = 1
        else hitsByLetterOnTry[letter]++
      }
    })

    return { occurrenceByLetterOnSolution, hitsByLetterOnTry }
  }

  public checkResult(): void {
    if (this.word.length !== 5) {
      this.notEnoughChars()
      return
    }
    if (!isValidWord(this.word.join(''))) {
      this.noValidWord()
      return
    }

    const hardModeError = this.validateHardMode()
    if (hardModeError) {
      this.hardModeViolation(hardModeError)
      return
    }

    const normalizedSolution = this.solution
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
    const splitSolution: Array<string> = normalizedSolution
      .toUpperCase()
      .split('')

    const currentTry: Try = {
      word: this.word,
      result: [],
      hitsByLetter: {},
    }

    const remainingFrequency: any = {}
    splitSolution.forEach((letter) => {
      remainingFrequency[letter] = (remainingFrequency[letter] || 0) + 1
    })

    this.word.forEach((letter, index) => {
      if (letter === splitSolution[index]) {
        currentTry.result[index] = 'correct'
        remainingFrequency[letter]--
      }
    })

    this.word.forEach((letter, index) => {
      if (currentTry.result[index] === 'correct') {
        this.correct(letter)
        if (this.hardMode) {
          if (!this.revealedLetters.has(letter)) {
            this.revealedLetters.set(letter, new Set())
          }
          this.revealedLetters.get(letter)!.add(index)
        }
      } else if (remainingFrequency[letter] && remainingFrequency[letter] > 0) {
        currentTry.result[index] = 'wrong-position'
        remainingFrequency[letter]--
        this.wrongPosition(letter)
        if (this.hardMode) {
          this.revealedYellowLetters.add(letter)
        }
      } else {
        currentTry.result[index] = 'wrong'
        this.wrong(letter)
      }
    })

    this.isCorrect = currentTry.result.every((res) => res === 'correct')
    this.tries.push(currentTry)
    this.clearCurrentTry()

    setTimeout(() => {
      this.tileAnimationComplete()
    }, 1500)

    if (!this.isCorrect) this.remainingChances--
    else {
      setTimeout(() => {
        this.endGame(this.tries)
      }, 1500)
    }
  }
}
</script>

<template>
  <section class="result">
    <div class="result__board">
      <template v-for="(wordTried, tIndex) in tries">
        <div
          v-for="(letter, letterIndex) in wordTried.word"
          :key="`try-${letter}-${tIndex}-${letterIndex}`"
          class="result__board-letter result__board-letter--flip"
          :style="{ animationDelay: `${letterIndex * 250}ms` }"
          :class="{
            'result__board-letter--correct':
              wordTried.result[letterIndex] === 'correct',
            'result__board-letter--wrong-position':
              wordTried.result[letterIndex] === 'wrong-position',
            'result__board-letter--wrong':
              wordTried.result[letterIndex] === 'wrong',
          }"
        >
          {{ letter }}
        </div>
      </template>

      <template v-if="!isCorrect && remainingChances > -1">
        <div
          v-for="tryPosition in 5"
          :key="`current-try-${tryPosition}`"
          class="result__board-letter"
          :class="{
            'result__board-letter--empty': !word[tryPosition - 1],
            'result__board-letter--selected': editorIndex === tryPosition - 1,
          }"
          @click="goToIndex(tryPosition - 1)"
        >
          {{ word[tryPosition - 1] }}
        </div>
      </template>

      <template v-if="remainingChances > -1">
        <template v-for="(chances, cIndex) in remainingChances">
          <div
            v-for="tryPosition in 5"
            :key="`blocked-${tryPosition}-${cIndex}`"
            class="result__board-letter result__board-letter--blocked"
          />
        </template>
      </template>
    </div>
  </section>
</template>

<style scoped lang="scss">
.result {
  width: var(--result-board-width);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &__board {
    display: grid;
    gap: var(--char-gap) var(--char-gap);
    grid-template-columns: repeat(5, 1fr);
    color: white;
    font-size: var(--char-font) / 0.1;
  }

  &__board-letter {
    display: flex;
    justify-content: center;
    align-items: center;
    aspect-ratio: 1;
    background-color: #615458;
    border-radius: 4px;
    font-size: var(--char-font);
    text-transform: uppercase;
    border: 0.125em solid #4c4347;
    transition: all 0.1s ease;

    &--empty {
      background-color: transparent;
    }

    &--blocked {
      background-color: #4c4347;
    }

    &--wrong-position {
      background-color: #d3ad69;
    }

    &--correct {
      background-color: #3aa394;
    }

    &--wrong {
      background-color: #333;
    }

    &--selected {
      border-bottom: 0.325em solid #4c4347;
    }

    &--flip {
      animation: flip 500ms ease-in-out;
      animation-fill-mode: backwards;
    }
  }
}

@keyframes flip {
  0% {
    transform: rotateX(0);
  }
  50% {
    transform: rotateX(90deg);
  }
  100% {
    transform: rotateX(0);
  }
}
</style>
