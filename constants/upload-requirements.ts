// constants/upload-requirements.ts
import type { UploadConfig } from "~/types/upload-requirements.types";

export const UPLOAD_REQUIREMENTS: Record<"trailer" | "main", UploadConfig> = {
  trailer: {
    maxSize: 100 * 1024 * 1024, // 100MB
    maxDuration: 15, // 15 seconds
    requirements: [
      {
        icon: "mdi-video",
        title: "Size & Duration",
        detail: "Max 100MB, 15sec",
      },
      {
        icon: "mdi-file-video",
        title: "Format",
        detail: "MP4 recommended",
      },
      {
        icon: "mdi-high-definition",
        title: "Resolution",
        detail: "Min 720p",
      },
      {
        icon: "mdi-aspect-ratio",
        title: "Aspect Ratio",
        detail: "16:9 or 9:16",
      },
    ],
  },
  main: {
    maxSize: 1024 * 1024 * 1024, // 1GB
    maxDuration: 900, // 15 minutes
    requirements: [
      {
        icon: "mdi-video",
        title: "Size & Duration",
        detail: "Max 1GB, 15min",
      },
      {
        icon: "mdi-file-video",
        title: "Format",
        detail: "MP4 recommended",
      },
      {
        icon: "mdi-high-definition",
        title: "Resolution",
        detail: "Min 720p",
      },
      {
        icon: "mdi-aspect-ratio",
        title: "Aspect Ratio",
        detail: "16:9 or 9:16",
      },
    ],
  },
};
