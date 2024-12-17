import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface UpdateUserProfileData {
  fullName: string;
  dateOfBirth: string;
  resumeSummary: string;
  preferredLocationId: number;
  programmingSkills: number[];
  profileImage?: File;
}

export class UserApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public path: string
  ) {
    super(message);
    this.name = "UserApiError";
  }
}

interface ApiResponse {
  success: boolean;
  message: string;
  statusCode: number;
  path: string;
  timestamp: string;
  data: {
    id: number;
    email: string;
    fullName: string;
    dateOfBirth: string;
    preferredLocation: {
      id: number;
      locationName: string;
    };
    resumeSummary: string;
    programmingSkills: Array<{
      id: number;
      name: string;
    }>;
  };
}

export const updateUserProfile = async (userId: number, data: UpdateUserProfileData): Promise<ApiResponse> => {
  const accessToken = Cookies.get('access_token')

  if (!accessToken) {
    throw new UserApiError('Not authenticated', 401, '/api/users')
  }

  try {
    const formData = new FormData()
    
    formData.append('fullName', data.fullName)
    formData.append('dateOfBirth', data.dateOfBirth)
    formData.append('resumeSummary', data.resumeSummary)
    formData.append('preferredLocationId', data.preferredLocationId.toString())
    formData.append('programmingSkills', JSON.stringify(data.programmingSkills))
    
    if (data.profileImage) {
      formData.append('profileImage', data.profileImage)
    }

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formData,
      credentials: 'include',
    })

    const responseData: ApiResponse = await response.json()

    if (!response.ok) {
      throw new UserApiError(
        responseData.message,
        responseData.statusCode,
        responseData.path
      )
    }

    if (responseData.success) {
      Cookies.set('user_data', JSON.stringify(responseData.data), {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      })

      Cookies.set('userRegistered', 'true', {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      })
    }

    return responseData
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    if (error instanceof UserApiError) {
      throw error
    }
    throw new UserApiError(
      'Network error',
      500,
      '/api/users'
    )
  }
} 