"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  folder?: string;
  disabled?: boolean;
}

export function ImageUpload({ onImageUploaded, folder = 'logs', disabled = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('ขนาดไฟล์ต้องไม่เกิน 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to MinIO via API
    setUploading(true);
    try {
      // Use API endpoint instead of direct storage call
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && result.url) {
        toast.success('อัปโหลดรูปภาพสำเร็จ');
        onImageUploaded(result.url);
      } else {
        toast.error(result.error || 'อัปโหลดรูปภาพล้มเหลว');
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors ${
            disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              กำลังอัปโหลด...
            </>
          ) : (
            <>
              📷 เลือกรูปภาพ
            </>
          )}
        </label>

        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={clearImage}
            disabled={uploading}
            size="sm"
          >
            ลบรูปภาพ
          </Button>
        )}
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">ตัวอย่างรูปภาพ:</p>
          <div className="relative inline-block">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-xs max-h-48 object-cover rounded-lg border"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-sm">อัปโหลด...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="text-xs text-gray-500">
        <p>• รองรับไฟล์: JPG, PNG, GIF</p>
        <p>• ขนาดไฟล์สูงสุด: 10MB</p>
        <p>• แนะนำขนาดภาพ: 1200x800 พิกเซล</p>
      </div>
    </div>
  );
}

// Alternative simple version for existing forms
export function SimpleImageUpload({ onImageUploaded, currentImageUrl, disabled = false }: {
  onImageUploaded: (imageUrl: string) => void;
  currentImageUrl?: string;
  disabled?: boolean;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ');
      return;
    }

    setUploading(true);
    try {
      // Use API endpoint instead of direct storage call
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'logs');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && result.url) {
        toast.success('อัปโหลดรูปภาพสำเร็จ');
        onImageUploaded(result.url);
      } else {
        toast.error(result.error || 'อัปโหลดรูปภาพล้มเหลว');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      {uploading && (
        <div className="text-sm text-blue-600">กำลังอัปโหลด...</div>
      )}
      
      {currentImageUrl && (
        <div className="mt-2">
          <img
            src={currentImageUrl}
            alt="Current image"
            className="max-w-xs max-h-32 object-cover rounded border"
          />
        </div>
      )}
    </div>
  );
}