<template>
  <v-dialog v-model="visibleInternal" max-width="600px">
    <v-card>
      <v-card-title class="text-h6">
        Talent Registered Successfully!
      </v-card-title>
      <v-card-text>
        <!-- Display the updated talent details -->
        <div class="mb-4">
          <UserTalentDisplay :user-talent="talentDetails" :compact="true" />
        </div>
        <p>
          Your new talent has been saved successfully. What would you like to do
          next?
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          variant="outlined"
          @click="goHome"
          prepend-icon="mdi-home"
        >
          Go Home
        </v-btn>
        <v-spacer />
        <v-btn
          color="success"
          variant="elevated"
          @click="startConnecting"
          prepend-icon="mdi-account-group"
        >
          Start Connecting
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  modelValue: Boolean,
  talentDetails: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['update:modelValue'])

const router = useRouter()

// Internal visibility for v-model binding
const visibleInternal = ref(props.modelValue)
watch(
  () => props.modelValue,
  (val) => {
    visibleInternal.value = val
  }
)
watch(visibleInternal, (val) => {
  emit('update:modelValue', val)
})

// Methods for buttons
function goHome() {
  visibleInternal.value = false
  router.push('/')
}

function startConnecting() {
  visibleInternal.value = false
  // Assuming talentDetails contains a "category" object with a slug.
  const slug = props.talentDetails?.category?.slug
  if (slug) {
    router.push(`/talents/${slug}`)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
/* Add any styles as needed */
</style>
