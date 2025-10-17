<template>
  <v-btn @click="goToProfile" color="primary">Profile</v-btn>
</template>

<script setup>
import { computed } from "vue";
const router = useRouter();
const props = defineProps({
  performer: {
    type: Object,
    required: true,
  },
});

const profileUrl = computed(() => {
  const firstName = props.performer.first_name;
  const lastName = props.performer.last_name;
  const performerId = props.performer.id;

  if (firstName && lastName) {
    const urlFirstName = firstName.replace(" ", "-").toLowerCase();
    const urlLastName = lastName.replace(" ", "-").toLowerCase();
    return `/${urlFirstName}-${urlLastName}`;
  }
  return `/${performerId}`;
});

const goToProfile = () => {
  router.push(profileUrl.value);
};
</script>
