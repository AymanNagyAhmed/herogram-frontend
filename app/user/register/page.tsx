'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { getPreferredLocations, getProgrammingSkills } from '@/lib/services/options.service'
import { type ProgrammingSkill, type PreferredLocation } from '@/lib/services/options.service'
import { updateUserProfile, UserApiError } from '@/lib/services/user.service'
import Cookies from 'js-cookie'

const createRegistrationSchema = (locations: PreferredLocation[], programmingSkills: ProgrammingSkill[]) => z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  dateOfBirth: z.string().refine((date) => {
    const age = new Date().getFullYear() - new Date(date).getFullYear()
    return age >= 18
  }, 'You must be at least 18 years old'),
  resumeSummary: z.string().min(5, 'Resume summary must be at least 5 characters'),
  preferredLocationId: z.number().min(1, 'Please select a location'),
  programmingSkills: z.array(z.number()).min(1, 'Select at least one skill'),
})

interface UserData {
  id: number;
  email: string;
  fullName: string | null;
  dateOfBirth: string | null;
  preferredLocation: {
    id: number;
    locationName: string;
  } | null;
  resumeSummary: string | null;
  programmingSkills: Array<{
    id: number;
    name: string;
  }>;
}

type RegistrationForm = {
  fullName: string;
  dateOfBirth: string;
  resumeSummary: string;
  preferredLocationId: number;
  programmingSkills: number[];
  profileImage?: File;
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

export default function UserRegistrationPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // Get initial form data from cookies
  const initialFormData = (() => {
    try {
      const userDataCookie = Cookies.get('user_data')
      if (userDataCookie) {
        const userData = JSON.parse(userDataCookie)
        const locationId = userData.preferredLocation?.id
        return {
          fullName: userData.fullName ?? '',
          dateOfBirth: userData.dateOfBirth ? formatDate(userData.dateOfBirth) : '',
          resumeSummary: userData.resumeSummary ?? '',
          preferredLocationId: locationId ? Number(locationId) : 0,
          programmingSkills: Array.isArray(userData.programmingSkills) 
            ? userData.programmingSkills.map((skill: any) => Number(skill.id))
            : [],
        }
      }
    } catch (error) {
      console.error('Error parsing initial user data:', error)
    }
    // Return default values if no cookie or parsing fails
    return {
      fullName: '',
      dateOfBirth: '',
      resumeSummary: '',
      preferredLocationId: 0,
      programmingSkills: [],
    }
  })()

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationForm, string>>>({})
  const [locations, setLocations] = useState<PreferredLocation[]>([])
  const [programmingSkills, setProgrammingSkills] = useState<ProgrammingSkill[]>([])
  const [formData, setFormData] = useState<RegistrationForm>(initialFormData)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  
  // Check auth synchronously
  const accessToken = Cookies.get('access_token')
  const userDataCookie = Cookies.get('user_data')
  
  useEffect(() => {
    setMounted(true)
    if (!accessToken || !userDataCookie) {
      router.replace('/')
    }
  }, [accessToken, userDataCookie, router])

  useEffect(() => {
    if (!mounted || !accessToken || !userDataCookie) return;

    const fetchOptions = async () => {
      try {
        const [locationsData, skillsData] = await Promise.all([
          getPreferredLocations(),
          getProgrammingSkills()
        ])
        
        if (locationsData?.length > 0) {
          setLocations(locationsData)
        }
        
        if (skillsData?.length > 0) {
          setProgrammingSkills(skillsData)
        }
      } catch (error) {
        console.error('Error fetching options:', error)
      } finally {
        setIsLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [mounted, accessToken, userDataCookie])

  // Return null on initial server render and when not authenticated
  if (!mounted || !accessToken || !userDataCookie) {
    return null
  }

  if (isLoadingOptions) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading options...</p>
          </div>
        </main>
      </div>
    )
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'preferredLocationId' ? (value ? Number(value) : 0) : value
    }))
    if (errors[name as keyof RegistrationForm]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleCheckboxChange = (skillId: number) => {
    setFormData(prev => ({
      ...prev,
      programmingSkills: prev.programmingSkills.includes(skillId)
        ? prev.programmingSkills.filter(id => id !== skillId)
        : [...prev.programmingSkills, skillId]
    }))
    if (errors.programmingSkills) {
      setErrors(prev => ({
        ...prev,
        programmingSkills: ''
      }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          profileImage: 'File size must be less than 5MB'
        }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'Please upload an image file'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
      
      if (errors.profileImage) {
        setErrors(prev => ({
          ...prev,
          profileImage: ''
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const userData = Cookies.get('user_data')
      if (!userData) {
        throw new UserApiError('User data not found', 401, '/user/register')
      }

      const user = JSON.parse(userData)
      
      // Create request data with proper type conversion
      const requestData = {
        ...formData,
        preferredLocationId: Number(formData.preferredLocationId),
        programmingSkills: formData.programmingSkills.map(id => Number(id))
      }
      
      const registrationSchema = createRegistrationSchema(locations, programmingSkills)
      const validatedData = registrationSchema.parse(requestData)
      
      const response = await updateUserProfile(user.id, validatedData)
      
      if (response.success) {
        // Set cookies
        Cookies.set('user_data', JSON.stringify(response.data), {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/'
        })
        
        Cookies.set('userRegistered', 'true', {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/'
        })

        window.location.href = '/user';
        return;
      } else {
        setErrors({
          fullName: response.message || 'Registration failed. Please try again.'
        })
      }
    } catch (err) {
      // console.error('Registration error:', err)
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof RegistrationForm, string>> = {}
        err.errors.forEach((error) => {
          const [field] = error.path
          fieldErrors[field as keyof RegistrationForm] = error.message
        })
        setErrors(fieldErrors)
      } else if (err instanceof UserApiError) {
        if (err.status === 401) {
          window.location.href = '/'
          return
        }
        setErrors({
          fullName: err.message
        })
      } else {
        setErrors({
          fullName: 'An unexpected error occurred. Please try again.'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-blue-600 px-6 py-8">
              <h1 className="text-2xl font-bold text-white">Complete Your Profile</h1>
              <p className="text-blue-100 mt-2">Please provide your information to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6" role="form">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
                )}
              </div>

              {/* Resume Summary */}
              <div className="space-y-1.5">
                <label htmlFor="resumeSummary" className="block text-sm font-medium text-gray-700">
                  Resume Summary
                </label>
                <textarea
                  id="resumeSummary"
                  name="resumeSummary"
                  required
                  value={formData.resumeSummary}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                  placeholder="Brief summary of your professional background"
                />
                {errors.resumeSummary && (
                  <p className="text-sm text-red-500">{errors.resumeSummary}</p>
                )}
              </div>

              {/* Preferred Location */}
              <div className="space-y-1.5">
                <label htmlFor="preferredLocationId" className="block text-sm font-medium text-gray-700">
                  Preferred Location
                </label>
                <select
                  id="preferredLocationId"
                  name="preferredLocationId"
                  required
                  value={formData.preferredLocationId || ''}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
                >
                  <option value="">Select a location</option>
                  {locations?.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.locationName}
                    </option>
                  ))}
                </select>
                {errors.preferredLocationId && (
                  <p className="text-sm text-red-500">{errors.preferredLocationId}</p>
                )}
              </div>

              {/* Programming Skills */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Programming Skills
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                  {programmingSkills?.map(skill => (
                    <label key={skill.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.programmingSkills.includes(skill.id)}
                        onChange={() => handleCheckboxChange(skill.id)}
                        className="rounded border-gray-300 text-blue-600 
                          focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <span className="text-sm text-gray-700">{skill.name}</span>
                    </label>
                  ))}
                </div>
                {errors.programmingSkills && (
                  <p className="text-sm text-red-500">{errors.programmingSkills}</p>
                )}
              </div>

              {/* Profile Image Upload */}
              <div className="space-y-1.5">
                <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
                  Profile Image
                </label>
                <input
                  id="profileImage"
                  name="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {errors.profileImage && (
                  <p className="text-sm text-red-500">{errors.profileImage}</p>
                )}
                {formData.profileImage && (
                  <p className="text-sm text-gray-500">
                    Selected file: {formData.profileImage.name}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center items-center py-3 px-6 border border-transparent 
                    rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
} 