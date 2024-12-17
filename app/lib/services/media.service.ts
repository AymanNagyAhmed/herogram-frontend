import Cookies from 'js-cookie';
import type { MediaFile } from '@/lib/types/media.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class MediaApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public path: string
  ) {
    super(message);
    this.name = "MediaApiError";
  }
}

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

interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
}

interface MediaResponse extends ApiResponse {
  data: MediaItem;
}

interface MediaListResponse extends ApiResponse {
  data: MediaItem[];
}

interface UserMediaListResponse extends ApiResponse {
  data: MediaItem[];
}

export const uploadMedia = async (files: MediaFile[]): Promise<MediaResponse> => {
  const accessToken = Cookies.get('access_token');

  if (!accessToken) {
    throw new MediaApiError('Not authenticated', 401, '/api/media');
  }

  try {
    const formData = new FormData();
    
    files.forEach(mediaFile => {
      formData.append('files', mediaFile.file);
    });

    const response = await fetch(`${API_URL}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData,
      credentials: 'include',
    });

    const responseData: MediaResponse = await response.json();

    if (!response.ok) {
      throw new MediaApiError(
        responseData.message,
        responseData.statusCode,
        responseData.path
      );
    }

    return responseData;
  } catch (error) {
    console.error('Error in uploadMedia:', error);
    if (error instanceof MediaApiError) {
      throw error;
    }
    throw new MediaApiError(
      'Network error',
      500,
      '/api/media'
    );
  }
};

export const getMediaList = async (): Promise<MediaListResponse> => {
  const accessToken = Cookies.get('access_token');

  if (!accessToken) {
    throw new MediaApiError('Not authenticated', 401, '/api/media');
  }

  try {
    const response = await fetch(`${API_URL}/media`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include',
    });

    const responseData: MediaListResponse = await response.json();

    if (!response.ok) {
      throw new MediaApiError(
        responseData.message,
        responseData.statusCode,
        responseData.path
      );
    }

    return responseData;
  } catch (error) {
    console.error('Error in getMediaList:', error);
    if (error instanceof MediaApiError) {
      throw error;
    }
    throw new MediaApiError(
      'Network error',
      500,
      '/api/media'
    );
  }
};

export const deleteMedia = async (mediaId: string): Promise<MediaResponse> => {
  const accessToken = Cookies.get('access_token');

  if (!accessToken) {
    throw new MediaApiError('Not authenticated', 401, '/api/media');
  }

  try {
    const response = await fetch(`${API_URL}/media/${mediaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include',
    });

    const responseData: MediaResponse = await response.json();

    if (!response.ok) {
      throw new MediaApiError(
        responseData.message,
        responseData.statusCode,
        responseData.path
      );
    }

    return responseData;
  } catch (error) {
    console.error('Error in deleteMedia:', error);
    if (error instanceof MediaApiError) {
      throw error;
    }
    throw new MediaApiError(
      'Network error',
      500,
      '/api/media'
    );
  }
};

export const getUserMedia = async (userId: string): Promise<UserMediaListResponse> => {
  const accessToken = Cookies.get('access_token');

  if (!accessToken) {
    throw new MediaApiError('Not authenticated', 401, '/api/users/media');
  }

  try {
    const response = await fetch(`${API_URL}/users/${userId}/media`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include',
    });

    const responseData: UserMediaListResponse = await response.json();

    if (!response.ok) {
      throw new MediaApiError(
        responseData.message,
        responseData.statusCode,
        responseData.path
      );
    }

    return responseData;
  } catch (error) {
    console.error('Error in getUserMedia:', error);
    if (error instanceof MediaApiError) {
      throw error;
    }
    throw new MediaApiError(
      'Network error',
      500,
      `/api/users/media`
    );
  }
}; 