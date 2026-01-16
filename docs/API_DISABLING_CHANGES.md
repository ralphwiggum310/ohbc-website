# API Disabling Changes

This document outlines the changes made to disable the Bible and Give APIs in the OHBC Lite application.

## Changes Made

### 1. Bible API
- Disabled Bible API by replacing the route handler with a 503 Service Unavailable response
- Updated the BibleReader component to show a maintenance message instead of making API calls
- Removed Bible link from the main navigation
- Updated the Bible page to show a maintenance message
- Cleaned up remaining Bible API key references

### 2. Give/Donation Functionality
- Removed the Give button from the Navbar
- Deleted the DonationModal component
- Removed StripeProvider from the application
- Removed Stripe-related API routes:
  - `create-payment-intent`
  - `create-subscription`
- Removed Stripe-related dependencies from package.json

### 3. Configuration
- Updated Next.js configuration to remove Stripe and Bible API settings
- Simplified Content Security Policy headers
- Removed unused environment variables

## Testing
- Verified that the application runs without errors
- Confirmed that the Bible section shows a maintenance message
- Verified that all donation-related UI elements have been removed
- Checked the browser console for any remaining errors

## Rollback Instructions

If needed, the changes can be reverted by:
1. Restoring the original Bible API route handler
2. Reverting the BibleReader component changes
3. Re-adding the Bible link to the navigation
4. Re-adding the Give button and DonationModal component
5. Re-adding StripeProvider and related components
6. Reinstalling Stripe dependencies
7. Updating the Next.js configuration

## Notes
- The Bible API can be re-enabled by restoring the original API route handler and updating the BibleReader component
- Donation functionality can be re-enabled by restoring the Stripe-related components and configuration
