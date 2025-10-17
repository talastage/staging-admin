<template>
    <div>
        <!-- Display this section when we have an item -->
        <v-row v-if="item" justify="center" align="center" class="mb-3">
            <v-col cols="12" md="6" lg="4">
                <!-- <TicketCardFound v-if="item.itemType === 'ticket'" :data="item" />
                <ProjectCardFound v-else-if="item.itemType === 'project'" :data="item" />
                <EventCardFound v-else-if="item.itemType === 'event'" :data="item" /> -->

                <ProjectCardFound :item="item.project" />
            </v-col>
            <v-col cols="12" md="12" lg="12">
                <PayWithWalletSelect />
            </v-col>
            <PaymentGatewaySelect />
        </v-row>

        <!-- Display this section when we don't have an item -->
        <div v-else>
            <h3 class="mb-5">Enter the {{ props.selectedService }} code</h3>
            <v-card>
                <v-form @submit.prevent="fetchItem">
                    <v-otp-input v-model="itemCode" :length="10" :blocks="10" :block-type="'text'"
                        hint="Enter the 10-character item code." @update:modelValue="handleInputUpdate">
                    </v-otp-input>

                    <!-- Loading spinner -->
                    <v-progress-circular v-if="loading" indeterminate></v-progress-circular>

                    <!-- Display a message if the item is not found -->
                    <v-alert v-if="notFound" type="error">{{ notFoundMessage }}</v-alert>
                </v-form>
            </v-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps } from "vue";
const { $axios } = useNuxtApp();

const props = defineProps({
    selectedService: {
        type: String,
        default: ""
    }
});

const itemCode = ref("");
const loading = ref(false);
const item = ref(null);
const notFound = ref(false);
const notFoundMessage = ref("Item not found.");

const handleInputUpdate = () => {
    if (itemCode.value.length === 10) {
        fetchItem();
    }
};

const fetchItem = async () => {
    loading.value = true;

    try {
        const response = await $axios.get(`/api/find/item/${itemCode.value}`);
        if (response.data) {
            item.value = response.data;
            notFound.value = false;
        } else {
            notFound.value = true;
            item.value = null;
            notFoundMessage.value = `${item.value?.itemType.charAt(0).toUpperCase() +
                item.value?.itemType.slice(1)
                } not found.`;
        }
    } catch (error) {
        console.error("Error fetching the item:", error);
        notFound.value = true;
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
/* ... rest of your styles ... */
</style>
