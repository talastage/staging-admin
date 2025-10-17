<!-- components\carousel\BaseCarousel.vue -->
<template>
  <div class="base-carousel">
    <Swiper
      :modules="modules"
      :slides-per-view="props.slidesPerView"
      :breakpoints="responsiveBreakpoints"
      :space-between="spaceBetween"
      :navigation="navigationOptions"
      :autoplay="autoplayOptions"
      :loop="loop"
      :pagination="paginationOptions"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
    >
      <slot></slot>
      <template v-if="navigation">
        <div
          class="swiper-button-prev custom-swiper-button"
          :style="arrowStyles"
        ></div>
        <div
          class="swiper-button-next custom-swiper-button"
          :style="arrowStyles"
        ></div>
      </template>
      <div v-if="pagination" class="swiper-pagination"></div>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Swiper } from 'swiper/vue'
import { Navigation, Autoplay, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper/types'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface AutoplayOptions {
  delay?: number
  disableOnInteraction?: boolean
  pauseOnMouseEnter?: boolean
  [key: string]: any
}

interface Props {
  slidesPerView?: number
  spaceBetween?: number
  navigation?: boolean
  loop?: boolean
  arrowPadding?: number
  autoplay?: boolean | AutoplayOptions
  pagination?: boolean
  arrowColor?: string
  arrowBgColor?: string
  arrowSize?: 'small' | 'medium' | 'large'
  breakpoints?: Record<number, { slidesPerView: number; spaceBetween: number }>
}

const props = withDefaults(defineProps<Props>(), {
  slidesPerView: 1,
  spaceBetween: 20,
  navigation: true,
  loop: false,
  arrowPadding: 30,
  autoplay: false,
  pagination: false,
  arrowColor: '#000',
  arrowBgColor: 'rgba(255, 255, 255, 0.5)',
  arrowSize: 'medium',
  breakpoints: () => ({
    640: { slidesPerView: 2, spaceBetween: 20 },
    768: { slidesPerView: 3, spaceBetween: 30 },
    1024: { slidesPerView: 4, spaceBetween: 40 },
  }),
})

const emit = defineEmits<{
  (e: 'swiper', swiper: SwiperType): void
  (e: 'slideChange', swiper: SwiperType): void
  (e: 'reachEnd'): void
  (e: 'reachBeginning'): void
}>()

const swiperInstance = ref<SwiperType | null>(null)

const modules = computed(() => [Navigation, Autoplay, Pagination])

const navigationOptions = computed(() => ({
  nextEl: '.swiper-button-next',
  prevEl: '.swiper-button-prev',
  enabled: props.navigation,
}))

const paginationOptions = computed(() => ({
  el: '.swiper-pagination',
  clickable: true,
  enabled: props.pagination,
}))

const autoplayOptions = computed((): AutoplayOptions | boolean => {
  if (typeof props.autoplay === 'object') {
    return {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      ...props.autoplay,
    }
  }
  return props.autoplay
})

const arrowSizes = {
  small: { size: '24px', fontSize: '12px' },
  medium: { size: '30px', fontSize: '14px' },
  large: { size: '36px', fontSize: '16px' },
}

const arrowStyles = computed(() => ({
  '--arrow-size': arrowSizes[props.arrowSize].size,
  '--arrow-font-size': arrowSizes[props.arrowSize].fontSize,
  '--arrow-color': props.arrowColor,
  '--arrow-bg-color': props.arrowBgColor,
}))

const responsiveBreakpoints = computed(() => props.breakpoints)

const onSwiper = (swiper: SwiperType) => {
  swiperInstance.value = swiper
  emit('swiper', swiper)
}

const onSlideChange = (swiper: SwiperType) => {
  emit('slideChange', swiper)

  // Emit specific events for beginning and end
  if (swiper.isEnd) {
    emit('reachEnd')
  }

  if (swiper.isBeginning) {
    emit('reachBeginning')
  }
}

// Public methods for programmatic control
const slideTo = (index: number, speed?: number, internal?: boolean) => {
  swiperInstance.value?.slideTo(index, speed, internal)
}

const slideNext = (speed?: number, internal?: boolean) => {
  swiperInstance.value?.slideNext(speed, internal)
}

const slidePrev = (speed?: number, internal?: boolean) => {
  swiperInstance.value?.slidePrev(speed, internal)
}

const update = () => {
  swiperInstance.value?.update()
}

defineExpose({
  swiper: swiperInstance,
  slideTo,
  slideNext,
  slidePrev,
  update,
})
</script>

<style scoped>
.base-carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
}

.custom-swiper-button {
  position: absolute;
  width: var(--arrow-size);
  height: var(--arrow-size);
  background: var(--arrow-bg-color);
  border-radius: 50%;
  color: var(--arrow-color);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  margin: 0;
  cursor: pointer;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.custom-swiper-button:hover {
  transform: scale(1.1);
  opacity: 0.9;
}

.swiper-button-prev {
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.swiper-button-next {
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.swiper-button-prev::after,
.swiper-button-next::after {
  font-size: var(--arrow-font-size);
  font-weight: bold;
}

.swiper-pagination-bullet {
  background: var(--arrow-color);
}

.swiper-pagination-bullet-active {
  background: var(--arrow-color);
}

/* Responsive styling for the navigation buttons */
@media (max-width: 640px) {
  .custom-swiper-button {
    --arrow-size: calc(var(--arrow-size) * 0.8);
    --arrow-font-size: calc(var(--arrow-font-size) * 0.8);
  }
}

/* Fix for full width display */
:deep(.swiper) {
  width: 100%;
  overflow: visible;
}

:deep(.swiper-wrapper) {
  display: flex;
}

:deep(.swiper-slide) {
  height: auto;
  display: flex;
  justify-content: center;
}

/* Accessibility improvements for keyboard navigation */
.custom-swiper-button:focus {
  outline: 2px solid #000;
  outline-offset: 2px;
}

/* Support for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .custom-swiper-button {
    transition: none;
  }
}
</style>
