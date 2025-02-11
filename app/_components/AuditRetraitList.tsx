"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, ChevronLeft, ChevronRight, PlusCircle, Pencil, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { fetchApi } from "@/lib/audit-config"

interface AuditRetrait {
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

const PAGE_SIZE = 7

export default function AuditRetraitView() {
  const [auditLogs, setAuditLogs] = useState<AuditRetrait[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const data = await fetchApi<AuditRetrait[]>("/api/audit-retraits")
      setAuditLogs(data)
      setError(null)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogsByClientName = async (clientName: string) => {
    try {
      setLoading(true)
      const data = await fetchApi<AuditRetrait[]>(`/api/audit-retraits/client-name/${clientName}`)
      setAuditLogs(data)
      setError(null)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchTerm) {
      fetchAuditLogsByClientName(searchTerm)
    } else {
      fetchAuditLogs()
    }
  }

  const filteredLogs = auditLogs.filter((log) => log.nomClient.toLowerCase().includes(searchTerm.toLowerCase()))

  const indexOfLastItem = currentPage * PAGE_SIZE
  const indexOfFirstItem = indexOfLastItem - PAGE_SIZE
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE)

  const insertCount = filteredLogs.filter((log) => log.typeAction === "INSERT").length
  const editCount = filteredLogs.filter((log) => log.typeAction === "UPDATE").length
  const deleteCount = filteredLogs.filter((log) => log.typeAction === "DELETE").length

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between space-x-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
          <p className="text-muted-foreground">View and filter withdrawal audit logs</p>
        </div>
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inserts</CardTitle>
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insertCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edits</CardTitle>
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{editCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deletes</CardTitle>
            <Trash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deleteCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log History</CardTitle>
          <CardDescription>A list of all withdrawal audit logs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Withdrawal ID</TableHead>
                <TableHead>Action Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Old Amount</TableHead>
                <TableHead>New Amount</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.nRetrait}</TableCell>
                  <TableCell>{log.typeAction}</TableCell>
                  <TableCell>{new Date(log.dateMiseAJour).toLocaleString()}</TableCell>
                  <TableCell>{log.nCompte}</TableCell>
                  <TableCell>{log.nomClient}</TableCell>
                  <TableCell>${log.montantAncien.toFixed(2)}</TableCell>
                  <TableCell>${log.montantNouv.toFixed(2)}</TableCell>
                  <TableCell>{log.utilisateur}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {/* <div>
            Page {currentPage} of {totalPages}
          </div> */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

