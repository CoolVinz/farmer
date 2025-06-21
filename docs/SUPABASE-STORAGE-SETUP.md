# Supabase Storage Setup Instructions

This guide explains how to set up the required storage bucket for the durian farm management system's image upload functionality.

## Prerequisites

- Access to your Supabase project dashboard
- Project already connected with the correct environment variables in `.env`

## Setup Steps

### 1. Access Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Navigate to your project dashboard

### 2. Create Storage Bucket

1. In the left sidebar, click on **"Storage"**
2. Click on **"Create bucket"** button
3. Fill in the bucket details:
   - **Name**: `tree-media`
   - **Public bucket**: ✅ **Enable** (checked)
   - **File size limit**: `10 MB` (optional, but recommended)
   - **Allowed MIME types**: `image/*` (optional, but recommended)

4. Click **"Create bucket"**

### 3. Verify Bucket Settings

After creating the bucket, verify these settings:

- **Bucket name**: Must be exactly `tree-media`
- **Public access**: Should be enabled for direct image URLs
- **File upload permissions**: Should allow authenticated uploads

### 4. Test the Setup

After creating the bucket, you can test the setup:

1. Go to your application at `http://localhost:3000/logs/add-single`
2. Try uploading an image using the "📷 รูปภาพ" section
3. The upload should now work without "bucket not found" errors

### 5. Alternative: Check Storage Status

You can check if the bucket exists by visiting:
```
http://localhost:3000/api/storage/status
```

This will return:
```json
{
  "success": true,
  "data": {
    "bucketExists": true,
    "bucketName": "tree-media"
  }
}
```

## Troubleshooting

### "Bucket not found" Error
- Ensure the bucket name is exactly `tree-media`
- Verify the bucket was created in the correct Supabase project
- Check that your `.env` file has the correct Supabase credentials

### Upload Permission Errors
- Ensure the bucket is set as "Public"
- Check that your Supabase anon key has proper permissions
- Verify Row Level Security (RLS) policies if you have custom ones

### File Size Errors
- Default limit is 10MB per file
- Images are automatically validated for type and size
- Supported formats: JPG, PNG, GIF

## Security Notes

- The bucket is set as "public" to allow direct image URLs
- Files are uploaded with unique timestamps to prevent conflicts
- File type validation prevents non-image uploads
- Size limits prevent abuse

## Folder Structure

Images are organized in the bucket as:
```
tree-media/
├── logs/           # Tree maintenance log images
│   ├── 1640995200000-abc123.jpg
│   └── 1640995260000-def456.png
└── harvest/        # Harvest log images (future use)
    └── ...
```

## Integration

Once the bucket is created, the following components will work:

- **Single Tree Logging** (`/logs/add-single`) - Image uploads for maintenance logs
- **Harvest Logging** (`/trees/[id]/harvest/add`) - Image uploads for harvest records
- **Gallery** (`/gallery`) - Display of uploaded images
- **Tree Details** - Image display in tree information pages

The application will automatically:
- Validate file types and sizes
- Generate unique filenames
- Provide upload progress feedback
- Display images with proper URLs
- Handle upload errors gracefully