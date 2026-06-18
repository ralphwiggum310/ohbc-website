'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, 
  Calendar, 
  Users, 
  FileText, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface AnalyticsData {
  visitors: {
    totalVisits: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgTimeOnSite: number;
  };
  pages: {
    totalPages: number;
    topPages: Array<{
      url: string;
      visits: number;
      title: string;
    }>;
  };
  devices: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  referrers: {
    totalReferrers: number;
    topReferrers: Array<{
      url: string;
      visits: number;
    }>;
  };
  lastUpdated: string;
}

interface DashboardStats {
  totalAnnouncements: number;
  totalSchedules: number;
  totalPrayerRequests: number;
  totalUsers: number;
  pendingUserReviews: number;
  recentActivity: Array<{
    id: string;
    type: 'announcement' | 'schedule' | 'prayer_request';
    title: string;
    timestamp: string;
    status: 'published' | 'draft' | 'pending';
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = !authLoading && !!user && (user.role === 'Admin' || user.role === 'Super Admin');
  const [stats, setStats] = useState<DashboardStats>({
    totalAnnouncements: 0,
    totalSchedules: 0,
    totalPrayerRequests: 0,
    totalUsers: 0,
    pendingUserReviews: 0,
    recentActivity: []
  });
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    visitors: { totalVisits: 0, uniqueVisitors: 0, bounceRate: 0, avgTimeOnSite: 0 },
    pages: { totalPages: 0, topPages: [] },
    devices: { desktop: 0, mobile: 0, tablet: 0 },
    referrers: { totalReferrers: 0, topReferrers: [] },
    lastUpdated: ''
  });
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/auth/signin'); return; }
    if (user.role !== 'Admin' && user.role !== 'Super Admin') {
      router.replace('/members/dashboard'); return;
    }

    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        const data = await response.json();
        if (data.error) {
          setAnalyticsError(data.error);
        } else {
          setAnalytics(data);
          setAnalyticsError(null);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        setAnalyticsError('Failed to load analytics data');
      }
    };

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        setStats({
          totalAnnouncements: data.totalAnnouncements || 0,
          totalSchedules: data.totalSchedules || 0,
          totalPrayerRequests: data.totalPrayerRequests || 0,
          totalUsers: data.totalUsers || 0,
          pendingUserReviews: data.pendingUserReviews || 0,
          recentActivity: data.recentActivity || []
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    fetchAnalytics();
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-blue-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'prayer_request':
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to Orchard Hills Bible Church admin panel.
        </p>
      </div>

      {/* Analytics Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Analytics Overview</h2>
        {analyticsError ? (
          <Card className="col-span-full">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span>{analyticsError}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.visitors.totalVisits.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.visitors.uniqueVisitors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.visitors.bounceRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Time on Site</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(analytics.visitors.avgTimeOnSite)}s</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Detailed Analytics Grid */}
      {!analyticsError && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Pages */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>
                Most visited pages in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.pages.topPages.length > 0 ? (
                  analytics.pages.topPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {page.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {page.url}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-gray-600 dark:text-gray-300 ml-4">
                        {page.visits.toLocaleString()} visits
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No page data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>
                Visitor devices in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Desktop</span>
                  <span className="text-sm font-semibold">{analytics.devices.desktop.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mobile</span>
                  <span className="text-sm font-semibold">{analytics.devices.mobile.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tablet</span>
                  <span className="text-sm font-semibold">{analytics.devices.tablet.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Button 
            className="w-full justify-start h-12 py-2" 
            variant="outline"
            onClick={() => router.push('/admin/announcements')}
          >
            <Megaphone className="mr-2 h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Manage Announcements</span>
              <span className="text-xs text-muted-foreground">({stats.totalAnnouncements})</span>
            </div>
          </Button>
          <Button 
            className="w-full justify-start h-12 py-2" 
            variant="outline"
            onClick={() => router.push('/admin/events')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Manage Schedules</span>
              <span className="text-xs text-muted-foreground">({stats.totalSchedules})</span>
            </div>
          </Button>
          <Button 
            className="w-full justify-start h-12 py-2" 
            variant="outline"
            onClick={() => router.push('/admin/prayer-requests')}
          >
            <Users className="mr-2 h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Review Prayer Requests</span>
              <span className="text-xs text-muted-foreground">({stats.totalPrayerRequests})</span>
            </div>
          </Button>
          <Button 
            className="w-full justify-start h-12 py-2" 
            variant="outline"
            onClick={() => router.push('/admin/users')}
          >
            <Users className="mr-2 h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">User Management</span>
              <span className="text-xs text-muted-foreground">({stats.pendingUserReviews || 0})</span>
            </div>
          </Button>
          <Button 
            className="w-full justify-start h-12 py-2" 
            variant="outline"
            onClick={() => router.push('/admin/directory')}
          >
            <Users className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium">Directory Management</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates across all content types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity?.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.timestamp}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusIcon(activity.status)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No recent activity to display
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
