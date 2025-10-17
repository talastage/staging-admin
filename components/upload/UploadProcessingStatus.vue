<!-- components/upload/ProcessingStatus.vue -->
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: {
    text: string
    color: string
    icon: string
  }
  fileType: 'main' | 'trailer'
}

const props = defineProps<Props>()

const statusColor = computed(() => props.status.color)
const statusIcon = computed(() => props.status.icon)
const statusTitle = computed(() => 'Processing Status')
const statusMessage = computed(() => props.status.text)
const isProcessing = computed(() => props.status.text.includes('processing'))
</script>

<style scoped>
.processing-details {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
