<template>
  <component
    :is="titleTag"
    :class="[titleClass, 'font-weight-bold', 'text-truncate']"
    :title="title"
  >
    {{ formattedTitle }}
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTextFormatter } from "@/composables/useTextFormatter";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  maxLength: {
    type: Number,
    default: 100,
  },
  size: {
    type: String,
    default: "medium",
    validator: (value: string) => ["small", "medium", "large"].includes(value),
  },
});

const { formatText } = useTextFormatter();

const formattedTitle = computed(() => {
  const formatted = formatText(props.title);
  if (formatted.length > props.maxLength) {
    return formatted.substring(0, props.maxLength) + "...";
  }
  return formatted;
});

const titleClass = computed(() => {
  switch (props.size) {
    case "small":
      return "text-subtitle-1";
    case "large":
      return "text-h4";
    default:
      return "text-h5";
  }
});

const titleTag = computed(() => {
  switch (props.size) {
    case "small":
      return "h3";
    case "large":
      return "h1";
    default:
      return "h2";
  }
});
</script>
