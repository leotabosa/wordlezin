<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ErrorMessage',
  computed: {
    ...mapGetters(['error']),
  },
  methods: {
    ...mapActions(['removeError']),
  },
}
</script>

<template>
  <transition
    name="error-message"
    enter-class="error-enter"
    leave-active-class="error-leave-active"
  >
    <div
      v-if="Object.keys(error).length"
      :key="'error-message'"
      class="error-message"
    >
      <div class="error-message__text">
        {{ error.message }}
      </div>

      <div class="error-message__close-icon" @click="removeError">X</div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.error-enter {
  opacity: 0;
}
.error-leave-active {
  opacity: 0;
}

.error-message {
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
}
</style>
