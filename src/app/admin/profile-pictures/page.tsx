'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProfilePictureReview {
  id: number;
  user_id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  rejection_reason?: string;
  admin_notes?: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function ProfilePictureReviewPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [pendingReviews, setPendingReviews] = useState<ProfilePictureReview[]>([]);
  const [allReviews, setAllReviews] = useState<ProfilePictureReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [selectedReview, setSelectedReview] = useState<ProfilePictureReview | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.replace('/auth/signin');
      return;
    }
    
    // Check if user is admin
    if (user.role !== 'Admin' && user.role !== 'Super Admin') {
      router.push('/members/profile');
      return;
    }
    
    fetchReviews();
  }, [user, isLoading]);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/profile-pictures');
      
      if (response.ok) {
        const data = await response.json();
        setPendingReviews(data.pendingReviews);
        setAllReviews(data.allReviews);
      } else {
        setError('Failed to load profile picture reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (reviewId: number, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setProcessing(reviewId);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/profile-pictures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          reviewId,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
          adminNotes: adminNotes || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message);
        setSelectedReview(null);
        setRejectionReason('');
        setAdminNotes('');
        fetchReviews(); // Refresh the list
      } else {
        setError(data.error || 'Failed to process review');
      }
    } catch (error) {
      console.error('Error processing review:', error);
      setError('Network error. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (userId: string, filename: string) => {
    if (!confirm('Are you sure you want to delete this profile picture? This action cannot be undone.')) {
      return;
    }

    setProcessing(-1);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/profile-pictures?userId=${userId}&filename=${filename}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message);
        fetchReviews(); // Refresh the list
      } else {
        setError(data.error || 'Failed to delete profile picture');
      }
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      setError('Network error. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reviews...</p>
        </div>
      </div>
    );
  }

  const reviews = activeTab === 'pending' ? pendingReviews : allReviews;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile Picture Reviews</h1>
          <p className="review-gray-600 dark:text-gray-400">Review and manage user profile picture uploads</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending ({pendingReviews.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Reviews
            </button>
          </nav>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {activeTab === 'pending' ? 'No pending reviews' : 'No reviews found'}
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-start space-x-6">
                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    <img
                      src={`/data/users/directory/review/${review.filename}`}
                      alt={`${review.first_name} ${review.last_name}`}
                      className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/default-avatar.png'; // Fallback image
                      }}
                    />
                  </div>

                  {/* Review Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {review.first_name} {review.last_name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{review.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(review.status)}`}>
                        {review.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div>
                        <span className="font-medium">File:</span> {review.original_filename}
                      </div>
                      <div>
                        <span className="font-medium">Size:</span> {formatFileSize(review.file_size)}
                      </div>
                      <div>
                        <span className="font-medium">Uploaded:</span> {new Date(review.uploaded_at).toLocaleDateString()}
                      </div>
                      {review.reviewed_at && (
                        <div>
                          <span className="font-medium">Reviewed:</span> {new Date(review.reviewed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {review.rejection_reason && (
                      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          <span className="font-medium">Rejection reason:</span> {review.rejection_reason}
                        </p>
                      </div>
                    )}

                    {review.admin_notes && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          <span className="font-medium">Admin notes:</span> {review.admin_notes}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {review.status === 'pending' ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleReview(review.id, 'approve')}
                          disabled={processing === review.id}
                          className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          {processing === review.id ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setRejectionReason('');
                            setAdminNotes('');
                          }}
                          disabled={processing === review.id}
                          className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleDelete(review.user_id.toString(), review.filename)}
                          disabled={processing === review.id}
                          className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDelete(review.user_id.toString(), review.filename)}
                          disabled={processing === review.id}
                          className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reject Modal */}
        {selectedReview && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Reject Profile Picture</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Explain why this profile picture is being rejected..."
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Admin Notes (optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Additional notes for internal use..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleReview(selectedReview.id, 'reject');
                  }}
                  disabled={processing === selectedReview.id}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {processing === selectedReview.id ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
