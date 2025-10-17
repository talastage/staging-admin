<template>
    <div>
        <UsersList :users="watchingUsers" title="Watching Now" />
    </div>
</template>

<script setup>

const props = defineProps({
    accessUuid: String
});
const watchingUsers = ref([]);
const { $axios } = useNuxtApp();

const fetchWatchingUsers = async () => {
    try {
        const response = await $axios.get(`/api/project/${props.accessUuid}/watching`);
        watchingUsers.value = response.data.watching;
    } catch (error) {
        console.error('Error fetching watching users:', error);
    }
};

onMounted(fetchWatchingUsers);
</script>
