<template>
  <div class="policies-container">
    <div class="policies-list">
      <NuxtLink
        v-for="policy in policies"
        :key="policy.id"
        :to="`/policies/${policy.slug}`"
        class="policy-item"
      >
        {{ policy.name }}
      </NuxtLink>
    </div>
    <div class="copyright">
      © {{ talastageApp?.name || "Talastage" }} {{ currentYear }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { usePoliciesStore } from "@/stores/usePoliciesStore";
import { useAppsStore } from "@/stores/useApps";
import { storeToRefs } from "pinia";

const policiesStore = usePoliciesStore();
const appsStore = useAppsStore();
const { policies } = storeToRefs(policiesStore);
const { talastageApp } = storeToRefs(appsStore);

const currentYear = computed(() => new Date().getFullYear());

onMounted(async () => {
  if (policies.value.length === 0) {
    await policiesStore.fetchPolicies();
  }
  if (!talastageApp.value) {
    await appsStore.fetchTalaStageApp();
  }
});
</script>

<style scoped>
.policies-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.policies-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
}

.policy-item {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  text-decoration: none;
  position: relative;
  transition: color 0.3s ease;
}

.policy-item::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: rgba(0, 0, 0, 0.6);
  transform: scaleX(0);
  transition: transform 0.3s ease-in-out;
}

.policy-item:hover {
  color: rgba(0, 0, 0, 0.8);
}

.policy-item:hover::after {
  transform: scaleX(1);
}

.copyright {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin-top: 16px;
}

@media (max-width: 600px) {
  .policies-list {
    gap: 10px;
  }

  .policy-item,
  .copyright {
    font-size: 12px;
  }
}
</style>
