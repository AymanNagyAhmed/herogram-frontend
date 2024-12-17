'use client';

import { useState } from 'react';
import type { MediaFile } from '@/lib/types/media.types';

interface MediaGridProps {
  files: MediaFile[];
  onUpdateFiles: (files: MediaFile[]) => void;
}

const MediaGrid = ({ files, onUpdateFiles }: MediaGridProps) => {
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  const handleDelete = (id: string) => {
    const updatedFiles = files.filter(file => file.id !== id);
    onUpdateFiles(updatedFiles);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return null; // Will render image preview instead
    } else if (type.startsWith('video/')) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    } else if (type === 'application/pdf') {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="relative group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="aspect-square relative">
            {file.type.startsWith('image/') ? (
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : file.type.startsWith('video/') ? (
              <video
                src={file.url}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              getFileIcon(file.type)
            )}
            
            {/* Overlay with file info */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleDelete(file.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={`Delete ${file.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* File info */}
          <div className="p-3">
            <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatFileSize(file.size)}
            </p>
          </div>
        </div>
      ))}

      {/* Preview Modal */}
      {selectedFile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedFile(null)}
        >
          <div className="max-w-4xl w-full p-4" onClick={e => e.stopPropagation()}>
            {selectedFile.type.startsWith('image/') ? (
              <img
                src={selectedFile.url}
                alt={selectedFile.name}
                className="max-h-[80vh] mx-auto"
              />
            ) : selectedFile.type.startsWith('video/') ? (
              <video
                src={selectedFile.url}
                controls
                className="max-h-[80vh] mx-auto"
              />
            ) : selectedFile.type === 'application/pdf' ? (
              <iframe
                src={selectedFile.url}
                className="w-full h-[80vh] bg-white"
                title={selectedFile.name}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGrid; 