'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { getUserMedia } from '@/lib/services/media.service';
import { toast } from 'react-hot-toast';
import { API_URL, MEDIA_URL } from '@/config';

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

export default function MediaGalleryPage() {
  const router = useRouter();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setIsLoading(true);
        const userDataString = Cookies.get('user_data');
        const userId = userDataString ? JSON.parse(userDataString).id : null;
        if (!userId) {
          toast.error('User not found');
          return;
        }
        const response = await getUserMedia(userId);
        if (response.success) {
          setMediaItems(response.data);
        } else {
          toast.error('Failed to load media');
        }
      } catch (error) {
        console.error('Error fetching media:', error);
        toast.error('Failed to load media');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const handleBackToUpload = () => {
    router.push('/user/media');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Loading your media...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Media Gallery</h1>
        <button
          onClick={handleBackToUpload}
          className="
            px-4 py-2 
            bg-blue-600 
            hover:bg-blue-700 
            text-white 
            rounded-md
            transition-colors 
            duration-200
            focus:outline-none 
            focus:ring-2 
            focus:ring-offset-2 
            focus:ring-blue-500
          "
          aria-label="Back to media upload"
        >
          Back to Upload
        </button>
      </div>

      {mediaItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No media files found.</p>
          <button
            onClick={handleBackToUpload}
            className="
              mt-4
              px-4 py-2 
              text-blue-600 
              hover:text-blue-700 
              underline
              focus:outline-none 
            "
          >
            Upload some files
          </button>
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
                <h3 className="font-medium truncate">{item.original_name}</h3>
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
  );
} 