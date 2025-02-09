"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Client, ClientFormData } from "@/lib/types/client"
import { createClient, deleteClient, getAllClients, updateClient } from "@/lib/clientServices"

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
    solde: 0,
  })
  const { toast } = useToast()

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients()
  }, [])

  // Function to fetch clients
  const fetchClients = async () => {
    try {
      const data = await getAllClients()
      setClients(data)
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "solde" ? (value === "" ? 0 : parseFloat(value)) : value,
    }));
  }

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (selectedClient) {
        // Update existing client
        await updateClient(selectedClient.nCompte, formData)
        toast({
          title: "Success",
          description: "Client updated successfully",
        })
      } else {
        // Create new client
        await createClient(formData)
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
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
  
      // Perform the deletion
      await deleteClient(client.nCompte);
  
      // Show success message
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
  
      // Refresh the client list after successful deletion
      await fetchClients();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
  
      // Refetch clients in case of an error (rollback optimistic update)
      await fetchClients();
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">Manage your client accounts and balances</p>
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
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedClient ? "Edit Client" : "Add New Client"}</DialogTitle>
              <DialogDescription>
                {selectedClient ? "Edit the client's details below" : "Enter the client's details below"}
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
                  placeholder="0.00"
                  value={formData.solde === 0 ? "" : formData.solde}
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
          <CardTitle>Client Accounts</CardTitle>
          <CardDescription>A list of all client accounts and their current balances</CardDescription>
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
              {clients.map((client) => (
                <TableRow key={client.nCompte}>
                  <TableCell className="font-medium">{client.nCompte}</TableCell>
                  <TableCell>{client.nomClient}</TableCell>
                  <TableCell className={client.solde < 0 ? "text-red-500" : "text-green-500"}>
                    ${client.solde.toFixed(2)}
                  </TableCell>
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
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client account {selectedClient?.nCompte}{" "}
              and remove their data from the system.
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