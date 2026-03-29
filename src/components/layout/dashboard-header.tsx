import { Search, Bell, Building2, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoWithText } from '@/components/branding';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { authApi } from '@/lib/api/auth-api';

interface DashboardHeaderProps {
  organizationName?: string;
  organizationLogo?: string;
  userName?: string;
  userAvatar?: string;
  userRole?: string;
  notificationCount?: number;
}

export function DashboardHeader({
  organizationName = 'Your Organization',
  organizationLogo,
  userName = 'User',
  userAvatar,
  userRole = 'Administrator',
  notificationCount = 0,
}: DashboardHeaderProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout();

    // Broadcast logout to all other tabs
    window.localStorage.setItem('logout-event', Date.now().toString());
    window.localStorage.removeItem('logout-event');

    // Navigate to login & prevent back-button returning to this page
    window.location.href = ROUTES.AUTH.LOGIN;
  };
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-lg">
      <div className="flex h-16 items-center sm:h-20">
        {/* Left: EduCard Logo - Fixed width matching sidebar (Hidden on mobile, shown on desktop) */}
        <div className="hidden w-64 flex-shrink-0 items-center gap-3 px-6 lg:flex">
          <LogoWithText
            size="md"
            textClassName="!text-white"
            className="[&_.text-gray-600]:!text-emerald-100 [&_.text-gray-800]:!text-white [&_.text-teal-600]:!text-white"
          />
        </div>

        {/* Middle: Organization Info - Starts after sidebar on desktop */}
        <div className="flex items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
          {/* Organization Logo */}
          {organizationLogo ? (
            <img
              src={organizationLogo}
              alt={organizationName}
              className="h-8 w-8 flex-shrink-0 rounded-xl bg-white object-cover shadow-lg ring-2 ring-white/30 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
            />
          ) : (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white shadow-lg ring-2 ring-white/30 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
              <Building2 className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </div>
          )}

          {/* Organization Info - Compact on mobile */}
          <div className="flex min-w-0 flex-col">
            <span className="hidden text-[10px] font-medium tracking-wide text-emerald-100 uppercase sm:block sm:text-xs">
              Organization
            </span>
            <span className="truncate text-sm font-bold text-white drop-shadow-sm sm:text-base lg:text-lg">
              {organizationName}
            </span>
          </div>
        </div>

        {/* Right: Search + Notifications + User Profile */}
        <div className="ml-auto flex items-center gap-1.5 px-3 sm:gap-3 sm:px-6">
          {/* Search - Hidden on mobile and tablet, shown on large screens */}
          <div className="relative hidden xl:block">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-600" />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-64 rounded-xl border-0 bg-white/90 pr-4 pl-10 text-sm shadow-lg backdrop-blur-sm transition-all placeholder:text-gray-500 hover:bg-white focus:ring-2 focus:ring-white/50 focus:outline-none"
            />
          </div>

          {/* Notifications - Compact on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-xl text-white backdrop-blur-sm hover:bg-white/20 sm:h-11 sm:w-11"
          >
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            {notificationCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-emerald-500 sm:top-1 sm:right-1 sm:h-5 sm:w-5 sm:text-xs">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>

          {/* User Profile - Show only avatar on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 backdrop-blur-sm transition-all hover:bg-white/20 sm:gap-3 sm:px-3 sm:py-2">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="h-8 w-8 rounded-full object-cover shadow-lg ring-2 ring-white/50 sm:h-9 sm:w-9"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-white/50 sm:h-9 sm:w-9">
                    <span className="text-xs font-bold text-emerald-600 sm:text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* User info - Hidden on mobile, shown on desktop */}
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-semibold text-white drop-shadow-sm">{userName}</p>
                  <p className="text-xs text-emerald-100">{userRole}</p>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-white/80 sm:block sm:h-4 sm:w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="mt-2 w-56 rounded-xl border-0 bg-white shadow-2xl"
            >
              <DropdownMenuLabel className="pb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                onClick={() => navigate(ROUTES.PROFILE)}
                className="mx-1 my-0.5 rounded-lg"
              >
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="mx-1 my-0.5 rounded-lg text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
