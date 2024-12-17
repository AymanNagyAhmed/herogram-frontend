'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MediaUpload from '@/components/media/MediaUpload';
import MediaGrid from '@/components/media/MediaGrid';
import type { MediaFile, Tag } from '@/lib/types/media.types';
import { uploadMedia, getUserMedia } from '@/lib/services/media.service';
import { getTags } from '@/lib/services/tag.service';
import { toast } from 'react-hot-toast';
import { API_URL , MEDIA_URL} from '@/config';
import Cookies from 'js-cookie';

interface MediaItem {
  id: number;
  user_id: number;
  file_path: string;
  file_name: string;
  file_type: string;
  file_extension: string;
  number_of_views: string;
  file_size: string;
  original_name: string;
  created_at: string;
  updated_at: string;
}

export default function MediaPage() {
  const router = useRouter();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await getTags();
        if (response.success) {
          setTags(response.data);
        }
      } catch (error) {
        console.error('Error loading tags:', error);
        toast.error('Failed to load tags');
      } finally {
        setIsLoading(false);
      }
    };

    loadTags();
  }, []);

  const handleFileUpload = (newFile: MediaFile) => {
    setFiles(prev => [...prev, newFile]);
  };

  const handleUpdateFiles = (updatedFiles: MediaFile[]) => {
    setFiles(updatedFiles);
  };

  const handleTagChange = (tagId: number) => {
    setSelectedTagId(tagId);
  };

  const handleSubmit = async () => {
    if (!selectedTagId) {
      toast.error('Please select a tag');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Upload files using the media service
      const response = await uploadMedia(files);
      
      if (response.success) {
        toast.success('Files uploaded successfully!');
        setFiles([]);
        setSelectedTagId(undefined);
      }
    } catch (error) {
      console.error('Error submitting files:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewMedia = async () => {
    try {
      setIsGalleryLoading(true);
      const userDataString = Cookies.get('user_data');
      
      console.log('User data from cookie:', userDataString); // Debug log

      if (!userDataString) {
        console.error('No user data found in cookies');
        toast.error('Please log in to view your media');
        return;
      }

      try {
        const userData = JSON.parse(userDataString);
        console.log('Parsed user data:', userData); // Debug log

        if (!userData.id) {
          console.error('No user ID found in user data');
          toast.error('User ID not found');
          return;
        }

        console.log('Making API request for user media with ID:', userData.id); // Debug log
        const response = await getUserMedia(userData.id.toString());
        console.log('API Response:', response); // Debug log

        if (response.success) {
          setMediaItems(response.data);
          setShowGallery(true);
        } else {
          console.error('API request failed:', response);
          toast.error('Failed to load media');
        }
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        toast.error('Invalid user data');
      }
    } catch (error) {
      console.error('Error in handleViewMedia:', error);
      toast.error('Failed to load media');
    } finally {
      setIsGalleryLoading(false);
    }
  };

  const handleToggleGallery = () => {
    if (!showGallery) {
      handleViewMedia();
    } else {
      setShowGallery(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <button
          onClick={handleToggleGallery}
          className="
            px-4 py-2 
            bg-green-600 
            hover:bg-green-700 
            text-white 
            rounded-md
            transition-colors 
            duration-200
            focus:outline-none 
            focus:ring-2 
            focus:ring-offset-2 
            focus:ring-green-500
          "
          aria-label={showGallery ? "Hide media gallery" : "View my media gallery"}
        >
          {showGallery ? 'Hide Gallery' : 'View My Media'}
        </button>
      </div>
      
      {showGallery ? (
        <div className="mb-8">
          {isGalleryLoading ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-gray-500">Loading your media...</p>
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No media files found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mediaItems.map((item) => (
                <div
                  key={item.id}
                  className="
                    border rounded-lg 
                    overflow-hidden 
                    shadow-sm 
                    hover:shadow-md 
                    transition-shadow 
                    duration-200
                  "
                >
                  {item.file_type === 'image' ? (
                    <img
                      src={`${MEDIA_URL}/${item.file_path}`}
                      alt={item.original_name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-500">{item.file_type}</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium truncate flex-1 mr-2">
                        {item.original_name}
                      </h3>
                      <button
                        onClick={() => {
                          const path = `${MEDIA_URL}/${item.file_path}`;
                          navigator.clipboard.writeText(path)
                            .then(() => {
                              toast.success('Path copied to clipboard!');
                            })
                            .catch((err) => {
                              console.error('Failed to copy:', err);
                              toast.error('Failed to copy path');
                            });
                        }}
                        className="
                          px-2 py-1
                          text-sm
                          bg-blue-100
                          hover:bg-blue-200
                          text-blue-700
                          rounded
                          transition-colors
                          duration-200
                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                          focus:ring-offset-1
                        "
                        aria-label={`Copy path for ${item.original_name}`}
                        title="Copy file path"
                      >
                        Copy Path
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(parseInt(item.file_size) / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-8">
            <MediaUpload 
              onFileUpload={handleFileUpload}
              tags={tags}
              selectedTagId={selectedTagId}
              onTagChange={handleTagChange}
            />
          </div>

          {files.length > 0 ? (
            <>
              <MediaGrid files={files} onUpdateFiles={handleUpdateFiles} />
              <div className="mt-8 flex flex-col space-y-2">
                {!selectedTagId && (
                  <p className="text-sm text-red-500 text-right">
                    Please select a tag before submitting
                  </p>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || files.length === 0 || !selectedTagId}
                    className={`
                      px-6 py-2 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      transition-colors duration-200
                      ${!selectedTagId || isSubmitting || files.length === 0
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                      }
                    `}
                    aria-label={
                      !selectedTagId 
                        ? 'Please select a tag before submitting'
                        : 'Submit media files'
                    }
                    title={
                      !selectedTagId 
                        ? 'Please select a tag before submitting'
                        : 'Submit media files'
                    }
                  >
                    {isSubmitting 
                      ? 'Submitting...' 
                      : !selectedTagId 
                        ? 'Select a Tag to Submit'
                        : 'Submit Files'
                    }
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">
              No media files uploaded yet. Start by dropping some files above!
            </p>
          )}
        </>
      )}
    </div>
  );
}
