<template>
  <div class="carousel-container">
    <swiper
      :modules="[SwiperAutoplay, SwiperNavigation]"
      :slides-per-view="5"
      :space-between="0"
      navigation
      :autoplay="{
        delay: 8000,
        disableOnInteraction: true,
      }"
      :breakpoints="{
        320: { slidesPerView: 1.5, spaceBetween: 10 },
        640: { slidesPerView: 3, spaceBetween: 10 },
        1024: { slidesPerView: 5, spaceBetween: 10 },
      }"
      class="user-swiper"
    >
      <swiper-slide v-for="user in users" :key="user.id" class="user-slide">
        <div
          class="user-card"
          :class="{ 'is-fanning': user.is_fanned_by_authenticated_user }"
        >
          <!-- Directly use user.profile_photo for image source -->
          <img
            :src="user.profile_photo || defaultAvatar"
            alt="Profile photo"
            class="user-photo"
          />
          <h3 class="user-name">
            {{ user.display_name || `${user.first_name} ${user.last_name}` }}
          </h3>
          <v-btn
            :color="
              user.is_fanned_by_authenticated_user ? 'secondary' : 'primary'
            "
            @click="$emit('toggleFan', user.id)"
            class="fan-button"
          >
            {{
              user.is_fanned_by_authenticated_user ? "Fanning" : "Become a Fan"
            }}
          </v-btn>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["toggleFan"]);

const defaultAvatar = "/images/default-avatar.png"; // Path to a default image if profile_photo is not available
</script>

<style>
.carousel-container {
  position: relative;
}

.user-swiper {
  padding: 10px 60px; /* Provides space for navigation arrows */
}

.user-slide {
  display: flex;
  justify-content: center;
}

.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.user-card.is-fanning {
  /* Add some visual feedback for fanning */
  animation: pulse 1s infinite;
}

.user-photo {
  border-radius: 50%;
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 3px solid #e9e9e9;
}

.user-name {
  margin-top: 10px;
  font-size: 16px;
  text-align: center;
  color: #333;
}

.fan-button {
  margin-top: 10px;
  border-radius: 20px;
}

/* Swiper navigation buttons */
.swiper-button-prev,
.swiper-button-next {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  top: 50%;
  transform: translateY(-50%);
  position: absolute;
  z-index: 10;
}

.swiper-button-prev {
  left: 10px;
}

.swiper-button-next {
  right: 10px;
}

.swiper-button-prev:after,
.swiper-button-next:after {
  font-size: 20px;
}

/* Custom styles for pagination */
.swiper-pagination-bullet {
  background: white;
  opacity: 1;
}

.swiper-pagination-bullet-active {
  background: var(--v-primary-base);
}

/* Hide arrows if no sliding is possible */
.swiper-button-disabled {
  display: none;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .user-card {
    padding: 12px;
  }
  .user-photo {
    width: 60px;
    height: 60px;
  }
  .user-name {
    font-size: 14px;
  }
}
</style>
