"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, History, BanknoteIcon, LogOut } from "lucide-react"

const routes = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Clients",
    icon: Users,
    href: "/clients",
  },
  {
    label: "Withdrawals",
    icon: BanknoteIcon,
    href: "/withdrawals",
  },
  {
    label: "Audit Trail",
    icon: History,
    href: "/auditRetrait",
  },
  {
    label: "Withdrawal History",
    icon: History,
    href: "/withdrawal-history",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r">
      <div className="flex h-14 items-center border-b px-6">
        <BanknoteIcon className="mr-2 h-6 w-6" />
        <span className="font-semibold">Banking System</span>
      </div>
      <div className="flex-1 space-y-1 p-2">
        {routes.map((route) => (
          <Link key={route.href} href={route.href}>
            <Button variant="ghost" className={cn("w-full justify-start", pathname === route.href && "bg-muted")}>
              <route.icon className="mr-2 h-4 w-4" />
              {route.label}
            </Button>
          </Link>
        ))}
      </div>
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}

