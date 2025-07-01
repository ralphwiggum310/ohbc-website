'use client';

import { useState } from 'react';
import Head from 'next/head';

type PrayerRequest = {
  id: string;
  name: string;
  request: string;
  date: string;
  isPublic: boolean;
};

export default function PrayerRequestsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    request: '',
    isPublic: true,
    contactMe: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [publicRequests, setPublicRequests] = useState<PrayerRequest[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, you would send this data to your backend
      // const response = await fetch('/api/prayer-requests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // For demo purposes, we'll just add it to the local state
      const newRequest: PrayerRequest = {
        id: Date.now().toString(),
        name: formData.name || 'Anonymous',
        request: formData.request,
        date: new Date().toLocaleDateString(),
        isPublic: formData.isPublic
      };
      
      if (formData.isPublic) {
        setPublicRequests(prev => [newRequest, ...prev]);
      }
      
      setFormData({
        name: '',
        email: '',
        request: '',
        isPublic: true,
        contactMe: false
      });
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting prayer request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Prayer Requests | Orchard Hills Bible Church</title>
        <meta name="description" content="Submit your prayer requests and pray for others at Orchard Hills Bible Church" />
      </Head>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 py-6 sm:py-8 md:py-10">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Prayer Requests</h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl mx-auto">
            Share your prayer requests with our church family. We're here to pray with you.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Prayer Request Form */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-5">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-5">Submit a Prayer Request</h2>
            
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
                Thank you for sharing your prayer request. Our church family will be praying for you.
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5">
                    Your Name (optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="request" className="block text-xs sm:text-sm font-medium text-gray-700 mb-0.5">
                  Your Prayer Request *
                </label>
                <textarea
                  id="request"
                  name="request"
                  rows={4}
                  value={formData.request}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                  placeholder="Please share your prayer request..."
                  required
                />
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start">
                  <div className="flex items-start mt-0.5">
                    <input
                      id="isPublic"
                      name="isPublic"
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={handleChange}
                      className="h-3.5 w-3.5 mt-0.5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-2">
                    <label htmlFor="isPublic" className="block text-xs sm:text-sm font-medium text-gray-700">
                      Share this request with the church family
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      If checked, your request may be shared with our prayer team and church family (your name will be hidden if not provided).
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-start mt-0.5">
                    <input
                      id="contactMe"
                      name="contactMe"
                      type="checkbox"
                      checked={formData.contactMe}
                      onChange={handleChange}
                      className="h-3.5 w-3.5 mt-0.5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-2">
                    <label htmlFor="contactMe" className="block text-xs sm:text-sm font-medium text-gray-700">
                      A pastor may contact me about this request
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Check this box if you'd like someone to reach out to you.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-xs sm:text-sm font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Prayer Request'}
                </button>
              </div>
            </form>
          </div>
          
          {/* Public Prayer Requests */}
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-5">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">Prayer Requests</h2>
              <p className="text-xs text-gray-500">
                {publicRequests.length} {publicRequests.length === 1 ? 'request' : 'requests'}
              </p>
            </div>
            
            {publicRequests.length > 0 ? (
              <div className="space-y-6">
                {publicRequests.map((request) => (
                  <div key={request.id} className="border-l-2 border-red-600 pl-2 sm:pl-3 py-1.5 mb-2 last:mb-0">
                    <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line">{request.request}</p>
                    <div className="mt-1 flex items-center text-2xs sm:text-xs text-gray-500">
                      <span>{request.name}</span>
                      <span className="mx-1 sm:mx-1.5">•</span>
                      <span>{request.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No public prayer requests at this time.</p>
                <p className="text-gray-400 text-sm mt-2">Be the first to share a request.</p>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                All prayer requests are subject to review before being made public.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
