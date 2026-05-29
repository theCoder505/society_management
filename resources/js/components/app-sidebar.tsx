import { NavUser } from '@/components/nav-user';
import { 
    Sidebar, 
    SidebarContent, 
    SidebarFooter, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuButton, 
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BadgeDollarSign,
    Building,
    Building2Icon,
    ChevronDown,
    ChevronRight,
    CircleDollarSignIcon,
    DollarSign,
    LayoutGrid,
    MicVocal,
    Newspaper,
    Settings,
    UserPlus2Icon,
    Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import AppLogo from './app-logo';

interface GroupedNavItem {
    title: string;
    icon: LucideIcon;
    items: NavItem[];
}

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Apartments',
        url: '/admin/apartments',
        icon: Building,
    },
];

const flatItems: NavItem[] = [
    {
        title: 'Flats',
        url: '/admin/flats',
        icon: Building2Icon,
    },
    {
        title: 'Flat Owners',
        url: '/admin/flat-owners',
        icon: Users,
    },
    {
        title: 'Flat Owner Costs',
        url: '/admin/flat-owner-costs',
        icon: BadgeDollarSign,
    },
];

const tenantItems: NavItem[] = [
    {
        title: 'Tenants',
        url: '/admin/tenants',
        icon: UserPlus2Icon,
    },
    {
        title: 'Bills',
        url: '/admin/tenant-bills',
        icon: DollarSign,
    },
    {
        title: 'Notices',
        url: '/admin/tenant-notices',
        icon: Newspaper,
    },
];

const societyItems: NavItem[] = [
    {
        title: 'Settings',
        url: '/admin/society-settings',
        icon: Settings,
    },
    {
        title: 'Expenditure',
        url: '/admin/society-expenditure',
        icon: CircleDollarSignIcon,
    },
    {
        title: 'Announcement',
        url: '/admin/society-announcement',
        icon: MicVocal,
    },
];

const groupedNavItems: GroupedNavItem[] = [
    {
        title: 'Flats',
        icon: Building2Icon,
        items: flatItems,
    },
    {
        title: 'Tenants',
        icon: UserPlus2Icon,
        items: tenantItems,
    },
    {
        title: 'Society',
        icon: Building,
        items: societyItems,
    },
];

export function AppSidebar() {
    const { url } = usePage();
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    // Check if any item in a group is active
    const isGroupActive = (items: NavItem[]) => {
        return items.some(item => url === item.url || url.startsWith(item.url + '/'));
    };

    // Initialize open groups based on active items
    useEffect(() => {
        const initiallyOpen: Record<string, boolean> = {};
        groupedNavItems.forEach(group => {
            if (isGroupActive(group.items)) {
                initiallyOpen[group.title] = true;
            }
        });
        setOpenGroups(initiallyOpen);
    }, []);

    const toggleGroup = (groupTitle: string) => {
        setOpenGroups(prev => ({
            ...prev,
            [groupTitle]: !prev[groupTitle]
        }));
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Regular Nav Items */}
                <SidebarMenu>
                    {mainNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={url === item.url || url.startsWith(item.url + '/')}>
                                    <Link href={item.url} prefetch>
                                        {Icon && <Icon className="h-4 w-4" />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>

                {/* Grouped Nav Items */}
                <SidebarMenu>
                    {groupedNavItems.map((group) => {
                        const GroupIcon = group.icon;
                        return (
                            <SidebarMenuItem key={group.title}>
                                <SidebarMenuButton 
                                    onClick={() => toggleGroup(group.title)}
                                    className="w-full justify-between"
                                    isActive={isGroupActive(group.items)}
                                >
                                    <div className="flex items-center gap-2">
                                        {GroupIcon && <GroupIcon className="h-4 w-4" />}
                                        <span>{group.title}</span>
                                    </div>
                                    {openGroups[group.title] ? 
                                        <ChevronDown className="h-4 w-4" /> : 
                                        <ChevronRight className="h-4 w-4" />
                                    }
                                </SidebarMenuButton>
                                
                                {openGroups[group.title] && (
                                    <SidebarMenuSub className="!mx-0 !px-0">
                                        {group.items.map((item) => {
                                            const isActive = url === item.url || url.startsWith(item.url + '/');
                                            const ItemIcon = item.icon;
                                            return (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton 
                                                        asChild 
                                                        isActive={isActive}
                                                        className="!pl-8"
                                                    >
                                                        <Link href={item.url} prefetch>
                                                            {ItemIcon && <ItemIcon className="h-4 w-4" />}
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            );
                                        })}
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}