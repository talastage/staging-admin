<!-- BaseBreadcrumb.vue -->
<template>
  <BaseCard elevation="10" class="mb-8">
    <div class="px-8 py-8">
      <div class="d-flex justify-space-between">
        <div class="d-flex py-0 align-center">
          <div>
            <h3 class="text-h3 mb-2">{{ title }}</h3>
            <v-breadcrumbs
              :items="breadcrumbs"
              class="text-h6 font-weight-medium pa-0 ml-n1"
            >
              <template v-slot:divider>
                <div class="d-flex align-center text-h3 mt-n4">.</div>
              </template>
              <template v-slot:title="{ item }">
                <h6 class="text-medium-emphasis text-subtitle-1">
                  {{ item.title }}
                </h6>
              </template>
            </v-breadcrumbs>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  breadcrumbs: {
    type: Array,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss">
.page-breadcrumb {
  .v-toolbar {
    background: transparent;
  }
}
</style>
