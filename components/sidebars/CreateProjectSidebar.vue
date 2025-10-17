<script setup lang="ts">
import { shallowRef } from "vue";
import { useCustomizerStore } from "@/stores/customizer";
import sidebarMenu from "@/components/navigation/menu/sidebar/create-project-tips";

import VerticalSidebarNavGroup from '@/components/vertical-sidebar/NavGroup';
import VerticalSidebarNavCollapse from '@/components/vertical-sidebar/NavCollapse';
import VerticalSidebarNavItem from '@/components/vertical-sidebar/NavItem';

const customizer = useCustomizerStore();
</script>

<template>
  <v-navigation-drawer left v-model="customizer.Sidebar_drawer" elevation="0" rail-width="75" mobile-breakpoint="960"
    app class="leftSidebar" :rail="customizer.mini_sidebar" expand-on-hover width="270">

    <v-locale-provider>
      <div class="pa-5">
        <Logo />
      </div>
    </v-locale-provider>

    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <perfect-scrollbar class="scrollnavbar">
      <v-list class="pa-6" density="compact">
        <!---Menu Loop -->
        <template v-for="(item, i) in sidebarMenu">
          <!---Item Sub Header -->
          <VerticalSidebarNavGroup :item="item" v-if="item.header" :key="item.title" />
          <!---If Has Child -->
          <VerticalSidebarNavCollapse class="leftPadding" :item="item" :level="0" v-else-if="item.children" />
          <!---Single Item-->
          <VerticalSidebarNavItem :item="item" v-else class="leftPadding" />
          <!---End Single Item-->
        </template>
      </v-list>
      <div class="pa-6 userbottom">
        <UserProfile />
      </div>
    </perfect-scrollbar>
  </v-navigation-drawer>
</template>
