import { ref } from 'vue'

// Singleton instance to track notification service state
const isInitialized = ref(false)

/**
 * Service for managing user notifications for premieres
 */
export function useNotificationService() {
  // Initialize the service if not already done
  if (!isInitialized.value) {
    isInitialized.value = true
    console.log('Notification service initialized')
  }

  /**
   * Toggle notification status for a premiere
   * @param premiereId - ID of the premiere
   * @param isNotified - New notification status
   * @returns Promise that resolves when the operation is complete
   */
  const toggleNotification = async (premiereId: string, isNotified: boolean): Promise<void> => {
    try {
      // Make API call to update notification status
      // This is where you would make your actual API call
      console.log(`API call: Setting notification for ${premiereId} to ${isNotified}`)
      
      // Simulate network delay for demonstration purposes
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // If the API call fails, it will throw an error and be caught below
      console.log(`Successfully ${isNotified ? 'enabled' : 'disabled'} notifications for premiere ${premiereId}`)
    } catch (error) {
      console.error(`Failed to update notification for premiere ${premiereId}:`, error)
      throw error // Re-throw to allow handling by caller
    }
  }

  /**
   * Get notification status for a premiere
   * @param premiereId - ID of the premiere
   * @returns Promise that resolves with the notification status
   */
  const getNotificationStatus = async (premiereId: string): Promise<boolean> => {
    try {
      // Make API call to get notification status
      // This is where you would make your actual API call
      console.log(`API call: Getting notification status for ${premiereId}`)
      
      // Simulate network delay for demonstration purposes
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Return mock data for demonstration
      return Math.random() > 0.5 // Random status for demo
    } catch (error) {
      console.error(`Failed to get notification status for premiere ${premiereId}:`, error)
      throw error
    }
  }

  return {
    toggleNotification,
    getNotificationStatus
  }
}