<template>
  <v-card class="pa-3 d-flex align-center">
    <UserAvatar :user="tipper" size="medium" class="mr-3" />
    <v-card-text class="pa-0 w-100">
      <div class="d-flex justify-space-between align-center">
        <div>
          <h3 class="headline mb-1">
            {{ tipper.first_name }} {{ tipper.last_name }}
          </h3>
          <p class="subtitle-2">{{ message }}</p>
        </div>
        <div class="text-right">
          <h3 class="headline mb-1">
            <Amount :amount="amount" :currency="currency" />
          </h3>
        </div>
      </div>
      <div class="d-flex justify-space-between align-center">
        <p class="subtitle-2">{{ formattedDate }}</p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { useDateFormatter } from "@/composables/useDateFormatter";

const props = defineProps({
  tipper: {
    type: Object,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  created_at: {
    type: String,
    required: true,
  },
  currency: {
    type: Object,
    required: true,
  },
  message: {
    type: String,
    default: "",
  },
});

const { formatDate } = useDateFormatter();

const formattedDate = computed(() => formatDate(props.created_at));
</script>

<style scoped>
.headline {
  font-size: 1rem;
  font-weight: bold;
}

.subtitle-2 {
  font-size: 0.875rem;
  color: gray;
}

.text-right {
  text-align: right;
}
</style>
