# Development Guidelines

## Code Quality Standards

### TypeScript Usage
- **Strict typing**: All files use TypeScript with explicit interface definitions
- **Interface over type**: Prefer `interface` for object shapes (e.g., `interface Country`, `interface RegisterErrors`)
- **Type annotations**: Function parameters and return types are explicitly typed
- **Null handling**: Use union types with `null` for nullable values (e.g., `country: null as Country | null`)
- **Type assertions**: Use `as` for type assertions when necessary (e.g., `key as keyof RegisterErrors`)

### Naming Conventions
- **Files**: camelCase for composables (`useImageCompression.ts`), PascalCase for components
- **Stores**: Prefix with `use` and suffix with `Store` (e.g., `useRegisterStore`)
- **Composables**: Prefix with `use` (e.g., `useImageCompression`)
- **Interfaces**: PascalCase descriptive names (e.g., `CompressionOptions`, `CompressionResult`)
- **Constants**: SCREAMING_SNAKE_CASE for theme constants (e.g., `DARK_BLUE_THEME`, `DEFAULT_OPTIONS`)
- **Variables**: camelCase for all variables and functions
- **Boolean flags**: Prefix with `is`, `has`, `was` (e.g., `isVerificationSent`, `hasErrors`, `wasCompressed`)

### Code Formatting
- **Line endings**: CRLF (`\r\n`) used throughout the codebase
- **Indentation**: 2 spaces (no tabs)
- **Semicolons**: Always use semicolons at statement ends
- **Quotes**: Single quotes for strings, except in JSON
- **Trailing commas**: Used in multi-line objects and arrays
- **Object literals**: Space after colon in object properties

### Documentation Standards
- **JSDoc comments**: Use for complex functions with parameter descriptions
- **Inline comments**: Descriptive comments for business logic sections
- **Section headers**: Use comment blocks to separate logical sections (e.g., `// Social registration fields`)
- **TODO/FIXME**: Not observed in analyzed files - prefer complete implementations

## Architectural Patterns

### Pinia Store Pattern
```typescript
// Standard store structure
export const useRegisterStore = defineStore('storeName', {
  state: () => ({
    // Primitive values with explicit types
    step: 'contact-info',
    email: '',
    // Nullable objects with type annotations
    country: null as Country | null,
    // Nested objects with interface types
    errors: {} as RegisterErrors,
  }),

  getters: {
    // Computed properties derived from state
    hasErrors: (state) => Object.values(state.errors).some((error) => error !== ''),
    formData: (state) => ({ /* mapped data */ }),
  },

  actions: {
    // Async actions for API calls
    async registerEmail() {
      const { $axios } = useNuxtApp()
      try {
        const response = await $axios.post('/api/endpoint', data)
        this.clearErrors()
        return response.data
      } catch (error: any) {
        this.handleError(error)
        throw error
      }
    },
    
    // Synchronous actions for state mutations
    setStep(step: string) {
      this.step = step
    },
    
    // Validation methods
    validatePersonalInfo(): boolean {
      this.clearErrors()
      let isValid = true
      // Validation logic
      return isValid
    },
  },
})
```

**Key patterns observed:**
- State initialization with explicit types and default values
- Getters for computed/derived state
- Actions handle all state mutations and side effects
- Error handling centralized in dedicated methods
- Validation methods return boolean and update error state
- API calls use try-catch with error propagation

### Composable Pattern
```typescript
// Composables return object with methods
export const useImageCompression = () => {
  // Constants defined at composable scope
  const DEFAULT_OPTIONS: CompressionOptions = {
    maxFileSize: 5 * 1024 * 1024,
    compressionThreshold: 2 * 1024 * 1024,
  }

  // Private helper functions
  const getImageMetadata = (file: File | Blob): Promise<Metadata> => {
    return new Promise((resolve, reject) => {
      // Implementation
    })
  }

  // Public API functions
  const compressImage = async (
    file: File | Blob,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> => {
    const settings = { ...DEFAULT_OPTIONS, ...options }
    // Implementation with progress callbacks
  }

  // Return public API
  return {
    compressImage,
    analyzeImage,
    batchProcessImages,
    getImageMetadata,
  }
}
```

**Key patterns observed:**
- Composables are factory functions returning object with methods
- Default options pattern with spread operator for merging
- Promise-based async operations
- Progress callback pattern for long-running operations
- Helper functions defined in closure scope
- Explicit return of public API

### Theme Configuration Pattern
```typescript
// Theme objects follow consistent structure
const DARK_BLUE_THEME: ThemeTypes = {
  name: 'DARK_BLUE_THEME',
  dark: true,
  variables: {
    'border-color': '#333F55',
  },
  colors: {
    primary: '#5D87FF',
    secondary: '#49BEFF',
    // ... all color definitions
  }
}

// Export multiple theme variants
export { DARK_BLUE_THEME, DARK_AQUA_THEME, DARK_ORANGE_THEME }
```

