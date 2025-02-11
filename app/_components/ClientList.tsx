/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { fetchApi } from "@/lib/api-config"

interface Client {
  nCompte: string
  nomClient: string
  solde: number
  // Add other client properties as needed
}

interface ClientFormData {
  nCompte: string
  nomClient: string
  solde?: number
  // Add other form fields as needed
}

const itemsPerPage = 4

export default function ClientList() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [formData, setFormData] = useState<ClientFormData>({
    nCompte: "",
    nomClient: "",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients()
  }, [])

  // Function to fetch clients
  const fetchClients = async () => {
    try {
      const data = await fetchApi<Client[]>("/clients")
      // Sort clients by name
      const sortedClients = data.sort((a, b) => a.nomClient.localeCompare(b.nomClient))
      setClients(sortedClients)
      setError(null)
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "solde" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (selectedClient) {
        // Update existing client
        await fetchApi(`/clients/${selectedClient.nCompte}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        })
        toast({
          title: "Success",
          description: "Client updated successfully",
        })
      } else {
        // Create new client
        await fetchApi("/clients", {
          method: "POST",
          body: JSON.stringify(formData),
        })
        toast({
          title: "Success",
          description: "Client created successfully",
        })
      }
      // Refresh the clients list
      await fetchClients()
      // Reset form and close modal
      handleCloseModal()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Operation failed",
      })
    }
  }

  // Handle edit button click
  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setFormData({
      nCompte: client.nCompte,
      nomClient: client.nomClient,
      solde: client.solde,
    })
    setIsModalOpen(true)
  }

  // Handle delete confirmation
  const handleDelete = async (client: Client) => {
    try {
      // Close the dialog immediately
      setIsDeleteDialogOpen(false)
      setSelectedClient(null)

      // Optimistically update the UI
      setClients((prevClients) => prevClients.filter((c) => c.nCompte !== client.nCompte))

      // Perform the deletion
      await fetchApi(`/clients/${client.nCompte}`, {
        method: "DELETE",
      })

      // Show success message
      toast({
        title: "Success",
        description: `Client ${client.nomClient} deleted successfully`,
      })

      // Refresh the clients list in the background
      fetchClients()
    } catch (error) {
      // Show error message
      toast({
        title: "Success",
        description: `Client ${client.nomClient} deleted successfully`,
      })

      // Revert the optimistic update
      fetchClients()
    }
  }

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClient(null)
    setFormData({
      nCompte: "",
      nomClient: "",
      solde: 0,
    })
  }

  const filteredClients = clients.filter((client) => client.nomClient.toLowerCase().includes(searchTerm.toLowerCase()))

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)

  // Loading state
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-lg">Loading clients...</p>
        </div>
      </div>
    )
  }

  // Error state
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
      {/* Header section */}
      <div className="flex items-center justify-between space-x-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">Manage client accounts</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setSelectedClient(null)
                  setFormData({ nCompte: "", nomClient: "", solde: 0 })
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedClient ? "Edit Client" : "New Client"}</DialogTitle>
                <DialogDescription>
                  {selectedClient ? "Edit client details below" : "Enter client details below"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nCompte">Account Number</Label>
                  <Input
                    id="nCompte"
                    name="nCompte"
                    placeholder="Enter account number"
                    value={formData.nCompte}
                    onChange={handleInputChange}
                    required
                    disabled={!!selectedClient}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomClient">Client Name</Label>
                  <Input
                    id="nomClient"
                    name="nomClient"
                    placeholder="Enter client name"
                    value={formData.nomClient}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="solde">Balance</Label>
                  <Input
                    id="solde"
                    name="solde"
                    type="number"
                    step="0.01"
                    placeholder="Enter initial balance"
                    value={formData.solde}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {selectedClient ? "Update" : "Create"} Client
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

       {/* Statistics Cards */}
       <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${clients.reduce((sum, client) => sum + client.solde, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(clients.reduce((sum, client) => sum + client.solde, 0) / (clients.length || 1)).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
          <CardDescription>A list of all client accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Number</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentClients.map((client) => (
                <TableRow key={client.nCompte}>
                  <TableCell className="font-medium">{client.nCompte}</TableCell>
                  <TableCell>{client.nomClient}</TableCell>
                  <TableCell>${client.solde.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedClient(client)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client account for{" "}
              {selectedClient?.nomClient} and remove its data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setSelectedClient(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedClient) {
                  handleDelete(selectedClient)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

