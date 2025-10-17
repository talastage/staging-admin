<template>
    <v-list-item @click="selectItem">
        <v-list-item-content>
            <v-list-item-title>{{ method.name }}</v-list-item-title>
        </v-list-item-content>
    </v-list-item>
</template>

<script setup lang="ts">

const props = defineProps({
    method: Object
});

const emits = defineEmits(['select']);

const selectItem = () => {
    emits('select', props.method);
};
</script>