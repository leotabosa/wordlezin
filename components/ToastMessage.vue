<script>
import { Component, Vue } from 'vue-property-decorator'
import { mapGetters, mapActions } from 'vuex'

@Component({
  computed: {
    ...mapGetters(['toast']),
  },
  methods: {
    ...mapActions(['removeToast']),
  },
})
export default class ToastMessage extends Vue {}
</script>

<template>
  <transition
    name="toast-message"
    enter-class="toast-enter"
    leave-active-class="toast-leave-active"
  >
    <div
      v-if="Object.keys(toast).length"
      :key="'toast-message'"
      class="toast-message"
      :class="{ 'toast-message--success': toast.type === 'success' }"
    >
      <div class="toast-message__text">
        {{ toast.message }}
      </div>

      <div class="toast-message__close-icon" @click="removeToast">X</div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.toast-enter {
  opacity: 0;
}
.toast-leave-active {
  opacity: 0;
}

.toast-message {
  display: flex;
  position: absolute;
  width: auto;
  right: 15px;
  top: 30px;
  height: auto;
  padding: 8px;
  color: #d65a5a;
  background-color: #f7d5d5;
  border-radius: 10px;
  transition: opacity 0.15s ease-in-out;
  font-size: min(4em, var(--keyboard-height) / 10);

  &__text {
    width: calc(100% - 24px);
    padding-right: 1em;
  }

  &__close-icon {
    display: flex;
    justify-content: center;
    cursor: pointer;

    flex: 1;
    width: 24px;
    height: 24px;
  }

  &--success {
    background-color: #b9f6ca;
    color: #007e33;
  }
}
</style>
