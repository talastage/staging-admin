// types/upload.types.ts
export type UploadType = "main" | "trailer";

export interface UploadRequirement {
  icon: string;
  title: string;
  detail: string;
}

export interface UploadConfig {
  maxSize: number;
  maxDuration: number;
  requirements: UploadRequirement[];
  acceptedFormats: string[];
  errorMessages: {
    size: string;
    format: string;
    duration: string;
  };
}

export interface UploadCompleteResponse {
  url: string;
  fileType: UploadType;
  jobId?: string;
}