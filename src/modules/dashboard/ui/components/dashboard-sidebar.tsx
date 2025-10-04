"use client";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { BotIcon, VideoIcon, StarIcon, LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardUserButton from "../../dashboard-user-button";

const firstSection = [
  {
    icon: LayoutDashboard,
    label: "Overview",
    href: "/",
  },
  {
    icon: VideoIcon,
    label: "Market",
    href: "/market",
  },
  {
    icon: StarIcon,
    label: "My Portfolio",
    href: "/portfolio",
  },
  {
    icon: LayoutDashboard,
    label: "Transactions",
    href: "/transactions",
  },
  {
    icon: LayoutDashboard,
    label: "Compliance",
    href: "/compliance",
  },
  {
    icon: BotIcon,
    label: "AI Insights",
    href: "/ai-insights",
  },
];
const secondSection = [
  {
    icon: StarIcon,
    label: "Upgrade",
    href: "/upgrade",
  },
];
export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="text-sidebar-accent-foreground">
        <Link href={"/"} className="flex items-center gap-2 px-2 pt-2 ">
          <Image
            src={"/logo.svg"}
            alt="AirBalancer Logo"
            height={36}
            width={36}
          />
          <p className="text-2xl font-semibold">AirBalancer</p>
        </Link>
      </SidebarHeader>
      <div className="px-4 py-2">
        <Separator className="opacity-80 text-[#5d6b68]" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {firstSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-10 border border-transparent bg-[var(--sidebar)]",
                      "hover:border-[#592E83]/20",
pathname === item.href &&
                        "border-sidebar-primary/40 bg-sidebar-primary text-sidebar-primary-foreground"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-4 py-2">
          <Separator className="opacity-80 text-[#5d6b68]" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-10 border border-transparent bg-[var(--sidebar)]",
                      "hover:border-[#592E83]/20",
pathname === item.href &&
                        "border-sidebar-primary/40 bg-sidebar-primary text-sidebar-primary-foreground"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-5" />
                      <span className="text-sm font-medium tracking-tight">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="text-white">
        <DashboardUserButton />
      </SidebarFooter>
    </Sidebar>
  );
}
