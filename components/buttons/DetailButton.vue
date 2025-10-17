<template>
  <div>
    <v-btn @click="goToDetail" color="primary"> Details </v-btn>
  </div>
</template>

<script setup>
const router = useRouter();
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },  
});

function goToDetail() {
  const routePath = `/shows/${props.item.id}`;
  router.push(routePath);
}
</script>
