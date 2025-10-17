// plugins/vue-toastification.client.ts
// Client-only plugin - renamed to .client.ts to prevent SSR execution
import { defineNuxtPlugin } from "#app";
import Toast from "vue-toastification";
// Importing the CSS directly in the plugin
import "vue-toastification/dist/index.css";

export default defineNuxtPlugin((nuxtApp) => {
  // Use string value for position instead of POSITION constant to avoid CommonJS issues
  const options = {
    position: "top-right" as const,
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 80,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false,
  };

  nuxtApp.vueApp.use(Toast, options);
});