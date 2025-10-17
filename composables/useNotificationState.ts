import { ref } from 'vue'

export function useNotificationState() {
  // Track pending notification requests
  const pendingRequests = ref<Record<string, boolean>>({})
  
  // Track any errors that occurred during notification updates
  const notificationErrors = ref<Record<string, Error>>({})
  
  /**
   * Updates notification state optimistically and handles the background save
   * @param id - Unique identifier for the notification (e.g., premiere ID)
   * @param currentState - Current notification state
   * @param saveCallback - Async function that saves the notification state to the server
   * @returns The new optimistic state
   */
  const toggleNotification = async (
    id: string,
    currentState: boolean,
    saveCallback: (newState: boolean) => Promise<void>
  ): Promise<boolean> => {
    // Calculate new state
    const newState = !currentState
    
    // Mark this request as pending
    pendingRequests.value[id] = true
    
    // Clear any previous errors
    if (notificationErrors.value[id]) {
      delete notificationErrors.value[id]
    }
    
    try {
      // Execute the save operation in the background
      await saveCallback(newState)
      return newState
    } catch (error) {
      // Store the error
      notificationErrors.value[id] = error as Error
      
      // Log the error
      console.error(`Failed to update notification for ${id}:`, error)
      
      // Return the original state since the operation failed
      return currentState
    } finally {
      // Clear the pending state
      delete pendingRequests.value[id]
    }
  }
  
  /**
   * Checks if a notification update is pending for a specific ID
   */
  const isUpdatePending = (id: string): boolean => {
    return !!pendingRequests.value[id]
  }
  
  /**
   * Gets any error that occurred during notification update
   */
  const getUpdateError = (id: string): Error | undefined => {
    return notificationErrors.value[id]
  }
  
  return {
    toggleNotification,
    isUpdatePending,
    getUpdateError,
    pendingRequests,
    notificationErrors
  }
}