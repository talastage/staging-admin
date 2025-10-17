<script setup>
import Icon from "../Icon.vue";
import VerticalSidebarNavCollapse from '@/components/vertical-sidebar/NavCollapse';
import VerticalSidebarNavItem from '@/components/vertical-sidebar/NavItem';
const props = defineProps({ item: Object, level: Number });
</script>

<template>
  <!-- ---------------------------------------------- -->
  <!---Item Childern -->
  <!-- ---------------------------------------------- -->
  <v-list-group no-action>
    <!-- ---------------------------------------------- -->
    <!---Dropdown  -->
    <!-- ---------------------------------------------- -->
    <template v-slot:activator="{ props }">
      <v-list-item v-bind="props" :value="item.title" rounded class="mb-1" color="primary">
        <!---Icon  -->
        <template v-slot:prepend>
          <Icon :item="item.icon" :level="level" />
        </template>
        <!---Title  -->
        <v-list-item-title class="mr-auto">{{ $t(item.title) }}</v-list-item-title>
        <!---If Caption-->
        <v-list-item-subtitle v-if="item.subCaption" class="text-caption mt-n1 hide-menu">
          {{ item.subCaption }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
    <!-- ---------------------------------------------- -->
    <!---Sub Item-->
    <!-- ---------------------------------------------- -->

    <template v-for="(subitem, i) in item.children" :key="i" v-if="item.children">
      <VerticalSidebarNavCollapse :item="subitem" v-if="subitem.children" :level="level + 1" />
      <VerticalSidebarNavItem :item="subitem" :level="level + 1" v-else></VerticalSidebarNavItem>
    </template>
  </v-list-group>

  <!-- ---------------------------------------------- -->
  <!---End Item Sub Header -->
  <!-- ---------------------------------------------- -->
</template>
