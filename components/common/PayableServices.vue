<template>
    <div>
        <ListItemSelectable :Items="payableServices" :moreList="moreList" title="Pay" subtitle="Pay with your wallet"
            @selected-service="showDialog" />

        <!-- Dialog -->
        <v-dialog v-model="showDialogValue" max-width="500px">
            <v-card>
                <v-card-text>
                    <FindItem :selected-service="selectedService" />
                </v-card-text>
                <v-card-actions>
                    <v-btn text @click="showDialogValue = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
    wallet: {
        type: Object,
        default: null
    }
});

const payableServices = ref([
    {
        icon: 'mdi-ticket',
        title: 'Ticket',
        subtitle: 'Pay show tickets',
    },
    {
        icon: 'mdi-hammer-screwdriver',
        title: 'Project',
        subtitle: 'Activate a project',
    },
    {
        icon: 'mdi-hand-heart',
        title: 'Tipping',
        subtitle: 'Tip your friends',
    },
    
]);

const moreList = ref([
    {
        title: 'Refresh',
        value: 'refresh',
    },
    {
        title: 'Download',
        value: 'download',
    },
    {
        title: 'View All',
        value: 'View All',
    },
]);

const selectedService = ref(null);
const showDialogValue = ref(false);

const showDialog = (serviceTitle) => {
    selectedService.value = serviceTitle;
    showDialogValue.value = true;
};

</script>
