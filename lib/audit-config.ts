const API_BASE_URL = "http://localhost:8080" // Replace with your actual API base URL

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const fullUrl = `${API_BASE_URL}${url}`
  const res = await fetch(fullUrl, options)

  if (!res.ok) {
    const errorData = await res.json()
    const errorMessage = errorData.message || res.statusText
    throw new Error(errorMessage)
  }

  return res.json()
}

export { fetchApi }

