<template>
  <v-list>
    <v-list-item
      v-for="method in methods"
      :key="method.id"
      @click="selectMethod(method)"
      style="cursor: pointer"
    >
      <v-list-item-avatar>
        <v-img :src="method.payment_method.logo_url" />
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title>{{ method.payment_method.name }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ method.gateway.name }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
const props = defineProps<{
  methods: any[]
}>()

const emit = defineEmits<{
  (e: 'select', method: any): void
}>()

function selectMethod(method: any) {
  emit('select', method)
}
</script>
