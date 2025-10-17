# Project Structure

## Directory Organization

### `/components` - Vue Components (300+ components)
Organized by feature domain with clear separation of concerns:
- **Feature-based**: `auth/`, `project/`, `wallet/`, `payment/`, `talent/`, `premiering/`
- **UI Elements**: `buttons/`, `dialogs/`, `forms/`, `carousel/`, `cards/`
- **Shared**: `common/`, `shared/`, `base/` for reusable components
- **Layout**: `headers/`, `sidebars/`, `navigation/` for structural components

### `/composables` - Vue Composition Functions (80+ composables)
Reusable logic organized by domain:
- **Feature composables**: `premiering/`, `media/`, `help/`, `upload/`, `headers/`, `menu/`
- **Utilities**: `useApi`, `useFormatting`, `useValidation`, `useDebounce`
- **Business logic**: `usePaymentProcessor`, `useWalletBalance`, `useProjectViews`
- **State management**: `useFanButton`, `useLoginDialog`, `useNotificationState`

### `/stores` - Pinia State Management (60+ stores)
Centralized state organized by feature:
- **Domain stores**: `auth.ts`, `wallet/`, `premiering/`, `help/`, `support/`, `page/`
- **Entity stores**: `useProjectStore`, `useTalentsStore`, `useUsersStore`
- **UI stores**: `customizer.ts`, `loginDialog.ts`, `notificationSettings.ts`
- **Transaction stores**: `checkoutStore`, `useTransactionManagerStore`

### `/pages` - File-based Routing
Nuxt auto-routing with nested structures:
- **Dynamic routes**: `[username]/`, `[access_uuid]/`, `[categorySlug]/`
- **Feature pages**: `wallet/`, `studio/`, `premiering/`, `help/`, `talents/`
- **Auth pages**: `login.vue`, `register/`, `password/`
- **User pages**: `profile/`, `notifications.vue`, `watching.vue`

### `/views` - Page View Components
Complex page implementations separated from routing:
- **Feature views**: `auth/`, `wallet/`, `premiering/`, `talents/`, `projects/`
- **User views**: `earnings/`, `orders/`, `payments/`, `tips/`
- **Content views**: `home/`, `help/`, `policies/`, `watch/`

### `/layouts` - Application Layouts
Different layout templates for various sections:
- `default.vue` - Main application layout
- `AuthLayout.vue` - Authentication pages
- `UserProfileLayout.vue` - User profile pages
- `WalletLayout.vue` - Wallet section
- `StudioProjectLayout.vue` - Creator studio
- `watch.vue` - Video watching interface

### `/middleware` - Route Guards
Navigation protection and logic:
- `auth.ts` / `auth.global.ts` - Authentication checks
- `wallet-auth.ts` - Wallet access control
- `isProjectCreator.ts` - Creator permissions
- `investor-project-earnings-access.ts` - Investment access
- `not-found.global.ts` - 404 handling

### `/types` - TypeScript Definitions
Comprehensive type system:
- **Entity types**: `user.ts`, `project.ts`, `talent.ts`, `payment.ts`, `wallet.ts`
- **Feature types**: `premiere.ts`, `investor.ts`, `earnings.ts`, `tips.ts`
- **UI types**: `layout.ts`, `notification.ts`, `snackbar.ts`
- **API types**: `api.d.ts`, `auth.ts`, `categories.ts`

### `/utils` - Utility Functions
Helper functions and formatters:
- **Formatters**: `formatters/`, `formatters.ts`, `numberFormatUtils.ts`
- **Helpers**: `helpers.ts`, `cartHelpers.ts`, `routes.ts`
- **Locales**: `locales/` with i18n message files
- **Specialized**: `masking.ts`, `phoneNumber.ts`, `titleFormat.ts`

### `/assets` - Static Assets
Styles and images:
- **SCSS**: `scss/` with component, layout, and page styles
- **Images**: `images/` with cards, icons, and other graphics
- **Global styles**: `_variables.scss`, `_override.scss`, `style.scss`

### `/plugins` - Nuxt Plugins
Application-wide functionality:
- `api.ts` / `api.client.ts` - API client setup
- `vue-toastification.ts` - Toast notifications
- `eventBus.ts` - Event communication
- `social-providers.client.ts` - OAuth providers
- `pinia-persistedstate.client.ts` - State persistence

### `/server` - Server-side Code
Nitro server functionality:
- `api/` - Server API endpoints
- `middleware/` - Server middleware (error logging)

### `/services` - Service Layer
Business logic services:
- `notificationService.ts` - Notification handling
- `shareApi.ts` - Social sharing functionality

### `/constants` - Application Constants
Configuration and static data:
- `languages.ts` - Language definitions
- `layouts.ts` - Layout configurations
- `dataFilters.ts`, `transactionFilters.ts` - Filter options
- `upload-requirements.ts` - Upload specifications

### `/config` - Configuration Files
Application configuration:
- `layout.ts` - Layout settings
- `profile.ts`, `pageProfile.ts` - Profile configurations

## Core Architectural Patterns

### Component Architecture
- **Atomic Design**: Base components → Feature components → Page views
- **Single Responsibility**: Each component handles one specific concern
- **Composition over Inheritance**: Composables for shared logic

### State Management Pattern
- **Pinia stores** for global state
- **Composables** for component-level reactive state
- **Props/Emits** for parent-child communication
- **Event bus** for cross-component events

### Data Flow
1. **API Layer**: `composables/useApi.ts` and `plugins/api.ts`
2. **Store Layer**: Pinia stores manage domain state
3. **Composable Layer**: Business logic and computed state
4. **Component Layer**: UI rendering and user interaction

### Routing Strategy
- **File-based routing** via Nuxt pages
- **Dynamic routes** for user-generated content
- **Middleware guards** for access control
- **Hybrid SSR/SPA**: SSR for SEO-critical pages, SPA for authenticated areas

### Code Organization Principles
- **Feature-first**: Group by feature domain, not technical layer
- **Colocation**: Keep related files close together
- **Clear naming**: Descriptive, consistent naming conventions
- **Separation of concerns**: Logic, state, and UI clearly separated
