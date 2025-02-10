import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users, BanknoteIcon, History } from "lucide-react"
import { fetchApi } from "@/lib/api-config"
import { AuditActionChart } from "./_components/AuditBarChart"

interface Client {
  nCompte: string
}

interface Withdrawal {
  montant: number
}

interface AuditEvent {
  id: number
  typeAction: string
}

async function getTotalClients() {
  try {
    const clients = await fetchApi<Client[]>("/clients")
    return clients.length
  } catch (error) {
    console.error("Error fetching total clients:", error)
    return 0
  }
}

async function getTotalWithdrawals() {
  try {
    const withdrawals = await fetchApi<Withdrawal[]>("/retraits")
    const total = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.montant, 0)
    return total.toFixed(2)
  } catch (error) {
    console.error("Error fetching total withdrawals:", error)
    return "0.00"
  }
}

async function getAuditEvents() {
  try {
    const events = await fetchApi<AuditEvent[]>("/audit-retraits")
    return events.length
  } catch (error) {
    console.error("Error fetching audit events:", error)
    return 0
  }
}

async function getAuditActionCounts() {
  try {
    const events = await fetchApi<AuditEvent[]>("/audit-retraits")
    return {
      inserts: events.filter((event) => event.typeAction === "INSERT").length,
      updates: events.filter((event) => event.typeAction === "UPDATE").length,
      deletes: events.filter((event) => event.typeAction === "DELETE").length,
    }
  } catch (error) {
    console.error("Error fetching audit action counts:", error)
    return { inserts: 0, updates: 0, deletes: 0 }
  }
}

export default async function OverviewPage() {
  const totalClients = await getTotalClients()
  const totalWithdrawals = await getTotalWithdrawals()
  const auditEvents = await getAuditEvents()
  const actionCounts = await getAuditActionCounts()

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your banking system dashboard</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Active account holders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalWithdrawals}</div>
            <p className="text-xs text-muted-foreground">All-time total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditEvents}</div>
            <p className="text-xs text-muted-foreground">Total recorded operations</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        <AuditActionChart data={actionCounts} />
      </div>
    </div>
  )
}

