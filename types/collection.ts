// types/collection.ts
export interface Collection {
    id: number;
    name: string;
    talents_count: number;
    preview_talents?: TalentPreview[];
    created_at: string;
    updated_at: string;
  }
  
  export interface TalentPreview {
    id: number;
    username: string;
    display_name: string;
    profile_photo: string | null;
    created_at: string;
  }
  