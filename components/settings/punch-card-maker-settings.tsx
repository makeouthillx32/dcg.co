// components/settings/punch-card-maker-settings.tsx
"use client";

import React, { useState, useRef } from 'react';
import { useTemplateStorage, type TemplateUpload } from '@/hooks/useTemplateStorage';

interface UploadedFile {
  file: File;
  preview: string;
  categories: string[];
  customName: string;
  description: string;
}

const PunchCardMakerSettings: React.FC = () => {
  const [uploadFiles, setUploadFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    templates,
    uploadTemplate,
    uploadMultipleTemplates,
    refreshTemplates,
    isLoading
  } = useTemplateStorage();

  // Template requirements
  const REQUIRED_WIDTH = 1088;
  const REQUIRED_HEIGHT = 638;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

  // Available categories
  const availableCategories = [
    'vintage', 'modern', 'professional', 'creative',
    'minimal', 'colorful', 'elegant', 'playful',
    'corporate', 'artistic'
  ];

  const validateImage = (file: File): Promise<{ isValid: boolean; error?: string; dimensions?: { width: number; height: number } }> => {
    return new Promise((resolve) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        resolve({ isValid: false, error: 'File must be PNG, JPG, JPEG, or WebP' });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        resolve({ isValid: false, error: 'File size must be less than 5MB' });
        return;
      }

      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        
        if (width !== REQUIRED_WIDTH || height !== REQUIRED_HEIGHT) {
          resolve({ 
            isValid: false, 
            error: `Image must be exactly ${REQUIRED_WIDTH}×${REQUIRED_HEIGHT}px (current: ${width}×${height}px)`,
            dimensions: { width, height }
          });
          return;
        }

        resolve({ isValid: true, dimensions: { width, height } });
      };

      img.onerror = () => {
        resolve({ isValid: false, error: 'Invalid image file' });
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadError(null);
    setUploadSuccess(null);

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const validation = await validateImage(file);
      
      if (!validation.isValid) {
        setUploadError(`${file.name}: ${validation.error}`);
        continue;
      }

      const preview = URL.createObjectURL(file);
      
      newFiles.push({
        file,
        preview,
        categories: ['modern'], // Default category
        customName: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        description: `Uploaded template: ${file.name}`
      });
    }

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const updateFileSettings = (index: number, updates: Partial<UploadedFile>) => {
    setUploadFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, ...updates } : file
    ));
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const toggleCategory = (fileIndex: number, category: string) => {
    setUploadFiles(prev => prev.map((file, i) => {
      if (i === fileIndex) {
        const categories = file.categories.includes(category)
          ? file.categories.filter(c => c !== category)
          : [...file.categories, category];
        return { ...file, categories };
      }
      return file;
    }));
  };

  const handleUploadAll = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const uploads: TemplateUpload[] = uploadFiles.map(file => ({
        file: file.file,
        categories: file.categories,
        customName: file.customName,
        description: file.description
      }));

      const results = await uploadMultipleTemplates(uploads);
      
      if (results.length === uploadFiles.length) {
        setUploadSuccess(`Successfully uploaded ${results.length} template(s)!`);
        
        // Clean up previews and reset
        uploadFiles.forEach(file => URL.revokeObjectURL(file.preview));
        setUploadFiles([]);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        await refreshTemplates();
      } else {
        setUploadError(`Only ${results.length} of ${uploadFiles.length} files uploaded successfully`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="space-y-6"
      style={{ 
        fontFamily: 'var(--font-sans)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header */}
      <div>
        <h2 
          className="text-xl font-semibold mb-2"
          style={{ 
            color: 'hsl(var(--foreground))',
            fontFamily: 'var(--font-sans)'
          }}
        >
          Upload Punch Card Templates
        </h2>
        <p 
          className="text-sm"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Upload custom punch card templates to your library. Templates must meet specific requirements.
        </p>
      </div>

      {/* Requirements */}
      <div 
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: 'hsl(var(--muted) / 0.3)',
          borderColor: 'hsl(var(--border))',
          borderRadius: 'var(--radius)'
        }}
      >
        <h3 
          className="font-medium mb-2"
          style={{ 
            color: 'hsl(var(--foreground))',
            fontFamily: 'var(--font-sans)'
          }}
        >
          📐 Template Requirements
        </h3>
        <ul 
          className="text-sm space-y-1"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          <li>• <strong>Dimensions:</strong> Exactly {REQUIRED_WIDTH}×{REQUIRED_HEIGHT} pixels</li>
          <li>• <strong>File types:</strong> PNG, JPG, JPEG, or WebP</li>
          <li>• <strong>File size:</strong> Maximum 5MB per file</li>
          <li>• <strong>Design:</strong> Should work well as a printable punch card</li>
        </ul>
      </div>

      {/* Upload Area */}
      <div 
        className="border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200"
        style={{
          borderColor: 'hsl(var(--border))',
          borderRadius: 'var(--radius)',
          backgroundColor: 'hsl(var(--card))'
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = 'hsl(var(--primary))';
          e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.05)';
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = 'hsl(var(--border))';
          e.currentTarget.style.backgroundColor = 'hsl(var(--card))';
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = 'hsl(var(--border))';
          e.currentTarget.style.backgroundColor = 'hsl(var(--card))';
          handleFileSelect(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={isUploading}
        />
        
        <div 
          className="mb-4"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          📤
        </div>
        
        <h3 
          className="font-medium mb-2"
          style={{ 
            color: 'hsl(var(--foreground))',
            fontFamily: 'var(--font-sans)'
          }}
        >
          Drop files here or click to browse
        </h3>
        
        <p 
          className="text-sm mb-4"
          style={{ color: 'hsl(var(--muted-foreground))' }}
        >
          Select multiple files to upload them all at once
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 rounded transition-all duration-200"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-sans)',
            opacity: isUploading ? 0.6 : 1,
            cursor: isUploading ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!isUploading) {
              e.currentTarget.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (!isUploading) {
              e.currentTarget.style.opacity = '1';
            }
          }}
        >
          {isUploading ? 'Uploading...' : 'Browse Files'}
        </button>
      </div>

      {/* File Preview List */}
      {uploadFiles.length > 0 && (
        <div>
          <h3 
            className="font-medium mb-4"
            style={{ 
              color: 'hsl(var(--foreground))',
              fontFamily: 'var(--font-sans)'
            }}
          >
            Files to Upload ({uploadFiles.length})
          </h3>
          
          <div className="space-y-4">
            {uploadFiles.map((uploadFile, index) => (
              <div
                key={index}
                className="border rounded-lg p-4"
                style={{
                  borderColor: 'hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                  borderRadius: 'var(--radius)'
                }}
              >
                <div className="flex items-start space-x-4">
                  {/* Preview */}
                  <div 
                    className="w-24 h-14 rounded border overflow-hidden flex-shrink-0"
                    style={{
                      backgroundColor: 'hsl(var(--muted) / 0.3)',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'calc(var(--radius) - 2px)'
                    }}
                  >
                    <img
                      src={uploadFile.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 space-y-3">
                    {/* Name */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-1"
                        style={{ 
                          color: 'hsl(var(--foreground))',
                          fontFamily: 'var(--font-sans)'
                        }}
                      >
                        Template Name
                      </label>
                      <input
                        type="text"
                        value={uploadFile.customName}
                        onChange={(e) => updateFileSettings(index, { customName: e.target.value })}
                        className="w-full px-3 py-2 border rounded text-sm"
                        style={{
                          backgroundColor: 'hsl(var(--input))',
                          borderColor: 'hsl(var(--border))',
                          color: 'hsl(var(--foreground))',
                          borderRadius: 'var(--radius)',
                          fontFamily: 'var(--font-sans)'
                        }}
                      />
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-1"
                        style={{ 
                          color: 'hsl(var(--foreground))',
                          fontFamily: 'var(--font-sans)'
                        }}
                      >
                        Description
                      </label>
                      <input
                        type="text"
                        value={uploadFile.description}
                        onChange={(e) => updateFileSettings(index, { description: e.target.value })}
                        className="w-full px-3 py-2 border rounded text-sm"
                        style={{
                          backgroundColor: 'hsl(var(--input))',
                          borderColor: 'hsl(var(--border))',
                          color: 'hsl(var(--foreground))',
                          borderRadius: 'var(--radius)',
                          fontFamily: 'var(--font-sans)'
                        }}
                      />
                    </div>
                    
                    {/* Categories */}
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2"
                        style={{ 
                          color: 'hsl(var(--foreground))',
                          fontFamily: 'var(--font-sans)'
                        }}
                      >
                        Categories (select multiple)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {availableCategories.map(category => (
                          <button
                            key={category}
                            onClick={() => toggleCategory(index, category)}
                            className="px-3 py-1 text-xs rounded capitalize transition-all duration-200"
                            style={{
                              backgroundColor: uploadFile.categories.includes(category)
                                ? 'hsl(var(--primary))'
                                : 'hsl(var(--secondary))',
                              color: uploadFile.categories.includes(category)
                                ? 'hsl(var(--primary-foreground))'
                                : 'hsl(var(--secondary-foreground))',
                              borderRadius: 'var(--radius)',
                              border: '1px solid hsl(var(--border))',
                              fontFamily: 'var(--font-sans)'
                            }}
                            onMouseEnter={(e) => {
                              if (!uploadFile.categories.includes(category)) {
                                e.currentTarget.style.opacity = '0.8';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!uploadFile.categories.includes(category)) {
                                e.currentTarget.style.opacity = '1';
                              }
                            }}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 rounded transition-all duration-200"
                    style={{
                      color: 'hsl(var(--destructive))',
                      backgroundColor: 'hsl(var(--destructive) / 0.1)',
                      borderRadius: 'var(--radius)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'hsl(var(--destructive) / 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'hsl(var(--destructive) / 0.1)';
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Actions */}
      {uploadFiles.length > 0 && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              uploadFiles.forEach(file => URL.revokeObjectURL(file.preview));
              setUploadFiles([]);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
            disabled={isUploading}
            className="px-4 py-2 border rounded transition-all duration-200"
            style={{
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--muted-foreground))',
              backgroundColor: 'hsl(var(--secondary))',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-sans)',
              opacity: isUploading ? 0.6 : 1,
              cursor: isUploading ? 'not-allowed' : 'pointer'
            }}
          >
            Clear All
          </button>
          
          <button
            onClick={handleUploadAll}
            disabled={isUploading || uploadFiles.length === 0}
            className="px-6 py-2 rounded font-medium transition-all duration-200"
            style={{
              backgroundColor: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-sans)',
              opacity: isUploading || uploadFiles.length === 0 ? 0.6 : 1,
              cursor: isUploading || uploadFiles.length === 0 ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!isUploading && uploadFiles.length > 0) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUploading && uploadFiles.length > 0) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            {isUploading ? 'Uploading...' : `Upload ${uploadFiles.length} Template(s)`}
          </button>
        </div>
      )}

      {/* Status Messages */}
      {uploadError && (
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: 'hsl(var(--destructive) / 0.1)',
            borderColor: 'hsl(var(--destructive))',
            color: 'hsl(var(--destructive))',
            borderRadius: 'var(--radius)'
          }}
        >
          <h4 className="font-medium mb-1">Upload Error</h4>
          <p className="text-sm">{uploadError}</p>
        </div>
      )}

      {uploadSuccess && (
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: 'hsl(var(--accent) / 0.1)',
            borderColor: 'hsl(var(--accent))',
            color: 'hsl(var(--accent-foreground))',
            borderRadius: 'var(--radius)'
          }}
        >
          <h4 className="font-medium mb-1">Upload Successful</h4>
          <p className="text-sm">{uploadSuccess}</p>
        </div>
      )}

      {/* Library Stats */}
      <div 
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: 'hsl(var(--muted) / 0.3)',
          borderColor: 'hsl(var(--border))',
          borderRadius: 'var(--radius)'
        }}
      >
        <h3 
          className="font-medium mb-2"
          style={{ 
            color: 'hsl(var(--foreground))',
            fontFamily: 'var(--font-sans)'
          }}
        >
          📊 Template Library
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div 
              className="font-medium"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Total Templates
            </div>
            <div 
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {isLoading ? 'Loading...' : `${templates.length} available`}
            </div>
          </div>
          <div>
            <div 
              className="font-medium"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Standard Size
            </div>
            <div 
              style={{ color: 'hsl(var(--muted-foreground))' }}
            >
              {REQUIRED_WIDTH}×{REQUIRED_HEIGHT}px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PunchCardMakerSettings;