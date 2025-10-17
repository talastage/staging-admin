
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide("capitalize", (value) => {
    if (!value) return "";
    return value.toString().charAt(0).toUpperCase() + value.slice(1);
  });
});
