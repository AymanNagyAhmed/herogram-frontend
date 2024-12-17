import Cookies from 'js-cookie';
import type { Tag } from '@/lib/types/media.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export class TagApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public path: string
  ) {
    super(message);
    this.name = "TagApiError";
  }
}

interface TagResponse {
  success: boolean;
  message: string;
  statusCode: number;
  path: string;
  timestamp: string;
  data: Tag[];
}

export const getTags = async (): Promise<TagResponse> => {
  const accessToken = Cookies.get('access_token');

  if (!accessToken) {
    throw new TagApiError('Not authenticated', 401, '/api/tags');
  }

  try {
    const response = await fetch(`${API_URL}/tags`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include',
    });

    const responseData: TagResponse = await response.json();

    if (!response.ok) {
      throw new TagApiError(
        responseData.message,
        responseData.statusCode,
        responseData.path
      );
    }

    return responseData;
  } catch (error) {
    console.error('Error in getTags:', error);
    if (error instanceof TagApiError) {
      throw error;
    }
    throw new TagApiError(
      'Network error',
      500,
      '/api/tags'
    );
  }
}; 