<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class SettingsModal extends Vue {
  @Prop({ default: false, type: Boolean }) readonly show!: boolean
  @Prop({ default: false, type: Boolean }) readonly hardMode!: boolean
  @Prop({ default: false, type: Boolean }) readonly hardModeDisabled!: boolean

  private toggleHardMode(): void {
    if (!this.hardModeDisabled) {
      this.$emit('toggle-hard-mode')
    }
  }

  private close(): void {
    this.$emit('close')
  }
}
</script>

<template>
  <transition name="modal-fade">
    <div v-if="show" class="settings-modal" @click.self="close">
      <div class="settings-modal__content">
        <div class="settings-modal__header">
          <h2>Configurações</h2>
          <button class="settings-modal__close" @click="close">✕</button>
        </div>

        <div class="settings-modal__body">
          <div class="settings-modal__option">
            <div class="settings-modal__option-info">
              <h3>Modo Difícil</h3>
              <p>Qualquer pista revelada deve ser usada nas próximas tentativas</p>
              <p v-if="hardModeDisabled" class="settings-modal__warning">
                Só pode ser ativado antes da primeira tentativa
              </p>
            </div>
            <label class="settings-modal__toggle">
              <input
                type="checkbox"
                :checked="hardMode"
                :disabled="hardModeDisabled"
                @change="toggleHardMode"
              >
              <span class="settings-modal__slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="scss">
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}

.settings-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 20px;

  &__content {
    background-color: #342e37;
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #4c4347;

    h2 {
      color: white;
      font-size: 1.5em;
      margin: 0;
    }
  }

  &__close {
    background: none;
    border: none;
    color: white;
    font-size: 1.5em;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      opacity: 0.7;
    }
  }

  &__body {
    padding: 20px;
  }

  &__option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  &__option-info {
    flex: 1;

    h3 {
      color: white;
      font-size: 1.1em;
      margin: 0 0 8px 0;
    }

    p {
      color: #d3ad69;
      font-size: 0.9em;
      margin: 0;
      line-height: 1.4;
    }
  }

  &__warning {
    color: #d65a5a !important;
    margin-top: 8px !important;
    font-size: 0.85em !important;
  }

  &__toggle {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 28px;
    flex-shrink: 0;

    input {
      opacity: 0;
      width: 0;
      height: 0;

      &:checked + .settings-modal__slider {
        background-color: #3aa394;
      }

      &:checked + .settings-modal__slider:before {
        transform: translateX(22px);
      }

      &:disabled + .settings-modal__slider {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  &__slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #6e5c62;
    transition: 0.3s;
    border-radius: 28px;

    &:before {
      position: absolute;
      content: '';
      height: 20px;
      width: 20px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
}
</style>
