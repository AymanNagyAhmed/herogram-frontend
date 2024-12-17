'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth.context'
import Cookies from 'js-cookie'

interface UserProfile {
  id: number
  email: string
  fullName: string
  dateOfBirth: string
  preferredLocation: {
    id: number
    locationName: string
  }
  resumeSummary: string
  programmingSkills: Array<{
    id: number
    name: string
  }>
  profileImage?: string
}

const getFullImageUrl = (profileImage: string | undefined | null): string | undefined => {
  if (!profileImage) return undefined;
  return `${process.env.NEXT_PUBLIC_URL}/${profileImage}`;
};

export default function UserProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchProfile = async () => {
      try {
        const accessToken = Cookies.get('access_token')
        const userDataStr = Cookies.get('user_data')
        const isRegistered = Cookies.get('userRegistered')
        
        if (!accessToken || !isRegistered) {
          router.replace('/')
          return
        }

        await new Promise(resolve => setTimeout(resolve, 100))

        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr)
            if (isMounted) {
              setProfile(userData)
            }
          } catch (error) {
            console.error('Failed to parse user data:', error)
            router.replace('/')
            return
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleLogout = () => {
    logout()
  }

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Show immediate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prevProfile => {
        if (prevProfile) {
          return {
            ...prevProfile,
            profileImage: reader.result as string
          }
        }
        return null;
      });
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const formData = new FormData();
      formData.append('profileImage', file);

      const accessToken = Cookies.get('access_token');
      if (!accessToken || !profile) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${profile.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update profile image');
      }

      const updatedProfile = await response.json();
      
      if (updatedProfile.success) {
        // Update cookies and state with server response
        Cookies.set('user_data', JSON.stringify(updatedProfile.data), {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/'
        });
        
        setProfile(updatedProfile.data);
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
      alert('Failed to update profile image. Please try again.');
      
      // Revert to previous profile state if upload fails
      const userDataStr = Cookies.get('user_data');
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr);
          setProfile(userData);
        } catch (e) {
          console.error('Error reverting profile:', e);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div data-testid="loading-container" className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div 
              data-testid="loading-spinner"
              role="status"
              aria-label="Loading"
              className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"
            />
            <p data-testid="loading-text" className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="bg-blue-600 px-6 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label 
                    htmlFor="profileImageUpload"
                    className="relative h-20 w-20 rounded-full bg-white/10 flex items-center justify-center cursor-pointer
                      hover:bg-white/20 transition-all group"
                  >
                    {profile.profileImage ? (
                      <img 
                        src={getFullImageUrl(profile.profileImage) || ''}
                        alt={profile.fullName?.charAt(0)?? 'test'}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-white">
                        {profile.fullName?.charAt(0) ?? '----'}
                      </span>
                    )}
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 
                      flex items-center justify-center transition-opacity">
                      <span className="text-white text-xs">Change Photo</span>
                    </div>
                    
                    <input
                      id="profileImageUpload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageChange}
                    />
                  </label>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{profile.fullName}</h1>
                    <p className="text-blue-100">{profile.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors
                    focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Birth */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900">{formatDate(profile.dateOfBirth)}</p>
                </div>

                {/* Preferred Location */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Preferred Location</label>
                  <p className="text-gray-900">{profile.preferredLocation.locationName}</p>
                </div>

                {/* Resume Summary */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Resume Summary</label>
                  <p className="text-gray-900">{profile.resumeSummary}</p>
                </div>

                {/* Programming Skills */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Programming Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.programmingSkills?.map(skill => (
                      <span
                        key={skill.id}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 