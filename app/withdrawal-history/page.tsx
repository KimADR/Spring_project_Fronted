import { WithdrawalHistoryView } from "./withdrawal-history-view"
import { fetchWithdrawals, fetchClients, fetchAuditRetraits } from "@/lib/withdrawalHistory"

export default async function WithdrawalHistoryPage() {
  const [withdrawals, clients, auditRetraits] = await Promise.all([
    fetchWithdrawals(),
    fetchClients(),
    fetchAuditRetraits(),
  ])

  return <WithdrawalHistoryView initialWithdrawals={withdrawals} clients={clients} auditRetraits={auditRetraits} />
}

