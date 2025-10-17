// composables/useChat.ts
import { ref, computed } from "vue";
import type { ChatThread, ChatMessage } from "~/types/chat";

export function useChat() {
  const { $axios } = useNuxtApp();
  const threads = ref<ChatThread[]>([]);
  const currentThread = ref<ChatThread | null>(null);
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const sending = ref(false);

  const fetchThreads = async () => {
    loading.value = true;
    try {
      const response = await $axios.get("/api/chat/threads");
      threads.value = response.data;
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      loading.value = false;
    }
  };

  const fetchMessages = async (threadId: number) => {
    loading.value = true;
    try {
      const response = await $axios.get(
        `/api/chat/threads/${threadId}/messages`
      );
      messages.value = response.data;
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      loading.value = false;
    }
  };

  const sendMessage = async (
    threadId: number,
    content: string,
    attachments: File[] = []
  ) => {
    sending.value = true;
    try {
      const formData = new FormData();
      formData.append("content", content);
      attachments.forEach((file) => {
        formData.append("attachments[]", file);
      });

      const response = await $axios.post(
        `/api/chat/threads/${threadId}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      messages.value.push(response.data);
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    } finally {
      sending.value = false;
    }
  };

  const createThread = async (subject: string, message: string) => {
    sending.value = true;
    try {
      const response = await $axios.post("/api/chat/threads", {
        subject,
        message,
      });
      threads.value.unshift(response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating thread:", error);
      throw error;
    } finally {
      sending.value = false;
    }
  };

  return {
    threads,
    currentThread,
    messages,
    loading,
    sending,
    fetchThreads,
    fetchMessages,
    sendMessage,
    createThread,
  };
}
