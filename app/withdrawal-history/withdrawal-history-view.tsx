"use client"

import { useState, useMemo, useEffect } from "react"
import { format, parseISO, isToday, isYesterday, isSameMonth, isSameYear } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Withdrawal, Client, AuditRetrait } from "@/lib/withdrawalHistory"

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  return (
    <div className="flex items-center justify-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1 text-sm rounded border disabled:opacity-50"
      >
        Previous
      </button>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 text-sm rounded border disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )
}

interface WithdrawalHistoryViewProps {
  initialWithdrawals: Withdrawal[]
  clients: Client[]
  auditRetraits: AuditRetrait[]
}

export function WithdrawalHistoryView({ initialWithdrawals, clients, auditRetraits }: WithdrawalHistoryViewProps) {
  const [nameFilter, setNameFilter] = useState("")
  const [accountFilter, setAccountFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [customDate, setCustomDate] = useState("")
  const [activeTab, setActiveTab] = useState("current")
  const [currentPage, setCurrentPage] = useState(1)
  const [auditPage, setAuditPage] = useState(1)
  const ITEMS_PER_PAGE_CURRENT = 4
  const ITEMS_PER_PAGE_AUDIT = 6

  const clientMap = useMemo(() => {
    return clients.reduce(
      (acc, client) => {
        acc[client.nCompte] = client
        return acc
      },
      {} as Record<string, Client>,
    )
  }, [clients])

  // Create a map of withdrawal dates from audit history
  const withdrawalDatesMap = useMemo(() => {
    return auditRetraits.reduce(
      (acc, audit) => {
        if (audit.typeAction === "INSERT") {
          acc[audit.nCompte] = audit.dateMiseAJour
        }
        return acc
      },
      {} as Record<string, string>,
    )
  }, [auditRetraits])

  const filteredWithdrawals = useMemo(() => {
    return initialWithdrawals.filter((withdrawal) => {
      const client = clientMap[withdrawal.nCompte]
      if (!client) return false

      const nameMatch = client.nomClient.toLowerCase().includes(nameFilter.toLowerCase())
      const accountMatch = withdrawal.nCompte.includes(accountFilter)

      const withdrawalDate = withdrawalDatesMap[withdrawal.nCompte]
        ? parseISO(withdrawalDatesMap[withdrawal.nCompte])
        : null

      let dateMatch = true
      if (withdrawalDate) {
        if (dateFilter === "today") {
          dateMatch = isToday(withdrawalDate)
        } else if (dateFilter === "yesterday") {
          dateMatch = isYesterday(withdrawalDate)
        } else if (dateFilter === "thisMonth") {
          dateMatch = isSameMonth(withdrawalDate, new Date())
        } else if (dateFilter === "thisYear") {
          dateMatch = isSameYear(withdrawalDate, new Date())
        } else if (dateFilter === "custom" && customDate) {
          const customDateObj = parseISO(customDate)
          dateMatch = isSameMonth(withdrawalDate, customDateObj) && isSameYear(withdrawalDate, customDateObj)
        }
      } else {
        dateMatch = dateFilter === "all"
      }

      return nameMatch && accountMatch && dateMatch
    })
  }, [initialWithdrawals, clientMap, nameFilter, accountFilter, dateFilter, customDate, withdrawalDatesMap])

  const filteredAuditRetraits = useMemo(() => {
    return auditRetraits.filter((audit) => {
      const nameMatch = audit.nomClient.toLowerCase().includes(nameFilter.toLowerCase())
      const accountMatch = audit.nCompte.includes(accountFilter)

      const auditDate = audit.dateMiseAJour ? parseISO(audit.dateMiseAJour) : null

      let dateMatch = true
      if (auditDate) {
        if (dateFilter === "today") {
          dateMatch = isToday(auditDate)
        } else if (dateFilter === "yesterday") {
          dateMatch = isYesterday(auditDate)
        } else if (dateFilter === "thisMonth") {
          dateMatch = isSameMonth(auditDate, new Date())
        } else if (dateFilter === "thisYear") {
          dateMatch = isSameYear(auditDate, new Date())
        } else if (dateFilter === "custom" && customDate) {
          const customDateObj = parseISO(customDate)
          dateMatch = isSameMonth(auditDate, customDateObj) && isSameYear(auditDate, customDateObj)
        }
      } else {
        dateMatch = dateFilter === "all"
      }

      return nameMatch && accountMatch && dateMatch
    })
  }, [auditRetraits, nameFilter, accountFilter, dateFilter, customDate])

  const paginatedWithdrawals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE_CURRENT
    return filteredWithdrawals.slice(startIndex, startIndex + ITEMS_PER_PAGE_CURRENT)
  }, [filteredWithdrawals, currentPage])

  const paginatedAuditRetraits = useMemo(() => {
    const startIndex = (auditPage - 1) * ITEMS_PER_PAGE_AUDIT
    return filteredAuditRetraits.slice(startIndex, startIndex + ITEMS_PER_PAGE_AUDIT)
  }, [filteredAuditRetraits, auditPage])

  const totalCurrentPages = Math.ceil(filteredWithdrawals.length / ITEMS_PER_PAGE_CURRENT)
  const totalAuditPages = Math.ceil(filteredAuditRetraits.length / ITEMS_PER_PAGE_AUDIT)

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "INSERT":
        return "bg-green-500/15 text-green-700 dark:text-green-400"
      case "UPDATE":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-400"
      case "DELETE":
        return "bg-red-500/15 text-red-700 dark:text-red-400"
      default:
        return "bg-gray-500/15 text-gray-700 dark:text-gray-400"
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    setAuditPage(1)
  }, [])

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Withdrawal History</h1>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nameFilter">Client Name</Label>
              <Input
                id="nameFilter"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                placeholder="Filter by name"
              />
            </div>
            <div>
              <Label htmlFor="accountFilter">Account Number</Label>
              <Input
                id="accountFilter"
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                placeholder="Filter by account"
              />
            </div>
            <div>
              <Label htmlFor="dateFilter">Date</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger id="dateFilter">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="custom">Custom date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {dateFilter === "custom" && (
            <div>
              <Label htmlFor="customDate">Custom Date</Label>
              <Input id="customDate" type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="current">Current Withdrawals</TabsTrigger>
          <TabsTrigger value="audit">Audit History</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle>Current Withdrawals ({filteredWithdrawals.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.nRetrait}>
                      <TableCell>
                        {withdrawalDatesMap[withdrawal.nCompte]
                          ? format(parseISO(withdrawalDatesMap[withdrawal.nCompte]), "dd/MM/yyyy HH:mm")
                          : "Not available"}
                      </TableCell>
                      <TableCell>{clientMap[withdrawal.nCompte]?.nomClient}</TableCell>
                      <TableCell>{withdrawal.nCompte}</TableCell>
                      <TableCell>{withdrawal.montant.toFixed(2)} $</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination currentPage={currentPage} totalPages={totalCurrentPages} onPageChange={setCurrentPage} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit History ({filteredAuditRetraits.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Previous Amount</TableHead>
                    <TableHead>New Amount</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAuditRetraits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell>{format(parseISO(audit.dateMiseAJour), "dd/MM/yyyy HH:mm")}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getActionBadgeColor(audit.typeAction)}>
                          {audit.typeAction}
                        </Badge>
                      </TableCell>
                      <TableCell>{audit.nomClient}</TableCell>
                      <TableCell>{audit.nCompte}</TableCell>
                      <TableCell>{audit.montantAncien?.toFixed(2) ?? "-"} $</TableCell>
                      <TableCell>{audit.montantNouv?.toFixed(2) ?? "-"} $</TableCell>
                      <TableCell>{audit.utilisateur}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination currentPage={auditPage} totalPages={totalAuditPages} onPageChange={setAuditPage} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

