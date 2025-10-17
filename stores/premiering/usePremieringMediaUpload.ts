// stores\premiering\usePremieringMediaUpload.ts

import { defineStore } from 'pinia'
import { ref, computed, Ref } from 'vue'
import type {
  StudioProject,
  ProjectPremieringLog,
} from '~/types/studio-project'
import { usePusher } from '~/composables/usePusher'
import { useVaporUpload } from '~/composables/useVaporUpload'

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
  fileName: string | null
  fileSize: number
  uploadedSize: number
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed'
  manifestUrl: string | null
  fileUrl: string | null
  speed: number
  estimatedTimeRemaining: number
  startTime: number | null
}

interface CreateProjectPayload {
  name: string
  premiering_category_slug: string
  file_type: 'main' | 'trailer'
}

interface VideoProcessedEvent {
  project: StudioProject
  fileType: 'main' | 'trailer'
  manifestUrl: string | null
  message: string
  failCause: string | null
  timestamp: string
}

/**
 * Interface to type Axios error responses.
 */
interface AxiosErrorResponse {
  response?: {
    status?: number
    data?: {
      message?: string
      logs?: ProjectPremieringLog[]
    }
  }
  message?: string
}

/**
 * Helper to extract a clear error message from an Axios error response.
 * It first checks for a logs array (provided by the backend) and returns the first log's error_message.
 */
function extractErrorMessage(err: AxiosErrorResponse): string {
  const logs = err.response?.data?.logs
  if (logs && Array.isArray(logs) && logs.length > 0) {
    return logs[0].error_message || 'An error occurred'
  }
  return err.response?.data?.message || err.message || 'An error occurred'
}

