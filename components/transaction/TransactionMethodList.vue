<template>
    <v-list dense>
        <TransactionMethodItem v-for="method in methods" :key="method.id" :method="method" @select="selectMethod" />
    </v-list>
</template>

<script setup lang="ts">

const props = defineProps({
    methods: Array
});

const emits = defineEmits(['select-method']);

const selectMethod = (method) => {
    emits('select-method', method);
};
</script>