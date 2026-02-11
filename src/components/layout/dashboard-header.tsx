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
    window.history.pushState(null, '', ROUTES.AUTH.LOGIN);
    window.history.replaceState(null, '', ROUTES.AUTH.LOGIN);
    navigate(ROUTES.AUTH.LOGIN, { replace: true });
  };
  return (
    <header className="sticky top-0 z-30 bg-emerald-50 border-b border-emerald-100 shadow-sm rounded-b-2xl">
      <div className="flex items-center justify-between h-16 sm:h-20 px-3 sm:px-6">
        {/* Left: EduCard Logo (Hidden on mobile, shown on desktop) */}
        <div className="hidden lg:flex w-64 items-center gap-3">
          <LogoWithText size="md" />
        </div>

        {/* Left/Center: Organization Info (Full width on mobile, centered on tablet/desktop) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 lg:flex-initial lg:px-6">
          {/* Organization Logo */}
          {organizationLogo ? (
            <img
              src={organizationLogo}
              alt={organizationName}
              className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-lg object-cover ring-2 ring-emerald-200 shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center ring-2 ring-emerald-200 shadow-sm flex-shrink-0">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </div>
          )}

          {/* Organization Info - Compact on mobile */}
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:block">
              Organization
            </span>
            <span className="text-sm sm:text-base font-bold text-gray-900 truncate">
              {organizationName}
            </span>
          </div>
        </div>

        {/* Right: Search + Notifications + User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Search - Hidden on mobile and tablet, shown on large screens */}
          <div className="relative hidden xl:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-64 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors"
            />
          </div>

          {/* Notifications - Compact on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gray-100 h-9 w-9 sm:h-11 sm:w-11"
          >
            <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 flex items-center justify-center h-3.5 w-3.5 sm:h-4 sm:w-4 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>

          {/* User Profile - Show only avatar on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 sm:gap-3 px-1.5 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 transition-colors">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                ) : (
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-indigo-600 flex items-center justify-center ring-2 ring-indigo-100">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* User info - Hidden on mobile, shown on desktop */}
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white shadow-2xl border-2 border-gray-200"
            >
              <DropdownMenuLabel>
                <div>
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
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
