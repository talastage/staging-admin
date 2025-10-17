export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:error', (error) => {
    console.error('Application error:', error)
    
    // Handle 404 errors
    if (error?.statusCode === 404 || error?.statusMessage === 'Not Found') {
      navigateTo('/404')
    }
  })
  
  // Handle Vue errors
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error('Vue error:', error)
    console.error('Error info:', info)
  }
})