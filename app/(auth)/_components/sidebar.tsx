"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PackageIcon,
  FolderLibraryIcon,
  Location01Icon,
  TagsIcon,
  Notification02Icon,
  TimeQuarterIcon,
  Logout01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const navigationItems = [
  {
    title: "Inventory",
    items: [
      {
        title: "Items",
        url: "/items",
        icon: PackageIcon,
      },
      {
        title: "Categories",
        url: "/categories",
        icon: FolderLibraryIcon,
      },
      {
        title: "Locations",
        url: "/locations",
        icon: Location01Icon,
      },
      {
        title: "Tags",
        url: "/tags",
        icon: TagsIcon,
      },
    ],
  },
  {
    title: "Tracking",
    items: [
      {
        title: "Reminders",
        url: "/reminders",
        icon: Notification02Icon,
      },
      {
        title: "Movement History",
        url: "/movements",
        icon: TimeQuarterIcon,
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <HugeiconsIcon icon={PackageIcon} size={24} />
          <span className="text-lg font-semibold">Finnari</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.url)}
                    >
                      <Link href={item.url}>
                        <HugeiconsIcon icon={item.icon} size={16} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/profile">
                <HugeiconsIcon icon={UserIcon} size={16} />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <HugeiconsIcon icon={Logout01Icon} size={16} />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
