export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", // Required for CORS with allowCredentials: true
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || `API call failed: ${response.statusText}`)
  }

  return response.json()
  
}


