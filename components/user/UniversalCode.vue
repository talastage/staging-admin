<template>
  <div class="universal-code-component">
    <BaseDialog v-model="dialog" title="Universal Code" max-width="400px">
      <v-card-text>
        <p>
          Your Universal Code is associated with all your assets in our app,
          including your wallet. It's used as a unique identifier for you and
          your wallet.
        </p>
        <v-text-field
          :value="universalCode"
          label="Universal Code"
          readonly
          append-icon="mdi-content-copy"
          @click:append="copyToClipboard"
        ></v-text-field>
      </v-card-text>
      <template #actions>
        <v-btn color="primary" @click="dialog = false" class="primary-btn">
          Close
        </v-btn>
      </template>
    </BaseDialog>

    <v-btn @click="dialog = true" color="primary" class="primary-btn">
      View Universal Code
    </v-btn>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "vue-toastification";

const props = defineProps({
  universalCode: {
    type: String,
    required: true,
  },
});

const dialog = ref(false);
const toast = useToast();

const copyToClipboard = () => {
  navigator.clipboard
    .writeText(props.universalCode)
    .then(() => {
      toast.success("Universal Code copied to clipboard!", {
        timeout: 2000,
        position: "top-right",
      });
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy Universal Code", {
        timeout: 2000,
        position: "top-right",
      });
    });
};
</script>

<style scoped>
.primary-btn {
  color: white;
  background-color: rgb(var(--v-theme-primary));
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
}
</style>
