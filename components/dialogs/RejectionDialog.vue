<template>
    <v-dialog v-model="dialog" max-width="500px">
        <template #activator="{ on, attrs }">
            <span v-bind="attrs" v-on="on"></span>
        </template>
        <v-card>
            <v-card-title>
                <span class="text-h5">Rejection Reason</span>
            </v-card-title>
            <v-card-text>
                <v-textarea v-model="message" label="Your Message" rows="4"></v-textarea>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
                <v-btn color="blue darken-1" text @click="sendRejection">Reject</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, defineExpose, defineProps, defineEmits } from 'vue';
const { $axios } = useNuxtApp();
const dialog = ref(false);
const message = ref('');
const props = defineProps({
    invitationId: {
        type: String,
        required: true,
    },
});

const openDialog = () => {
    dialog.value = true;
};

const emit = defineEmits();

const sendRejection = async () => {
    if (message.value) {
        try {
            const response = await $axios.post(`/api/events/invitations/${props.invitationId}/reject`, {
                message: message.value,
            });
            if (response.status === 200) {
                dialog.value = false;
                emit('rejected');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        console.log('Message is empty');
    }
};

defineExpose({ openDialog });
</script>