**Key patterns observed:**
- Consistent theme object structure across all variants
- Kebab-case for CSS variable names
- Hex color values in uppercase
- Named exports for multiple themes
- Type annotation with custom ThemeTypes interface

### Computed Properties Pattern
```typescript
// Computed properties with theme switching logic
const getPrimary = computed(() => {
  const custmizer = customizer()
  if (custmizer === 'AQUA_THEME') {
    return themeColors.AQUA_THEME.colors.primary
  } else if (custmizer === 'PURPLE_THEME') {
    return themeColors.PURPLE_THEME.colors.primary
  }
  // ... more conditions
  else {
    return themeColors.BLUE_THEME.colors.primary
  }
})
```

**Key patterns observed:**
- Vue computed properties for reactive theme values
- If-else chains for theme selection (not switch statements)
- Default fallback in final else clause
- Separate imports for light and dark themes

## Error Handling Patterns

### API Error Handling
```typescript
async registerEmail() {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.post('/api/register/contact-info', data)
    this.clearErrors()
    return response.data
  } catch (error: any) {
    this.handleError(error)
    throw error // Re-throw after handling
  }
}

handleError(error: any) {
  if (error.response) {
    if (error.response.status === 422) {
      // Validation errors
      const responseErrors = error.response.data.errors || {}
      this.clearErrors()
      
      // Map backend keys to frontend keys
      const errorMapping: Record<string, keyof RegisterErrors> = {
        email: 'email',
        country_id: 'country_id',
      }
      
      Object.entries(responseErrors).forEach(([key, messages]) => {
        const frontendKey = errorMapping[key]
        if (frontendKey) {
          this.errors[frontendKey] = Array.isArray(messages) ? messages[0] : messages
        }
      })
    }
  } else if (error.message) {
    throw new Error(error.message)
  }
}
```

**Key patterns:**
- Centralized error handling in dedicated methods
- Clear errors before setting new ones
- Map backend error keys to frontend keys
- Extract first error message from arrays
- Re-throw errors after handling for upstream handling
- Type error parameter as `any` for flexibility

### Validation Pattern
```typescript
validatePersonalInfo(): boolean {
  this.clearErrors()
  let isValid = true

  // Required field validation
  if (!this.firstName?.trim()) {
    this.errors.first_name = 'First name is required'
    isValid = false
  }

  // Complex validation with multiple checks
  if (!this.password) {
    this.errors.password = 'Password is required'
    isValid = false
  } else {
    const passwordChecks = [
      { condition: this.password.length >= 8, message: 'at least 8 characters' },
      { condition: /[a-z]/.test(this.password), message: 'one lowercase letter' },
    ]
    
    const failedChecks = passwordChecks.filter((check) => !check.condition)
    if (failedChecks.length > 0) {
      this.errors.password = 'Password must include ' + 
        failedChecks.map((check) => check.message).join(', ')
      isValid = false
    }
  }

  return isValid
}
```

**Key patterns:**
- Clear errors at start of validation
- Track overall validity with boolean flag
- Optional chaining for nullable values (`?.trim()`)
- Array-based validation checks for complex rules
- Descriptive error messages
- Return boolean indicating validation result

## Data Structure Patterns

### State Management
- **Primitive defaults**: Empty strings for text, `null` for objects, `false` for booleans
- **Type annotations**: Explicit type annotations for complex types (e.g., `null as Country | null`)
- **Nested objects**: Separate interfaces for nested state structures
- **Arrays**: Default to empty arrays, typed with interface

### Constants and Configuration
```typescript
// Array of objects for lookup data
export default [
  { iso_639_1: 'xx', english_name: 'No Language' },
  { iso_639_1: 'aa', english_name: 'Afar' },
  // ... more entries
]

// Configuration objects with defaults
const DEFAULT_OPTIONS: CompressionOptions = {
  maxFileSize: 5 * 1024 * 1024, // Comments for clarity
  compressionThreshold: 2 * 1024 * 1024,
  maxDimension: 1920,
}
```

**Key patterns:**
- Default export for simple data arrays
- Inline comments for numeric constants (especially byte sizes)
- Consistent property naming across similar objects
- Optional properties in interfaces with `?` operator

## API Integration Patterns

### Nuxt App Context
```typescript
const { $axios } = useNuxtApp()
const router = useRouter()
const authStore = useAuthStore()
```

**Key patterns:**
- Destructure needed services from `useNuxtApp()`
- Import Vue Router composables directly
- Access other stores via their composable functions
- Keep context extraction at top of action methods

