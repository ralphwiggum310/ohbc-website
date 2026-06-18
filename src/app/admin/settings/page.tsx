'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Database, Bell, Shield, Palette } from 'lucide-react';

export default function AdminSettings() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace('/auth/signin'); return; }
    if (user.role !== 'Admin' && user.role !== 'Super Admin') { router.replace('/members/dashboard'); return; }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure system settings and preferences.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Connected</div>
            <p className="text-xs text-muted-foreground">
              SQLite database operational
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Email notifications enabled
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Secure</div>
            <p className="text-xs text-muted-foreground">
              JWT authentication active
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Theme</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dark/Light</div>
            <p className="text-xs text-muted-foreground">
              Theme switching enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full justify-start" 
            variant="default"
            onClick={() => router.push('/admin/dashboard')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => router.push('/admin/users')}
          >
            <Shield className="mr-2 h-4 w-4" />
            User Management
          </Button>
          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={() => router.push('/admin/announcements')}
          >
            <Bell className="mr-2 h-4 w-4" />
            Manage Announcements
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
