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
    <header className="sticky top-0 z-30 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 shadow-lg">
      <div className="flex items-center h-16 sm:h-20">
        {/* Left: EduCard Logo - Fixed width matching sidebar (Hidden on mobile, shown on desktop) */}
        <div className="hidden lg:flex w-64 items-center gap-3 px-6 flex-shrink-0">
          <LogoWithText
            size="md"
            textClassName="!text-white"
            className="[&_.text-gray-600]:!text-emerald-100 [&_.text-teal-600]:!text-white [&_.text-gray-800]:!text-white"
          />
        </div>

        {/* Middle: Organization Info - Starts after sidebar on desktop */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 lg:px-8">
          {/* Organization Logo */}
          {organizationLogo ? (
            <img
              src={organizationLogo}
              alt={organizationName}
              className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-xl object-cover ring-2 ring-white/30 shadow-lg flex-shrink-0 bg-white"
            />
          ) : (
            <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-xl bg-white flex items-center justify-center ring-2 ring-white/30 shadow-lg flex-shrink-0">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-emerald-600" />
            </div>
          )}

          {/* Organization Info - Compact on mobile */}
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-xs font-medium text-emerald-100 uppercase tracking-wide hidden sm:block">
              Organization
            </span>
            <span className="text-sm sm:text-base lg:text-lg font-bold text-white truncate drop-shadow-sm">
              {organizationName}
            </span>
          </div>
        </div>

        {/* Right: Search + Notifications + User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 ml-auto px-3 sm:px-6">
          {/* Search - Hidden on mobile and tablet, shown on large screens */}
          <div className="relative hidden xl:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-64 pl-10 pr-4 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm bg-white/90 backdrop-blur-sm hover:bg-white transition-all shadow-lg placeholder:text-gray-500"
            />
          </div>

          {/* Notifications - Compact on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-white/20 h-9 w-9 sm:h-11 sm:w-11 text-white rounded-xl backdrop-blur-sm"
          >
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            {notificationCount > 0 && (
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 flex items-center justify-center h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full ring-2 ring-emerald-500 shadow-lg">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>

          {/* User Profile - Show only avatar on mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-white/50 shadow-lg"
                  />
                ) : (
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-white flex items-center justify-center ring-2 ring-white/50 shadow-lg">
                    <span className="text-xs sm:text-sm font-bold text-emerald-600">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* User info - Hidden on mobile, shown on desktop */}
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-white drop-shadow-sm">{userName}</p>
                  <p className="text-xs text-emerald-100">{userRole}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/80 hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white shadow-2xl border-0 rounded-xl mt-2"
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
                className="rounded-lg mx-1 my-0.5"
              >
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-100" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600 rounded-lg mx-1 my-0.5 focus:bg-red-50"
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
