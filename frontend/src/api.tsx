export interface ApiResponse {
    message: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const fetchTestMessage = async (): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/api/test`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};
