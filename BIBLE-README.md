# Bible Reader Integration

This application includes a Bible reader feature that allows users to read and search the Bible in multiple translations.

## Setup Instructions

1. **Get an API Key**
   - Visit [API.Bible](https://scripture.api.bible/) and sign up for a free account
   - Create an API key with the necessary permissions

2. **Configure Environment Variables**
   Create a `.env.local` file in the root of your project (if it doesn't exist) and add your API key:
   ```
   BIBLE_API_KEY=your_api_key_here
   ```

## Features

- Read the Bible in multiple translations (NASB 1995, NKJV, KJV, NIV, ESV)
- Search the entire Bible
- Navigate between chapters and verses
- Responsive design that works on all devices
- Clean, easy-to-read interface

## Available Translations

- NASB 1995 (Default)
- KJV (King James Version)
- NIV (New International Version)
- ESV (English Standard Version)

## Usage

1. Select your preferred translation from the dropdown
2. Choose a book from the Old or New Testament
3. Navigate between chapters using the arrow buttons or by entering a chapter number
4. Use the search bar to find specific verses or topics

## Troubleshooting

- If you see "Failed to load chapter" errors, check your internet connection and API key
- Ensure your API key has the correct permissions
- Check the browser console for detailed error messages
