<template>
  <div>
    <v-btn @click="goToEdit" color="primary"> Edit </v-btn>
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

function goToEdit() {
  const routePath = `/shows/edit/${props.item.id}`;
  router.push(routePath);
}
</script>
