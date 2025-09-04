"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  BookOpen,
  Timer,
  Gamepad2,
  User,
  LogOut,
  LogIn,
  Settings,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { AuthProvider, useAuth } from "@/hooks/use-auth"
import AuthGuard from "@/components/auth-guard"

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter();
  const { user, userData, signOut } = useAuth();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "ড্যাশবোর্ড" },
    { href: "/dashboard/lessons", icon: BookOpen, label: "পাঠ" },
    { href: "/test", icon: Timer, label: "টাইপিং টেস্ট" },
    { href: "/game", icon: Gamepad2, label: "টাইপিং গেম" },
    { href: "/dashboard/profile", icon: User, label: "প্রোফাইল" },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    href={item.href}
                    isActive={pathname === item.href}
                    asChild
                  >
                    <a href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {user ? (
              <div className="flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-sidebar-accent">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.photoURL || "https://picsum.photos/100"} alt={userData?.displayName || 'User'} data-ai-hint="user avatar" />
                  <AvatarFallback>{userData?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                  <p className="font-semibold text-sm truncate">{userData?.displayName}</p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
                </div>
                <Button variant="ghost" size="icon" className="group-data-[collapsible=icon]:hidden" onClick={signOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
               <div className="p-2 group-data-[collapsible=expanded]:space-y-2">
                  <p className="text-sm text-center text-muted-foreground group-data-[collapsible=icon]:hidden">আপনার অগ্রগতি সংরক্ষণ করতে লগইন করুন।</p>
                  <Button onClick={() => router.push('/login')} className="w-full">
                      <LogIn />
                      <span className="group-data-[collapsible=icon]:hidden">লগইন/সাইন আপ</span>
                  </Button>
               </div>
            )}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
              <SidebarTrigger className="md:hidden"/>
              <div>
                  {/* Potentially add breadcrumbs or page title here */}
              </div>
          </header>
          <main className="p-4 sm:px-6 sm:py-0">
             {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  )
}
