<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class GameResults extends Vue {
  @Prop({ default: 0, type: Number }) readonly attempts!: number
  @Prop({ default: '', type: String }) readonly word!: string
  @Prop({ default: false, type: Boolean }) readonly won!: boolean
  @Prop({ default: () => [], type: Array }) readonly tries!: Array<any>

  private shareToWhatsApp(): void {
    const message = this.getShareMessage()
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  private async shareToInstagram(): Promise<void> {
    try {
      const imageBlob = await this.generateGridImage()
      const file = new File([imageBlob], 'wordlezin.png', {
        type: 'image/png',
      })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Wordlezin',
          text: this.getShareMessage(),
        })
      } else {
        await this.copyImageToClipboard()
      }
    } catch (error) {
      await this.copyImageToClipboard()
    }
  }

  private async copyImageToClipboard(): Promise<void> {
    try {
      const imageBlob = await this.generateGridImage()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': imageBlob }),
      ])
      this.$emit('copy-success')
    } catch (error) {
      this.$emit('copy-error')
    }
  }

  private async generateGridImage(): Promise<Blob> {
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 600
    const ctx = canvas.getContext('2d')

    if (!ctx) throw new Error('Canvas context not available')

    ctx.fillStyle = '#342e37'
    ctx.fillRect(0, 0, 600, 600)

    const tileSize = 80
    const gap = 10
    const padding = (600 - (tileSize * 5 + gap * 4)) / 2

    this.tries.forEach((tryItem: any, rowIndex: number) => {
      tryItem.result.forEach((result: string, colIndex: number) => {
        const x = padding + colIndex * (tileSize + gap)
        const y = padding + rowIndex * (tileSize + gap)

        if (result === 'correct') {
          ctx.fillStyle = '#3aa394'
        } else if (result === 'wrong-position') {
          ctx.fillStyle = '#d3ad69'
        } else {
          ctx.fillStyle = '#333'
        }

        ctx.fillRect(x, y, tileSize, tileSize)
      })
    })

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob)
      }, 'image/png')
    })
  }

  private getShareMessage(): string {
    const icons: any = {
      correct: '🟩',
      'wrong-position': '🟨',
      wrong: '⬛',
    }

    let shareMessage = `Wordlezin\n`
    shareMessage += `${this.attempts}/6\n\n`

    this.tries.forEach((t: any) => {
      let line = ''
      t.result.forEach((res: string) => (line += icons[res]))
      line += '\n'
      shareMessage += line
    })

    shareMessage += '\nwordlezin.vercel.app'
    return shareMessage
  }
}
</script>

<template>
  <div class="game-results">
    <div class="game-results__content">
      <h1 class="game-results__title">
        {{ won ? 'Parabéns!' : 'Que pena!' }}
      </h1>
      <p class="game-results__attempts">
        {{ won ? `Você acertou em ${attempts} tentativa${attempts > 1 ? 's' : ''}!` : 'Você não conseguiu adivinhar a palavra.' }}
      </p>
      <p class="game-results__word" :class="{ 'game-results__word--lost': !won }">
        A palavra era: <strong>{{ word.toUpperCase() }}</strong>
      </p>
      <p class="game-results__comeback">Volte amanhã para um novo desafio!</p>

      <div class="game-results__share">
        <button class="game-results__share-button" @click="shareToWhatsApp">
          WhatsApp
        </button>
        <button class="game-results__share-button" @click="shareToInstagram">
          Instagram
        </button>
        <button class="game-results__share-button" @click="copyImageToClipboard">
          Copiar Imagem
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.game-results {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #342e37;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;

  &__content {
    text-align: center;
    color: white;
    max-width: 500px;
  }

  &__title {
    font-size: 3em;
    margin-bottom: 0.5em;
    color: #3aa394;
  }

  &__attempts {
    font-size: 1.5em;
    margin-bottom: 1em;
  }

  &__word {
    font-size: 2em;
    margin-bottom: 1em;
    color: #3aa394;

    &--lost {
      color: #d65a5a;
    }

    strong {
      font-weight: bold;
    }
  }

  &__comeback {
    font-size: 1.2em;
    margin-bottom: 2em;
    color: #d3ad69;
  }

  &__share {
    display: flex;
    gap: 1em;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__share-button {
    padding: 0.8em 1.5em;
    font-size: 1em;
    background-color: #6e5c62;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #3aa394;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
