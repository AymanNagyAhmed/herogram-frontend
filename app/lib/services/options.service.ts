const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// API response structure
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
  data: T;
}

export interface ProgrammingSkill {
  id: number;
  name: string;
}

export interface PreferredLocation {
  id: number;
  locationName: string;
}

export const getPreferredLocations = async (): Promise<PreferredLocation[]> => {
  try {
    const response = await fetch(`${API_URL}/preferred-locations`);
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }
    const result: ApiResponse<PreferredLocation[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [{ id: 1, locationName: 'Remote' }];
  }
};

export const getProgrammingSkills = async (): Promise<ProgrammingSkill[]> => {
  try {
    const response = await fetch(`${API_URL}/programming-skills`);
    if (!response.ok) {
      throw new Error('Failed to fetch programming skills');
    }
    const result: ApiResponse<ProgrammingSkill[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching programming skills:', error);
    return [{ id: 1, name: 'JavaScript' }];
  }
}; 