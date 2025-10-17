<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
// import { formatDistanceToNowStrict } from 'date-fns';
// import { last } from 'lodash';

interface User {
    id: number;
    display_name: string;
    email: string;
    phone: string;
    profile_photo: string;
}

const store = useAuthStore();
const users = ref<User[]>([]);

onMounted(async () => {
    const response = await store.fetchAllUsers(); // Assuming this returns the API response
    users.value = response.data; // Consume the correct part of the API response
});

const chatItem = users;

const searchValue = ref('');
const filteredChats = computed(() => {
    return chatItem.value.filter((chat) => {
        return chat.display_name.toLowerCase().includes(searchValue.value.toLowerCase());
    });
});

</script>

<template>
    <v-container>
        <v-row>
            <v-col cols="4">
                <v-card>
                    <div class="px-6 pt-3">
                        <v-text-field variant="outlined" v-model="searchValue" append-inner-icon="mdi-magnify"
                            placeholder="Search Contact" hide-details density="compact"></v-text-field>
                    </div>

                    <perfect-scrollbar class="lgScroll">
                        <v-list>
                            <!---Single Item-->
                            <v-list-item :value="chat.id" color="primary" class="text-no-wrap chatItem"
                                v-for="chat in filteredChats" :key="chat.id" lines="two">
                                <!---Avatar-->
                                <template v-slot:prepend>
                                    <v-avatar>
                                        <img src="/images/avatars/avatar-1.png" alt="pro" width="50" />
                                    </v-avatar>
                                    <!-- <v-badge class="badg-dot" dot :color="chat.status === 'away'
                        ? 'warning'
                        : chat.status === 'busy'
                            ? 'error'
                            : chat.status === 'online'
                                ? 'success'
                                : 'containerBg'
                        ">
                    </v-badge> -->
                                </template>
                                <!---Name-->
                                <v-list-item-title class="text-subtitle-1 textPrimary w-100 font-weight-semibold">{{
                                    chat.display_name
                                }}</v-list-item-title>
                                <!---Subtitle-->
                                <!-- <v-sheet v-if="chat.chatHistory.slice(-1)[0].type == 'img'">
                    <small class="textPrimary text-subtitle-2">Sent a Photo</small>
                </v-sheet>
                <div class="text-subtitle-2 textPrimary mt-1 text-truncate w-100" v-else>
                    {{ chat.chatHistory.slice(-1)[0].msg }}
                </div> -->
                                <!---Last seen--->
                                <template v-slot:append>
                                    <div class="d-flex flex-column text-right w-25">
                                        <!-- <small class="textPrimary text-subtitle-2">
                            {{
                                formatDistanceToNowStrict(new Date(lastActivity(chat)), {
                                    addSuffix: false
                                })
                            }}
                        </small> -->
                                    </div>
                                </template>
                            </v-list-item>
                        </v-list>
                    </perfect-scrollbar>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>
<style>
.chatItem {
    padding: 16px 24px !important;
    border-bottom: 1px solid rgb(var(--v-theme-inputBorder), 0.1);
}

.badg-dot {
    left: -17px;
    position: relative;
    bottom: -10px;
}

.lgScroll {
    height: 500px;
}
</style>
