<template>
    <v-card elevation="10" class="mt-3">
        <v-card-actions class="mt-auto" elevation="10">
            <v-btn icon>
                <v-icon>mdi-thumb-up</v-icon>
                <span>Views: {{ likesCount }}</span>
            </v-btn>
            <v-spacer></v-spacer> <!-- This pushes the next button to the right -->
            <v-btn icon>
                <v-icon>mdi-eye</v-icon>
                <span>Likes: {{ viewsCount }}</span>
            </v-btn>
        </v-card-actions>
    </v-card>
</template>
  
<script setup lang="ts">
const props = defineProps({
    likesCount: {
        type: Number,
        required: true
    },
    viewsCount: {
        type: Number,
        required: true
    },
    projectId: {
        type: String,
        required: true
    }
});
</script>
  