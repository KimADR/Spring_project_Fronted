import { fetchApi } from "./api-config"

export interface Withdrawal {
  nRetrait: number
  nCheque: string
  nCompte: string
  montant: number
  dateRetrait: string
}

export interface Client {
  nCompte: string
  nomClient: string
  solde: number
}

export interface AuditRetrait {
  id: number
  typeAction: string
  dateMiseAJour: string
  nRetrait: number
  nCompte: string
  nomClient: string
  montantAncien: number
  montantNouv: number
  utilisateur: string
}

export async function fetchWithdrawals(): Promise<Withdrawal[]> {
  return fetchApi<Withdrawal[]>("/retraits")
}

export async function fetchClients(): Promise<Client[]> {
  return fetchApi<Client[]>("/clients")
}

export async function fetchAuditRetraits(): Promise<AuditRetrait[]> {
  return fetchApi<AuditRetrait[]>("/audit-retraits")
}

