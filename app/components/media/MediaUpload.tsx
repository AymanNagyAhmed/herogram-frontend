'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { MediaFile, Tag } from '@/lib/types/media.types';

interface MediaUploadProps {
  onFileUpload: (file: MediaFile) => void;
  tags: Tag[];
  selectedTagId?: number;
  onTagChange: (tagId: number) => void;
}

const MediaUpload = ({ onFileUpload, tags, selectedTagId, onTagChange }: MediaUploadProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const newFile: MediaFile = {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: URL.createObjectURL(file),
          file: file,
          tagId: selectedTagId
        };
        onFileUpload(newFile);
      };
      
      reader.readAsArrayBuffer(file);
    });
  }, [onFileUpload, selectedTagId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv'],
      'application/pdf': ['.pdf']
    },
    maxSize: 104857600, // 100MB
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label htmlFor="tag-select" className="text-sm font-medium text-gray-700">
          Select Tag:
        </label>
        <select
          id="tag-select"
          value={selectedTagId}
          onChange={(e) => onTagChange(Number(e.target.value))}
          className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm 
            focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select a tag</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      <div
        {...getRootProps()}
        className={`
          p-8 border-2 border-dashed rounded-lg cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <p className="text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag & drop files here, or click to select files'
            }
          </p>
          <div className="text-sm text-gray-500 mt-2 space-y-1">
            <p>Supported file types:</p>
            <p>Images: JPG, JPEG, PNG, GIF</p>
            <p>Videos: MP4, MOV, AVI, MKV</p>
            <p>Documents: PDF</p>
            <p className="text-xs mt-1">Maximum file size: 100MB</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload; 