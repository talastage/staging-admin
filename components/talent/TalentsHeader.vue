<template>
  <div class="talents-header pa-4 mb-6">
    <v-row align="center" justify="space-between" class="mb-4">
      <v-col cols="12" md="3">
        <h1 class="text-h4 font-weight-bold">Talents</h1>
      </v-col>
      <v-col cols="12" md="9">
        <v-row dense align="center">
          <v-col cols="12" sm="4">
            <v-select
              v-model="localFilters.talent_category_id"
              :items="talentCategories"
              item-title="name"
              item-value="id"
              label="Filter by Talent Category"
              density="comfortable"
              variant="outlined"
              hide-details
              class="mb-2 mb-sm-0"
              clearable
              @update:model-value="emitFilters"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4">
            <CountryFilter
              v-model="localFilters.country_id"
              hide-details
              class="mb-2 mb-sm-0"
              clearable
              @update:model-value="emitFilters"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="localFilters.search"
              label="Search talents"
              density="comfortable"
              variant="outlined"
              hide-details
              class="mb-2 mb-sm-0"
              clearable
              @keyup.enter="emitFilters"
              @click:clear="emitFilters"
            >
              <template #append-inner>
                <v-btn icon variant="text" size="small" @click="emitFilters">
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
  talentCategories: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update-filters"]);

const localFilters = ref({ ...props.filters });

watch(
  () => props.filters,
  (newFilters) => {
    localFilters.value = { ...newFilters };
  },
  { deep: true }
);

const emitFilters = () => {
  emit("update-filters", { ...localFilters.value });
};
</script>
