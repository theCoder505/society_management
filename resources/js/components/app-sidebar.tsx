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
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    BadgeDollarSign,
    Building,
    Building2Icon,
    ChevronDown,
    ChevronRight,
    CircleDollarSignIcon,
    DollarSign,
    Home,
    KeyRound,
    LayoutGrid,
    MicVocal,
    Newspaper,
    Settings,
    Ticket,
    UserCircle,
    UserPlus2Icon,
    Users,
    Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';

interface GroupedNavItem {
    title: string;
    icon: LucideIcon;
    items: NavItem[];
}

// ─── ADMIN NAV ───────────────────────────────────────────────────────────────
const adminMainNavItems: NavItem[] = [
    { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutGrid },
    { title: 'Apartments', url: '/admin/apartments', icon: Building },
];

const adminFlatItems: NavItem[] = [
    { title: 'Flats', url: '/admin/flats', icon: Building2Icon },
    { title: 'Flat Owners', url: '/admin/flat-owners', icon: Users },
    { title: 'Flat Owner Costs', url: '/admin/flat-owner-costs', icon: BadgeDollarSign },
];

const adminTenantItems: NavItem[] = [
    { title: 'Tenants', url: '/admin/tenants', icon: UserPlus2Icon },
    { title: 'Bills', url: '/admin/tenant-bills', icon: DollarSign },
    { title: 'Notices', url: '/admin/tenant-notices', icon: Newspaper },
];

const adminSocietyItems: NavItem[] = [
    { title: 'Settings', url: '/admin/society-settings', icon: Settings },
    { title: 'Expenditure', url: '/admin/society-expenditure', icon: CircleDollarSignIcon },
    { title: 'Announcement', url: '/admin/society-announcement', icon: MicVocal },
];

const adminGroupedItems: GroupedNavItem[] = [
    { title: 'Flats Management', icon: Building2Icon, items: adminFlatItems },
    { title: 'Tenants Management', icon: UserPlus2Icon, items: adminTenantItems },
    { title: 'Society Management', icon: Building, items: adminSocietyItems },
];

// ─── OWNER NAV ───────────────────────────────────────────────────────────────
const ownerMainNavItems: NavItem[] = [
    { title: 'Dashboard', url: '/owner/dashboard', icon: LayoutGrid },
    { title: 'My Profile', url: '/owner/profile', icon: UserCircle },
];

const ownerGroupedItems: GroupedNavItem[] = [
    {
        title: 'My Properties',
        icon: Home,
        items: [
            { title: 'My Flats', url: '/owner/my-flats', icon: Building2Icon },
            { title: 'My Apartments', url: '/owner/my-apartments', icon: Building },
        ],
    },
    {
        title: 'Tenant Management',
        icon: Users,
        items: [
            { title: 'Tenants', url: '/owner/tenants', icon: UserPlus2Icon },
            { title: 'Tenant Payments', url: '/owner/tenant-payments', icon: DollarSign },
            { title: 'Tenant Notices', url: '/owner/notices', icon: Newspaper },
        ],
    },
    {
        title: 'Operations',
        icon: Wrench,
        items: [
            { title: 'Service Requests', url: '/owner/service-requests', icon: Ticket },
        ],
    },
];

// ─── TENANT NAV ──────────────────────────────────────────────────────────────
const tenantMainNavItems: NavItem[] = [
    { title: 'Dashboard', url: '/tenant/dashboard', icon: LayoutGrid },
    { title: 'My Profile', url: '/tenant/profile', icon: UserCircle },
];

const tenantGroupedItems: GroupedNavItem[] = [
    {
        title: 'My Home',
        icon: KeyRound,
        items: [
            { title: 'My Flats', url: '/tenant/my-flats', icon: Building2Icon },
            { title: 'My Apartment', url: '/tenant/my-apartment', icon: Building },
        ],
    },
    {
        title: 'Finances',
        icon: DollarSign,
        items: [
            { title: 'My Payments', url: '/tenant/payments', icon: BadgeDollarSign },
        ],
    },
    {
        title: 'Communication',
        icon: Newspaper,
        items: [
            { title: 'Notice Board', url: '/tenant/notices', icon: Newspaper },
            { title: 'Service Requests', url: '/tenant/service-requests', icon: Ticket },
        ],
    },
];

export function AppSidebar() {
    const { url } = usePage();
    const { auth } = usePage().props as any;
    const role = auth?.role || 'admin';

    const mainNavItems =
        role == 'tenant' ? tenantMainNavItems : role == 'owner' ? ownerMainNavItems : adminMainNavItems;
    const groupedNavItems =
        role == 'tenant' ? tenantGroupedItems : role == 'owner' ? ownerGroupedItems : adminGroupedItems;
    const dashboardUrl =
        role == 'tenant' ? '/tenant/dashboard' : role == 'owner' ? '/owner/dashboard' : '/admin/dashboard';

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    const isGroupActive = (items: NavItem[]) =>
        items.some((item) => url == item.url || url.startsWith(item.url + '/'));

    useEffect(() => {
        const initiallyOpen: Record<string, boolean> = {};
        groupedNavItems.forEach((group) => {
            if (isGroupActive(group.items)) {
                initiallyOpen[group.title] = true;
            }
        });
        setOpenGroups(initiallyOpen);
    }, [role]);

    const toggleGroup = (groupTitle: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [groupTitle]: !prev[groupTitle],
        }));
    };

    // Role-specific accent colors for the sidebar header label
    const roleBadgeClass =
        role == 'admin'
            ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300'
            : role == 'owner'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';

    const roleLabel = role == 'admin' ? 'Administrator' : role == 'owner' ? 'Flat Owner' : 'Tenant';

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardUrl} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {/* Role Badge */}
                <div className="px-2 pb-1 pt-0">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${roleBadgeClass}`}>
                        {roleLabel} Portal
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {/* Regular Nav Items */}
                <SidebarMenu>
                    {mainNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={url == item.url || url.startsWith(item.url + '/')}>
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
                                    {openGroups[group.title] ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </SidebarMenuButton>

                                {openGroups[group.title] && (
                                    <SidebarMenuSub className="!mx-0 !px-0">
                                        {group.items.map((item) => {
                                            const isActive = url == item.url || url.startsWith(item.url + '/');
                                            const ItemIcon = item.icon;
                                            return (
                                                <SidebarMenuSubItem key={item.title}>
                                                    <SidebarMenuSubButton asChild isActive={isActive} className="!pl-8">
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