export const usePremieringMediaUpload = defineStore(
  'premieringMediaUpload',
  () => {
    const { $axios } = useNuxtApp()
    const { subscribeTo, unsubscribeFrom } = usePusher()

    const project = ref<StudioProject | null>(null)

    // General error message for project creation or uploading
    const error = ref<string | null>(null)

    // If true, show a "Top Up" button in the UI
    const insufficientFunds = ref(false)

    // Loading indicator for createProject
    const isLoading = ref(false)

    // XHR controllers to allow aborting
    const mainUploadController = ref<{ xhr: XMLHttpRequest | null }>({
      xhr: null,
    })
    const trailerUploadController = ref<{ xhr: XMLHttpRequest | null }>({
      xhr: null,
    })

    // Main upload state
    const mainUpload = ref<UploadState>({
      isUploading: false,
      progress: 0,
      error: null,
      fileName: null,
      fileSize: 0,
      uploadedSize: 0,
      processingStatus: 'pending',
      manifestUrl: null,
      fileUrl: null,
      speed: 0,
      estimatedTimeRemaining: 0,
      startTime: null,
    })

    // Trailer upload state
    const trailerUpload = ref<UploadState>({
      isUploading: false,
      progress: 0,
      error: null,
      fileName: null,
      fileSize: 0,
      uploadedSize: 0,
      processingStatus: 'pending',
      manifestUrl: null,
      fileUrl: null,
      speed: 0,
      estimatedTimeRemaining: 0,
      startTime: null,
    })

    // Whether trailer can be uploaded (depends on main not having failed)
    const canUploadTrailer = computed(() => {
      return (
        project.value !== null && mainUpload.value.processingStatus !== 'failed'
      )
    })

    // Check if either file is currently uploading
    const isAnyUploadInProgress = computed(() => {
      return mainUpload.value.isUploading || trailerUpload.value.isUploading
    })

    /**
     * Attempt to create the project on the backend.
     * If wallet is inactive, currency mismatch, or insufficient funds,
     * the backend returns an error and we do NOT create a project.
     */
    async function createProject(payload: {
      name: string
      premiering_category_slug: string
      file_type: 'main' | 'trailer'
    }): Promise<void> {
      isLoading.value = true
      error.value = null
      insufficientFunds.value = false

      try {
        const { data } = await $axios.post(
          '/api/studio/projects/create',
          payload
        )
        if (data?.project) {
          project.value = data.project
          subscribeToProcessingUpdates()
        }
      } catch (err: any) {
        const status = err.response?.status
        const errorMsg = extractErrorMessage(err)
        if (
          status === 422 &&
          errorMsg.toLowerCase().includes('insufficient balance')
        ) {
          insufficientFunds.value = true
        }
        error.value = errorMsg
        throw err
      } finally {
        isLoading.value = false
      }
    }

    function updateProject(updated: Partial<StudioProject>) {
      if (!project.value) {
        project.value = updated as StudioProject
      } else {
        project.value = { ...project.value, ...updated }
      }

      // Then we do some logic for mainUpload/trailerUpload if project_url/trailer_url exist
      if (project.value.project_url) {
        mainUpload.value.processingStatus = 'completed'
        mainUpload.value.fileUrl = project.value.project_url
        mainUpload.value.manifestUrl = project.value.project_url
        mainUpload.value.progress = 100
      } else if (!mainUpload.value.isUploading) {
        mainUpload.value.processingStatus = 'pending'
      }

      if (project.value.trailer_url) {
        trailerUpload.value.processingStatus = 'completed'
        trailerUpload.value.fileUrl = project.value.trailer_url
        trailerUpload.value.manifestUrl = project.value.trailer_url
        trailerUpload.value.progress = 100
      } else if (!trailerUpload.value.isUploading) {
        trailerUpload.value.processingStatus = 'pending'
      }
    }

    function updateUploadStateFromProject(projectData: StudioProject) {
      // 1) Update the entire project
      updateProject(projectData)

      // 2) Update main/trailer file names, sizes, etc.
      if (projectData.main_meta && mainUpload.value.fileName === null) {
        mainUpload.value.fileName =
          projectData.name || projectData.main_meta.original_filename || null
        mainUpload.value.fileSize = projectData.main_meta.original_filesize || 0
        mainUpload.value.uploadedSize =
          projectData.main_meta.original_filesize || 0
      }

      if (projectData.trailer_meta && trailerUpload.value.fileName === null) {
        trailerUpload.value.fileName =
          projectData.trailer_meta.original_filename || null
        trailerUpload.value.fileSize =
          projectData.trailer_meta.original_filesize || 0
        trailerUpload.value.uploadedSize =
          projectData.trailer_meta.original_filesize || 0
      }

      // 3) Update processing status from logs if available
      if (projectData.logs && projectData.logs.length > 0) {
        // MAIN logs
        const mainLogs = projectData.logs.filter(
          (log) => log.file_type === 'main'
        )
        const latestMainLog =
          mainLogs.length > 0 ? mainLogs[mainLogs.length - 1] : null
        if (latestMainLog && !mainUpload.value.isUploading) {
          mainUpload.value.processingStatus =
            latestMainLog.processing_status as any

          // If the main log indicates failure, capture its error message in the store's error
          if (
            latestMainLog.processing_status === 'failed' &&
            latestMainLog.error_message
          ) {
            error.value = latestMainLog.error_message
          }
        }

        // TRAILER logs
        const trailerLogs = projectData.logs.filter(
          (log) => log.file_type === 'trailer'
        )
        const latestTrailerLog =
          trailerLogs.length > 0 ? trailerLogs[trailerLogs.length - 1] : null
        if (latestTrailerLog && !trailerUpload.value.isUploading) {
          trailerUpload.value.processingStatus =
            latestTrailerLog.processing_status as any

          // If the trailer log indicates failure, capture its error message in the store's error
          if (
            latestTrailerLog.processing_status === 'failed' &&
            latestTrailerLog.error_message
          ) {
            error.value = latestTrailerLog.error_message
          }
        }
      }

      // 4) Update main_upload_status
      if (projectData.main_upload_status) {
        if (projectData.main_upload_status === 'completed') {
          mainUpload.value.processingStatus = 'completed'
          mainUpload.value.progress = 100
          mainUpload.value.isUploading = false
        } else if (projectData.main_upload_status === 'failed') {
          mainUpload.value.processingStatus = 'failed'
          mainUpload.value.isUploading = false
        } else if (projectData.main_upload_status === 'processing') {
          mainUpload.value.processingStatus = 'processing'
          mainUpload.value.progress = 99
        }
      }

      // 5) Update trailer_upload_status
      if (projectData.trailer_upload_status) {
        if (projectData.trailer_upload_status === 'completed') {
          trailerUpload.value.processingStatus = 'completed'
          trailerUpload.value.progress = 100
          trailerUpload.value.isUploading = false
        } else if (projectData.trailer_upload_status === 'failed') {
          trailerUpload.value.processingStatus = 'failed'
          trailerUpload.value.isUploading = false
        } else if (projectData.trailer_upload_status === 'processing') {
          trailerUpload.value.processingStatus = 'processing'
          trailerUpload.value.progress = 99
        }
      }
    }

    /**
     * Upload file using Vapor-compatible pattern.
     * Uses useVaporUpload composable for proper S3 upload handling.
     */
    async function uploadFile(
      file: File,
      fileType: 'main' | 'trailer'
    ): Promise<void> {
      const uploadState = fileType === 'main' ? mainUpload : trailerUpload
      const controller =
        fileType === 'main' ? mainUploadController : trailerUploadController

      try {
        // Reset upload state
        uploadState.value.isUploading = true
        uploadState.value.fileName = file.name
        uploadState.value.fileSize = file.size
        uploadState.value.progress = 0
        uploadState.value.error = null
        uploadState.value.startTime = Date.now()
        uploadState.value.speed = 0
        uploadState.value.estimatedTimeRemaining = 0
        error.value = null

        // Import and use Vapor upload pattern
        const { uploadFile: vaporUpload } = useVaporUpload()
        
        await vaporUpload(
          file,
          `/api/studio/projects/${project.value?.access_uuid}/presigned-url`,
          `/api/studio/projects/${project.value?.access_uuid}/confirm-upload`,
          {
            fileType,
            onProgress: (progress: number) => {
              updateProgress(uploadState, (progress / 100) * file.size, file.size)
            },
            onSuccess: () => {
              uploadState.value.processingStatus = 'processing'
              uploadState.value.progress = 99
            },
            onError: (err: any) => {
              throw err
            }
          }
        )
      } catch (err: any) {
        const errorMsg = extractErrorMessage(err)
        uploadState.value.error = errorMsg
        uploadState.value.processingStatus = 'failed'
        uploadState.value.isUploading = false
        error.value = errorMsg
        throw new Error(errorMsg)
      } finally {
        controller.value.xhr = null
      }
    }

    /**
     * Cancel (abort) an in-progress upload, reset the state to show dropzone again.
     */
    function cancelUpload(type: 'main' | 'trailer') {
      const controller =
        type === 'main' ? mainUploadController : trailerUploadController
      const uploadState = type === 'main' ? mainUpload : trailerUpload

      // Make sure we abort any in-progress XHR request
      if (controller.value.xhr) {
        try {
          controller.value.xhr.abort()
        } catch (e) {
          console.error('Error aborting XHR:', e)
        }
      }
      
      // Clear the XHR reference
      controller.value.xhr = null

      // Fully reset the upload state so dropzone reappears
      uploadState.value = {
        isUploading: false,
        progress: 0,
        error: null,
        fileName: null,
        fileSize: 0,
        uploadedSize: 0,
        processingStatus: 'pending',
        manifestUrl: null,
        fileUrl: null,
        speed: 0,
        estimatedTimeRemaining: 0,
        startTime: null,
      }
    }

    /**
     * Update the progress, speed, and ETA while uploading.
     */
    function updateProgress(
      uploadState: Ref<UploadState>,
      loaded: number,
      total: number
    ) {
      const now = Date.now()
      if (!uploadState.value.startTime) {
        uploadState.value.startTime = now
      }
      const progress = Math.round((loaded / total) * 100)
      const elapsedSeconds = (now - uploadState.value.startTime) / 1000
      const speed = loaded / elapsedSeconds
      const remainingBytes = total - loaded
      const estimatedTimeRemaining = remainingBytes / speed

      uploadState.value.progress = progress
      uploadState.value.uploadedSize = loaded
      uploadState.value.speed = speed
      uploadState.value.estimatedTimeRemaining = estimatedTimeRemaining
    }

    // Subscribe to SSE/Pusher channel for transcoding updates
    let processingChannel: any = null
    let pollingInterval: any = null

    function subscribeToProcessingUpdates() {
      if (!project.value) return
      
      try {
        // Subscribe to project-specific channels for main and trailer
        const mainChannel = subscribeTo(`project.${project.value.id}.main`)
        const trailerChannel = subscribeTo(`project.${project.value.id}.trailer`)

        // Handle main video processing events
        if (mainChannel) {
          mainChannel.bind('VideoProcessed', (data: VideoProcessedEvent) => {
            console.log('Main VideoProcessed event received:', data)
            handleVideoProcessedEvent(data, 'main')
          })
        }

        // Handle trailer video processing events  
        if (trailerChannel) {
          trailerChannel.bind('VideoProcessed', (data: VideoProcessedEvent) => {
            console.log('Trailer VideoProcessed event received:', data)
            handleVideoProcessedEvent(data, 'trailer')
          })
        }
        
        // Start polling as fallback in case Pusher events fail
        startPollingFallback()
        
      } catch (subscriptionError) {
        console.error('Error subscribing to processing updates:', subscriptionError)
        error.value = 'Failed to setup processing notifications'
        // Start polling as fallback
        startPollingFallback()
      }
    }

    function handleVideoProcessedEvent(data: VideoProcessedEvent, expectedFileType: 'main' | 'trailer') {
      try {
        // Ensure this event is for our current project
        if (data.project.access_uuid !== project.value?.access_uuid) return
        
        // Ensure this event is for the expected file type
        if (data.fileType !== expectedFileType) return

        // Clear polling since we received the event
        if (pollingInterval) {
          clearInterval(pollingInterval)
          pollingInterval = null
        }

        // 1. Update the store's project object with all new fields (like project_url/trailer_url).
        updateUploadStateFromProject(data.project)

        // 2. Figure out which uploadState (main or trailer) we should update.
        const uploadState =
          data.fileType === 'main' ? mainUpload : trailerUpload

        // 3. Determine the new server-side status (completed, failed, processing, etc.)
        const processingStatus =
          data.fileType === 'main'
            ? data.project.main_upload_status
            : data.project.trailer_upload_status

        // 4. Reflect that status in our local upload state.
        if (processingStatus === 'completed' || processingStatus === 'failed') {
          uploadState.value.processingStatus =
            processingStatus === 'completed' ? 'completed' : 'failed'
          uploadState.value.progress =
            processingStatus === 'completed' ? 100 : 0
          uploadState.value.isUploading = false
        } else if (processingStatus === 'processing') {
          uploadState.value.processingStatus = 'processing'
          uploadState.value.progress = 99
        }

        // 5. If the event included a manifest URL, store it in the local upload state
        if (data.manifestUrl) {
          uploadState.value.manifestUrl = data.manifestUrl
          uploadState.value.fileUrl = data.manifestUrl
        }

        // 6. If there's a failCause, record it
        if (data.failCause) {
          uploadState.value.error = data.failCause
          error.value = data.failCause
        }
      } catch (eventError) {
        console.error('Error processing VideoProcessed event:', eventError)
        error.value = 'Error processing video update'
      }
    }

    // Legacy handler for backward compatibility
    function legacyVideoProcessedHandler(data: VideoProcessedEvent) {
      try {
        if (processingChannel) {
          processingChannel.bind('VideoProcessed', (data: VideoProcessedEvent) => {
              try {
                console.log('VideoProcessed event received:', data)
                
                // Ensure this event is for our current project
                if (data.project.access_uuid !== project.value?.access_uuid) return

                // Clear polling since we received the event
                if (pollingInterval) {
                  clearInterval(pollingInterval)
                  pollingInterval = null
                }

                // 1. Update the store's project object with all new fields (like project_url/trailer_url).
                updateUploadStateFromProject(data.project)

                // 2. Figure out which uploadState (main or trailer) we should update.
                const uploadState =
                  data.fileType === 'main' ? mainUpload : trailerUpload

                // 3. Determine the new server-side status (completed, failed, processing, etc.)
                const processingStatus =
                  data.fileType === 'main'
                    ? data.project.main_upload_status
                    : data.project.trailer_upload_status

                // 4. Reflect that status in our local upload state.
                if (processingStatus === 'completed' || processingStatus === 'failed') {
                  uploadState.value.processingStatus =
                    processingStatus === 'completed' ? 'completed' : 'failed'
                  uploadState.value.progress =
                    processingStatus === 'completed' ? 100 : 0
                  uploadState.value.isUploading = false
                } else if (processingStatus === 'processing') {
                  uploadState.value.processingStatus = 'processing'
                  uploadState.value.progress = 99
                }

                // 5. If the event included a manifest URL, store it in the local upload state
                if (data.manifestUrl) {
                  uploadState.value.manifestUrl = data.manifestUrl
                  uploadState.value.fileUrl = data.manifestUrl
                }

                // 6. If there's a failCause, record it
                if (data.failCause) {
                  uploadState.value.error = data.failCause
                  error.value = data.failCause
                }
              } catch (eventError) {
                console.error('Error processing VideoProcessed event:', eventError)
                error.value = 'Error processing video update'
              }
            })
          } else {
            console.error('Failed to subscribe to video-processing channel')
            error.value = 'Failed to connect to processing updates'
          }
          
          // Start polling as fallback in case Pusher events fail
          startPollingFallback()
          
        } catch (subscriptionError) {
          console.error('Error subscribing to processing updates:', subscriptionError)
          error.value = 'Failed to setup processing notifications'
          // Start polling as fallback
          startPollingFallback()
        }
    }

    function startPollingFallback() {
      if (pollingInterval) return // Already polling
      
      pollingInterval = setInterval(async () => {
        if (!project.value) return
        
        try {
          const { data } = await $axios.get(`/api/studio/projects/${project.value.access_uuid}`)
          if (data?.project) {
            updateUploadStateFromProject(data.project)
            
            // Stop polling if both main and trailer are completed or failed
            const mainDone = ['completed', 'failed'].includes(data.project.main_upload_status)
            const trailerDone = ['completed', 'failed', 'pending'].includes(data.project.trailer_upload_status)
            
            if (mainDone && trailerDone) {
              clearInterval(pollingInterval)
              pollingInterval = null
            }
          }
        } catch (err) {
          console.error('Polling error:', err)
        }
      }, 5000) // Poll every 5 seconds
    }

    // Cleanup if needed
    function cleanup() {
      if (project.value) {
        unsubscribeFrom(`project.${project.value.id}.main`)
        unsubscribeFrom(`project.${project.value.id}.trailer`)
      }
      processingChannel = null
      if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
      }
      cancelUpload('main')
      cancelUpload('trailer')
      project.value = null
      error.value = null
      insufficientFunds.value = false
      resetUploadStates()
    }

    function resetUploadStates() {
      mainUpload.value = {
        isUploading: false,
        progress: 0,
        error: null,
        fileName: null,
        fileSize: 0,
        uploadedSize: 0,
        processingStatus: 'pending',
        manifestUrl: null,
        fileUrl: null,
        speed: 0,
        estimatedTimeRemaining: 0,
        startTime: null,
      }
      trailerUpload.value = {
        isUploading: false,
        progress: 0,
        error: null,
        fileName: null,
        fileSize: 0,
        uploadedSize: 0,
        processingStatus: 'pending',
        manifestUrl: null,
        fileUrl: null,
        speed: 0,
        estimatedTimeRemaining: 0,
        startTime: null,
      }
    }

    return {
      // state
      project,
      error,
      insufficientFunds,
      isLoading,
      mainUpload,
      trailerUpload,
      // getters
      canUploadTrailer,
      isAnyUploadInProgress,
      // actions
      createProject,
      uploadFile,
      cancelUpload,
      cleanup,
      resetUploadStates,
      // SSE/pusher
      subscribeToProcessingUpdates,
      updateUploadStateFromProject,
      updateProject,
    }
  }
)