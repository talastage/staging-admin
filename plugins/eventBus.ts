import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  const listeners = new Map();

  const bus = {
    on(event: string, callback: Function) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event).add(callback);
      return () => {
        listeners.get(event).delete(callback);
        if (listeners.get(event).size === 0) {
          listeners.delete(event);
        }
      };
    },
    emit(event: string, ...args: any[]) {
      if (listeners.has(event)) {
        listeners.get(event).forEach((callback: Function) => callback(...args));
      }
    },
    off(event: string, callback: Function) {
      if (listeners.has(event)) {
        listeners.get(event).delete(callback);
        if (listeners.get(event).size === 0) {
          listeners.delete(event);
        }
      }
    }
  };

  nuxtApp.provide('bus', bus);
});