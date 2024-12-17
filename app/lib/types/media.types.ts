export type MediaCategory = 'image' | 'video' | 'document';

export interface Tag {
  id: number;
  name: string;
}

export interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  file: File;
  category?: MediaCategory;
  tagId?: number;
}

export interface MediaGridProps {
  files: MediaFile[];
  onUpdateFiles: (files: MediaFile[]) => void;
}

export interface MediaUploadProps {
  onFileUpload: (file: MediaFile) => void;
  tags: Tag[];
  selectedTagId?: number;
  onTagChange: (tagId: number) => void;
} 