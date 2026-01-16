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
  const mailto = `mailto:orchardhillsbiblechurch@gmail.com?subject=Prayer Request from OHBC Website&body=Please write your prayer request here.`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Prayer Requests | Orchard Hills Bible Church</title>
        <meta name="description" content="Submit your prayer requests and pray for others at Orchard Hills Bible Church" />
      </Head>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Prayer Request Email Template */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-5">Share Your Prayer Request</h2>
          <div className="max-w-3xl mx-auto p-4 text-center">
            <h1 className="text-2xl font-bold mb-6">Share Your Prayer Request</h1>
            <p className="mb-6">
              To share your prayer request, please click the button below to send us an email using your default mail client.
            </p>
            <a
              href={mailto}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Send Prayer Request Email
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
