<template>
  <transition name="fade">
    <div v-if="show" class="alert" :class="`alert-${type}`" role="alert">
      <div class="alert-content">
        <v-icon :color="iconColor" class="mr-2">{{ icon }}</v-icon>
        <span>{{ message }}</span>
      </div>
      <v-btn icon small @click="dismiss" class="close-btn">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  message: String,
  type: {
    type: String,
    default: "info",
  },
  visible: {
    type: Boolean,
    default: false,
  },
  dismissTime: {
    type: Number,
    default: 5000,
  },
});

const show = ref(props.visible);

const icon = computed(() => {
  switch (props.type) {
    case 'success': return 'mdi-check-circle';
    case 'warning': return 'mdi-alert';
    case 'error': return 'mdi-alert-circle';
    default: return 'mdi-information';
  }
});

const iconColor = computed(() => {
  switch (props.type) {
    case 'success': return 'green';
    case 'warning': return 'orange';
    case 'error': return 'red';
    default: return 'blue';
  }
});

watch(() => props.visible, (newVal) => {
  show.value = newVal;
  if (newVal && props.dismissTime) {
    setTimeout(() => {
      show.value = false;
    }, props.dismissTime);
  }
});

const dismiss = () => {
  show.value = false;
};
</script>

<style scoped>
.alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.alert-content {
  display: flex;
  align-items: center;
}

.close-btn {
  margin-left: 16px;
}

.alert-info {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.alert-success {
  background-color: #e8f5e9;
  color: #1b5e20;
}

.alert-warning {
  background-color: #fff3e0;
  color: #e65100;
}

.alert-error {
  background-color: #ffebee;
  color: #b71c1c;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>