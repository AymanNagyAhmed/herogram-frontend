import { type LoginFormData, type LoginResponse } from "@/lib/types/auth.types"
import { type RegisterInput } from "@/lib/validations/auth.schema"
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
    public path: string
  ) {
    super(message)
    this.name = "AuthError"
  }
}

export const loginUser = async (credentials: LoginFormData): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new AuthError(
        errorData.message || 'Login failed',
        response.status,
        '/api/auth/login'
      )
    }

    const data = await response.json()
    // Set cookies with all necessary data
    Cookies.set('access_token', data.data.access_token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })

    // Store full user data in cookies
    Cookies.set('user_data', JSON.stringify(data.data.user), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })

    return data
  } catch (error) {
    console.error('Login service error:', error)
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(
      "Network error",
      500,
      "/api/auth/login"
    )
  }
}

export const registerUser = async (data: RegisterInput): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    console.log(response)

    if (!response.ok) {
      const errorData = await response.json()
      throw new AuthError(
        errorData.message || 'Registration failed',
        response.status,
        '/api/users'
      )
    }

    const responseData = await response.json()
    
    // Set cookies with all necessary data
    Cookies.set('access_token', responseData.data.access_token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })

    // Store full user data in cookies
    Cookies.set('user_data', JSON.stringify(responseData.data.user), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })

    return responseData
  } catch (error) {
    console.error('Registration service error:', error)
    if (error instanceof AuthError) {
      throw error
    }
    throw new AuthError(
      "Network error",
      500,
      "/api/users"
    )
  }
} 