<!-- components/ViewAllButton.vue -->
<template>
  <v-btn
    :color="color"
    variant="outlined"
    :height="height"
    :class="['view-all-button', customClass]"
    @click="handleNavigation"
  >
    <v-icon v-if="prependIcon" start>{{ prependIcon }}</v-icon>
    {{ label }}
  </v-btn>
</template>

<script setup lang="ts">
interface Props {
  route: string
  label?: string
  prependIcon?: string
  customClass?: string
  height?: number | string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'View All', // Default text
  prependIcon: '', // No icon by default
  customClass: '', // No extra class by default
  height: 32, // Smaller button height
  color: 'primary', // Default color is "primary"
})

const handleNavigation = () => {
  navigateTo(props.route)
}
</script>

<style scoped>
.view-all-button {
  text-transform: none !important;
  font-weight: 400 !important;
  letter-spacing: normal !important;
  border-radius: 8px !important;
  font-size: 12px !important;
  padding: 0 12px !important;
}
</style>
