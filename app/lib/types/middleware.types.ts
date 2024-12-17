export interface RouteConfig {
  requiresAuth: boolean
  requiresRegistration: boolean
}

export interface AuthCookies {
  accessToken?: string
  isRegistered?: boolean
} 