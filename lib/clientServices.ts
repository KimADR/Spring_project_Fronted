import type { Client, ClientFormData } from "./types/client"
import { fetchApi } from "@/lib/api-config"

const CLIENT_API_ENDPOINT = "/clients"

export async function getAllClients(): Promise<Client[]> {
  const response = await fetchApi<Client[]>(CLIENT_API_ENDPOINT)
  // Convert BigDecimal string to number
  return response.map((client) => ({
    ...client,
    solde: Number(client.solde),
  }))
}

export async function getClientByNCompte(nCompte: string): Promise<Client> {
  const response = await fetchApi<Client>(`${CLIENT_API_ENDPOINT}/${nCompte}`)
  return {
    ...response,
    solde: Number(response.solde),
  }
}

export async function createClient(client: ClientFormData): Promise<Client> {
  const response = await fetchApi<Client>(CLIENT_API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      ...client,
      solde: client.solde.toString(), // Convert to string for BigDecimal
    }),
  })
  return {
    ...response,
    solde: Number(response.solde),
  }
}

export async function updateClient(nCompte: string, client: ClientFormData): Promise<Client> {
  const response = await fetchApi<Client>(`${CLIENT_API_ENDPOINT}/${nCompte}`, {
    method: "PUT",
    body: JSON.stringify({
      ...client,
      solde: client.solde.toString(), // Convert to string for BigDecimal
    }),
  })
  return {
    ...response,
    solde: Number(response.solde),
  }
}

export async function deleteClient(nCompte: string): Promise<void> {
  await fetchApi(`${CLIENT_API_ENDPOINT}/${nCompte}`, {
    method: "DELETE",
  })
}

