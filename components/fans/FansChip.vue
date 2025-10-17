<!-- FansChip.vue -->
<template>
  <NuxtLink :to="`/${user.username}/followers`" class="text-decoration-none">
    <div class="social-stat-chip" :class="sizeClass">
      <span class="stat-label">Followers</span>
      <span class="stat-count">{{ fansCount }}</span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useUserFansStore } from '@/stores/useUserFansStore'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    default: 'default',
    validator: (value: string) => ['small', 'default'].includes(value)
  }
})

const sizeClass = computed(() => ({
  'stat-chip--small': props.size === 'small',
  'stat-chip--default': props.size === 'default'
}))

const userFansStore = useUserFansStore()
const fansCount = ref(0)

const fetchFansCount = async () => {
  try {
    const response = await userFansStore.fetchFansCount(props.user.username)
    fansCount.value = response
  } catch (error) {
    console.error('Error fetching fans count:', error)
  }
}

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      fetchFansCount()
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.social-stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);

  &:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  .stat-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.7);
  }

  .stat-count {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(0, 0, 0, 0.9);
  }

  &.stat-chip--small {
    padding: 2px 6px;
    gap: 3px;
    
    .stat-label, .stat-count {
      font-size: 0.6875rem;
    }
  }

  &.stat-chip--default {
    padding: 6px 12px;
    gap: 6px;
    
    .stat-label, .stat-count {
      font-size: 0.875rem;
    }
  }
}
</style>
