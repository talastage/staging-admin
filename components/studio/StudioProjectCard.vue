<template>
  <v-card class="studio-card" elevation="2">
    <div class="card-layout">
      <!-- Thumbnail Section -->
      <div class="thumbnail-wrapper">
        <MediaThumbnail
          :thumbnailUrl="project.thumbnail_url"
          :videoUrl="project.video_url"
          :showViews="false"
          :showDuration="true"
          size="lg"
          class="project-card__thumbnail"
          @click="watchProject"
        />
      </div>

      <!-- Content Section -->
      <div class="content-section">
        <div class="header-section">
          <div class="title-status-wrapper">
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <h3 class="project-title" v-bind="props">
                  {{ truncatedTitle }}
                </h3>
              </template>
              <span>{{ project.name }}</span>
            </v-tooltip>
            <ProjectStatusBadge 
              :status="project.status" 
              size="sm"
            />
          </div>
          <div class="more-actions">
            <MoreBtn
              :menuList="[{ title: 'Delete', action: 'delete' }]"
              @select="handleMoreAction"
            />
          </div>
        </div>

        <!-- Description -->
        <p v-if="project.description" class="project-description">
          {{ truncatedDescription }}
        </p>

        <!-- Date Info -->
        <div class="date-info">
          <v-icon
            icon="mdi-calendar-clock"
            :color="isPremiering ? 'error' : undefined"
            size="small"
          />
          <span :class="{ 'premiere-text': isPremiering }">
            {{ displayDate }}
          </span>
        </div>

        <!-- Price Info -->
        <div v-if="hasPrice" class="price-info">
          <v-icon icon="mdi-ticket" size="small" />
          <span>Watch Fee: {{ formattedPrice }}</span>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <template v-if="project.status === 'published'">
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              @click="handleEdit"
              class="action-btn"
            >
              Edit
            </v-btn>
          </template>
          <template v-else>
            <v-btn
              color="warning"
              variant="outlined"
              size="small"
              @click="handleEditDraft"
              class="action-btn"
            >
              Edit Draft
            </v-btn>
          </template>

          <v-btn
            v-if="project.status !== 'draft'"
            color="info"
            variant="outlined"
            size="small"
            @click="handleDetails"
            class="action-btn"
          >
            Details
          </v-btn>

          <v-btn
            v-if="project.status !== 'draft'"
            color="success"
            variant="outlined"
            size="small"
            @click="handleEarnings"
            class="action-btn"
          >
            Project Earnings
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDateFormatter } from '@/composables/useDateFormatter'
import { useTextTruncation } from '@/composables/useTextTruncation'
import type { ProjectListResource, MenuListItem } from '@/types/project'
import { useDisplay } from 'vuetify'
import ProjectStatusBadge from './ProjectStatusBadge.vue'

// Props
const props = defineProps<{
  project: ProjectListResource
}>()

// Emits
const emit = defineEmits<{
  (e: 'edit-project', project: ProjectListResource): void
  (e: 'edit-draft', project: ProjectListResource): void
  (e: 'delete-project', project: ProjectListResource): void
  (e: 'view-details', project: ProjectListResource): void
  (e: 'view-earnings', project: ProjectListResource): void
}>()

const { formatRelativeDate, formatLocalDateTime } = useDateFormatter()
const { truncateText } = useTextTruncation()
const { mobile, smAndDown, mdAndDown } = useDisplay()

// Computed Properties
const isPremiering = computed((): boolean => {
  return Boolean(
    props.project.premiering_start_date && props.project.premiering_time
  )
})

const hasPrice = computed((): boolean => {
  return Boolean(props.project.watch_fee && props.project.currency)
})

const displayDate = computed((): string => {
  if (
    isPremiering.value &&
    props.project.premiering_start_date &&
    props.project.premiering_time
  ) {
    const premiereDate = new Date(props.project.premiering_start_date)
    const [hours, minutes] = props.project.premiering_time.split(':')
    premiereDate.setHours(parseInt(hours), parseInt(minutes))
    return formatLocalDateTime(premiereDate.toISOString())
  }
  return formatRelativeDate(props.project.created_at)
})

const formattedPrice = computed((): string => {
  if (!hasPrice.value) return ''
  return `${props.project.currency?.symbol || ''} ${
    props.project.watch_fee || ''
  }`
})

const truncatedTitle = computed((): string => {
  const name = props.project.name || ''
  const maxLength = smAndDown.value ? 30 : 50
  return truncateText(name, maxLength)
})

const truncatedDescription = computed((): string => {
  const description = props.project.description || ''
  return truncateText(description, smAndDown.value ? 80 : 120)
})

// Methods
const handleEdit = (): void => {
  emit('edit-project', props.project)
}

const handleEditDraft = (): void => {
  emit('edit-draft', props.project)
}

const handleDetails = (): void => {
  emit('view-details', props.project)
}

const handleEarnings = (): void => {
  emit('view-earnings', props.project)
}

const handleMoreAction = (item: MenuListItem): void => {
  if (item.action === 'delete') {
    emit('delete-project', props.project)
  }
}

const watchProject = (event?: Event): void => {
  // Safely handle event if it exists
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }

  // Use Nuxt 3's navigateTo function
  navigateTo(`/watch/${props.project.access_uuid}`)
}
</script>

<style scoped>
.studio-card {
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.studio-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.card-layout {
  display: grid;
  grid-template-columns: minmax(120px, 400px) 1fr;
  gap: 16px;
  position: relative;
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
}

.content-section {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.title-status-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.project-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--v-primary-base);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.project-description {
  font-size: 0.875rem;
  color: var(--v-medium-emphasis-base);
  margin: 0;
  line-height: 1.5;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--v-medium-emphasis-base);
  flex-wrap: wrap;
}

.premiere-text {
  color: rgb(var(--v-theme-error));
  font-weight: 500;
}

.price-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;
}

.action-btn {
  text-transform: none;
  letter-spacing: 0.5px;
  flex-grow: 1;
  max-width: 200px;
}

@media (max-width: 959px) {
  .card-layout {
    grid-template-columns: minmax(100px, 300px) 1fr;
    gap: 12px;
  }

  .content-section {
    padding: 12px;
    gap: 8px;
  }

  .project-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .card-layout {
    grid-template-columns: 1fr;
  }

  .thumbnail-wrapper {
    width: 100%;
  }

  .content-section {
    padding: 16px;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    width: 100%;
  }

  .action-btn {
    max-width: none;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    grid-template-columns: 1fr;
  }

  .content-section {
    padding: 12px;
  }

  .project-title {
    font-size: 1rem;
  }
}
</style>