<template>
  <span
    :class="[
      'count-stat',
      {
        'count-stat--dark': isDarkMode,
        'count-stat--highlighted': isHighlighted,
      },
    ]"
  >
    {{ formattedCount }} {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { formatNumber } from "@/utils/numberFormatUtils";

const props = defineProps({
  count: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    default: "Total Count",
  },
  isDarkMode: {
    type: Boolean,
    default: false,
  },
  isHighlighted: {
    type: Boolean,
    default: false,
  },
});

const formattedCount = computed(() => {
  return props.count != null ? formatNumber(props.count) : "N/A";
});
</script>

<style scoped>
.count-stat {
  font-size: 14px;
  color: #606060;
  margin-right: 16px;
}

.count-stat--dark {
  color: #b0b0b0; /* Light grey for dark mode */
}
</style>