### Request/Response Handling
```typescript
const response = await $axios.post('/api/register/contact-info', {
  email: this.email,
})
this.userId = response.data.user_id

// Handle different response scenarios
if (response.data.message.includes('resent') || response.data.incomplete_registration) {
  this.setStep('verification')
}

return response.data
```

**Key patterns:**
- Await axios calls directly
- Access data via `response.data`
- Check response properties for conditional logic
- Return response data for upstream handling
- Update state immediately after successful response

## Async/Promise Patterns

### Promise Construction
```typescript
return new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => {
    resolve({ width: img.width, height: img.height })
    URL.revokeObjectURL(img.src) // Cleanup
  }
  img.onerror = () => {
    URL.revokeObjectURL(img.src) // Cleanup on error too
    reject(new Error('Failed to load image'))
  }
  img.src = URL.createObjectURL(file)
})
```

**Key patterns:**
- Explicit Promise construction for browser APIs
- Both success and error handlers
- Resource cleanup in both paths
- Descriptive error messages
- Return typed Promise with explicit return type

### Async/Await Usage
```typescript
const analyzeImage = async (file: File | Blob): Promise<AnalysisResult> => {
  const metadata = await getImageMetadata(file)
  const fileSizeMB = file.size / (1024 * 1024)
  
  return {
    dimensions: { width: metadata.width, height: metadata.height },
    aspectRatio: parseFloat((metadata.width / metadata.height).toFixed(2)),
    fileSize: `${fileSizeMB.toFixed(2)}MB`,
  }
}
```

**Key patterns:**
- Async functions with explicit Promise return type
- Await for async operations
- Calculations after awaited data is available
- Return object literals with computed properties
- Format numbers with `toFixed()` for display

## Progress and Callback Patterns

### Progress Reporting
```typescript
const updateProgress = (progress: number) => {
  if (settings.progressCallback) {
    settings.progressCallback(progress)
  }
}

updateProgress(10) // Initial
updateProgress(50) // Mid-process
updateProgress(100) // Complete
```

**Key patterns:**
- Optional callback in options interface
- Wrapper function to check callback existence
- Progress values from 0-100
- Strategic progress updates at key milestones

## Utility Patterns

### Object Manipulation
```typescript
// Spread operator for merging options
const settings = { ...DEFAULT_OPTIONS, ...options }

// Object.entries for iteration
Object.entries(responseErrors).forEach(([key, messages]) => {
  // Process each entry
})

// Object.keys for key iteration
Object.keys(this.errors).forEach((key) => {
  this.errors[key as keyof RegisterErrors] = ''
})

// Object.values for value checks
Object.values(state.errors).some((error) => error !== '')
```

**Key patterns:**
- Spread operator for shallow merging
- Object.entries when both key and value needed
- Object.keys when only keys needed
- Object.values when only values needed
- Type assertion for dynamic key access

### Array Operations
```typescript
// Filter and map for validation
const failedChecks = passwordChecks.filter((check) => !check.condition)
const errorMessage = failedChecks.map((check) => check.message).join(', ')

// Array.isArray check before accessing
this.errors[frontendKey] = Array.isArray(messages) ? messages[0] : messages

// For...of for async iteration
for (const file of files) {
  const result = await compressImage(file, options)
  results.push(result)
}
```

**Key patterns:**
- Filter before map for efficiency
- Array.isArray for type checking
- Extract first element with `[0]`
- For...of for async operations in loops
- Push to accumulate results

## Best Practices Summary

### Code Organization
1. Import statements at top (Nuxt composables, external libraries, local imports)
2. Interface definitions before implementation
3. Constants after interfaces
4. Helper functions before main functions
5. Export statement at end

### State Management
1. Initialize all state properties with appropriate defaults
2. Use getters for derived/computed state
3. Actions for all state mutations
4. Separate validation and error handling methods
5. Clear errors before setting new ones

### Type Safety
1. Explicit interface definitions for all complex types
2. Type annotations for function parameters and returns
3. Union types for nullable values
4. Type assertions only when necessary
5. Avoid `any` except for error handling

### Error Handling
1. Try-catch for all async operations
2. Centralized error handling methods
3. Clear, user-friendly error messages
4. Re-throw errors after handling
5. Cleanup resources in error paths

### Performance
1. Lazy evaluation with computed properties
2. Progress callbacks for long operations
3. Early returns for optimization
4. Resource cleanup (URL.revokeObjectURL)
5. Batch operations when possible

### Code Style
1. Consistent naming conventions
2. Descriptive variable and function names
3. Comments for complex logic
4. Single responsibility per function
5. DRY principle - extract common patterns
