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
      <div className="flex items-center justify-between h-20 px-6">
        {/* Left: EduCard Logo (Fixed width matching sidebar) */}
        <div className="w-64 flex items-center gap-3">
          <LogoWithText size="md" />
        </div>

        {/* Middle: Organization Name */}
        <div className="flex-1 flex items-center gap-4 px-6">
          {/* Organization Logo */}
          {organizationLogo ? (
            <img
              src={organizationLogo}
              alt={organizationName}
              className="h-12 w-12 rounded-lg object-cover ring-2 ring-emerald-200 shadow-sm"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center ring-2 ring-emerald-200 shadow-sm">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          )}

          {/* Organization Info */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Organization
            </span>
            <span className="text-base font-bold text-gray-900">{organizationName}</span>
          </div>
        </div>

        {/* Right: Search + Notifications + User Profile */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-64 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-colors"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 h-11 w-11">
            <Bell className="h-6 w-6 text-gray-600" />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-100"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center ring-2 ring-indigo-100">
                    <span className="text-sm font-bold text-white">
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 hidden lg:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
