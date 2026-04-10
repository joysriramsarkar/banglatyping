
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
import { Skeleton } from "@/components/ui/skeleton"
import React, { Suspense } from "react"
import { cn } from "@/lib/utils"

function SidebarFooterContent() {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  
  if (loading) {
    return (
        <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1 group-data-[collapsible=icon]:hidden">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
    )
  }

  if (!user) {
    return (
      <div className="p-2 group-data-[collapsible=expanded]:space-y-2">
         <p className="text-sm text-center text-muted-foreground group-data-[collapsible=icon]:hidden">আপনার অগ্রগতি সংরক্ষণ করতে লগইন করুন।</p>
         <Button onClick={() => router.push('/login')} className="w-full">
             <LogIn />
             <span className="group-data-[collapsible=icon]:hidden">লগইন/সাইন আপ</span>
         </Button>
      </div>
    )
  }

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';

  return (
      <div className="flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-sidebar-accent">
        <Avatar className="h-9 w-9">
          <AvatarImage src={(user.user_metadata as any)?.avatar_url || "https://picsum.photos/100"} alt={displayName} data-ai-hint="user avatar" />
          <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
          <p className="font-semibold text-sm truncate">{displayName}</p>
          <p className="text-xs text-sidebar-foreground/70 truncate">{user.email}</p>
        </div>
        <Button variant="ghost" size="icon" className="group-data-[collapsible=icon]:hidden" onClick={signOut}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
  )
}

function PageSkeleton() {
  return (
      <div className="space-y-8 p-4 sm:px-6 sm:py-0">
          <div className="space-y-2">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
          </div>
      </div>
  );
}


function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isProfilePage = pathname === '/dashboard/profile';
  const isPracticePage = pathname.includes('/dashboard/practice');


  const navItems = [
    { href: "/dashboard", icon: Home, label: "ড্যাশবোর্ড" },
    { href: "/dashboard/lessons", icon: BookOpen, label: "পাঠ" },
    { href: "/dashboard/test", icon: Timer, label: "টাইপিং টেস্ট" },
    { href: "/game", icon: Gamepad2, label: "টাইপিং গেম" },
    { href: "/dashboard/profile", icon: User, label: "প্রোফাইল" },
  ]

  return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <SidebarProvider>
          <Sidebar className={cn(isPracticePage && "md:hidden")}>
            <SidebarHeader>
              <Logo />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')} asChild>
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
               <SidebarFooterContent />
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className={cn("sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6", isPracticePage && "hidden md:flex")}>
                <SidebarTrigger className="md:hidden"/>
                <div>
                    {/* Potentially add breadcrumbs or page title here */}
                </div>
            </header>
            <main className={cn("p-4 sm:px-6 sm:py-0", isPracticePage && "p-0 sm:p-0")}>
              <Suspense fallback={<PageSkeleton />}>
                {isProfilePage ? <AuthGuard>{children}</AuthGuard> : children}
              </Suspense>
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
