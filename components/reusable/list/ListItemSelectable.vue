<template>
  <VCard :title="props.title" :subtitle="props.subtitle">
    <template #append>
      <div class="mt-n4 me-n2">
        <MoreBtn :menu-list="props.moreList" />
      </div>
    </template>

    <VCardText>
      <VList class="card-list">
        <VListItem 
            v-for="service in props.Items" 
            :key="service.title" 
            @click="selectItem(service)"
            class="selectable-item" 
            :class="{ 'item-selected': selected && service === selected.value }"
        >
          <template #prepend>
            <v-icon>{{ service.icon }}</v-icon>
          </template>
          <VListItemTitle class="font-weight-medium">
            {{ service.title }}
          </VListItemTitle>
          <VListItemSubtitle class="text-disabled">
            {{ service.subtitle }}
          </VListItemSubtitle>
          <template #append>
            <!-- Scoped slot for custom action -->
            <slot name="action-content" :service="service"></slot>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  Items: {
    type: Array,
    required: true,
  },
  moreList: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
});

const selected = ref(null);
const emit = defineEmits(['selected-service']);

const selectItem = (service) => {
  emit('selected-service', service.title);
};

</script>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 19px;
}

.selectable-item:hover {
  background-color: #f5f5f5;
}

.item-selected {
  background-color: #e5e5e5;
}
</style>
