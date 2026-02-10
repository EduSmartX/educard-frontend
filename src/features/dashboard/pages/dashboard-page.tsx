import { useEffect, useState } from 'react';
import { authApi, type User } from '@/lib/api/auth-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/ui/loading-spinner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/app-config';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!authApi.isAuthenticated()) {
      navigate(ROUTES.AUTH.LOGIN);
      return;
    }

    // Get user data
    const storedUser = authApi.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setIsLoading(false);
    } else {
      // Fetch from API if not in storage
      authApi
        .getCurrentUser()
        .then((userData) => {
          setUser(userData);
          setIsLoading(false);
        })
        .catch(() => {
          navigate(ROUTES.AUTH.LOGIN);
        });
    }
  }, [navigate]);

  const handleLogout = async () => {
    await authApi.logout();
    navigate(ROUTES.AUTH.LOGIN);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Welcome, {user?.first_name}!</h1>
            <p className="text-muted-foreground mt-2">
              Role: <span className="font-medium capitalize">{user?.role}</span>
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{user?.phone_number || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{user?.date_of_birth || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Overview of your activity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Coming soon...</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No recent activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button>View Students</Button>
              <Button variant="outline">View Teachers</Button>
              <Button variant="outline">View Classes</Button>
              <Button variant="outline">Attendance</Button>
              <Button variant="outline">Reports</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
