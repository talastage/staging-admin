// types/upload-requirements.types.ts
export interface UploadRequirement {
  icon: string;
  title: string;
  detail: string;
}

export interface UploadConfig {
  maxSize: number;
  maxDuration: number;
  requirements: UploadRequirement[];
}

export type UploadType = "trailer" | "main";
