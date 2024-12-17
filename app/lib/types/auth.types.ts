export interface LoginFormData {
  email: string;
  password: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
}

export interface LoginResponseData {
  access_token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    dateOfBirth: string;
    preferredLocation: Record<string, any>;
    resumeSummary: string;
    programmingSkills: any[];
  };
}

export type LoginResponse = ApiSuccessResponse<LoginResponseData>; 