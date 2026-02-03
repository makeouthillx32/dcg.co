// components/Docustore/UploadZone/index.tsx
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  UploadIcon, 
  DeviceIcon, 
  CameraIcon, 
  CloseIcon, 
  CheckIcon,
  FileIcon 
} from './icons';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface UploadZoneProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<void>;
  acceptedTypes?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  currentPath?: string;
  className?: string;
}

export default function UploadZone({
  isOpen,
  onClose,
  onUpload,
  acceptedTypes = ['JPEG', 'PNG', 'PDF', 'MP4', 'MOV'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  currentPath = '',
  className = ''
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  }, []);

  // Handle file selection
  const handleFileSelection = useCallback((files: File[]) => {
    const validFiles: UploadFile[] = [];
    
    files.slice(0, maxFiles).forEach((file) => {
      // Validate file size
      if (file.size > maxFileSize) {
        console.warn(`File ${file.name} is too large (${file.size} bytes)`);
        return;
      }

      // Validate file type
      const fileExtension = file.name.split('.').pop()?.toUpperCase();
      if (acceptedTypes.length > 0 && fileExtension && !acceptedTypes.includes(fileExtension)) {
        console.warn(`File type ${fileExtension} not accepted`);
        return;
      }

      validFiles.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'pending'
      });
    });

    setUploadFiles(validFiles);
  }, [maxFileSize, maxFiles, acceptedTypes]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelection(files);
  }, [handleFileSelection]);

  // Handle device upload
  const handleDeviceUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle camera upload
  const handleCameraUpload = useCallback(() => {
    cameraInputRef.current?.click();
  }, []);

  // Remove file from upload queue
  const removeFile = useCallback((fileId: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Remove selected files
  const removeSelected = useCallback(() => {
    setUploadFiles([]);
  }, []);

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      // Update all files to uploading status
      setUploadFiles(prev => 
        prev.map(file => ({ ...file, status: 'uploading' as const }))
      );

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => 
          prev.map(file => {
            if (file.status === 'uploading' && file.progress < 100) {
              const newProgress = Math.min(file.progress + Math.random() * 30, 100);
              return {
                ...file,
                progress: newProgress,
                status: newProgress >= 100 ? 'completed' : 'uploading'
              };
            }
            return file;
          })
        );
      }, 200);

      // Call the actual upload function
      const filesToUpload = uploadFiles.map(uf => uf.file);
      await onUpload(filesToUpload);

      // Clear interval and mark as completed
      clearInterval(progressInterval);
      setUploadFiles(prev => 
        prev.map(file => ({ ...file, progress: 100, status: 'completed' as const }))
      );

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setUploadFiles([]);
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadFiles(prev => 
        prev.map(file => ({ 
          ...file, 
          status: 'error' as const,
          error: 'Upload failed'
        }))
      );
    } finally {
      setIsUploading(false);
    }
  }, [uploadFiles, onUpload, onClose]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className={`upload-zone relative w-full max-w-md rounded-2xl bg-white shadow-2xl ${className}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <DeviceIcon className="h-6 w-6 text-gray-700" />
            <span className="font-medium text-gray-900">My Device</span>
          </div>
          <div className="flex items-center gap-3">
            <CameraIcon className="h-6 w-6 text-gray-500" />
            <span className="text-sm text-gray-600">Take Photo</span>
          </div>
        </div>

        {/* Upload Area */}
        <div className="px-6">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : uploadFiles.length > 0
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-300 bg-gray-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadFiles.length === 0 ? (
              <>
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop or{' '}
                  <button
                    onClick={handleDeviceUpload}
                    className="text-blue-500 hover:underline"
                  >
                    choose file
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  {acceptedTypes.join(', ')} • Max {formatFileSize(maxFileSize)}
                </p>
              </>
            ) : (
              <div className="space-y-3">
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border"
                  >
                    {/* File Icon */}
                    <div className="flex-shrink-0">
                      {uploadFile.status === 'completed' ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <CheckIcon className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                          <FileIcon className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {uploadFile.file.name}
                        </p>
                        <button
                          onClick={() => removeFile(uploadFile.id)}
                          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                          disabled={isUploading}
                        >
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                        {uploadFile.status === 'uploading' && (
                          <span className="text-xs text-blue-600">
                            {Math.round(uploadFile.progress)}%
                          </span>
                        )}
                        {uploadFile.status === 'error' && (
                          <span className="text-xs text-red-600">
                            {uploadFile.error}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {(uploadFile.status === 'uploading' || uploadFile.status === 'completed') && (
                        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              uploadFile.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${uploadFile.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* File Count and Actions */}
        {uploadFiles.length > 0 && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {uploadFiles.length} File{uploadFiles.length !== 1 ? 's' : ''} | 1 Selected
              </span>
              <button
                onClick={removeSelected}
                className="text-blue-500 hover:underline"
                disabled={isUploading}
              >
                Remove selected
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            disabled={uploadFiles.length === 0 || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.map(type => `.${type.toLowerCase()}`).join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  );
}