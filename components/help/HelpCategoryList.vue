<template>
    <div class="category-list">
        <v-row>
            <v-col cols="12" md="4" v-for="subCategory in categories" :key="subCategory.id">
                <HelpCategoryItem :category="subCategory" />
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    categories: Array
});
</script>