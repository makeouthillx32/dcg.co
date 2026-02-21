// lib/documents.ts
/**
 * Document & Image Helper Utilities
 * 
 * Fully dynamic - works with any folder structure, no hardcoding.
 * Automatically discovers files and generates URLs.
 */

import { createClient } from '@/utils/supabase/server';
import { createBrowserClient } from '@/utils/supabase/client';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const BUCKET_NAME = 'documents';

if (!SUPABASE_URL) {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_URL is not set');
}

/**
 * Type definitions
 */
export interface DocumentRecord {
  id: string;
  name: string;
  path: string;
  parent_path: string | null;
  type: 'file' | 'folder';
  mime_type: string | null;
  size_bytes: number | null;
  storage_path: string | null;
  bucket_name: string;
  is_public: boolean;
  public_slug: string | null;
  is_public_folder: boolean;
  tags?: string[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get the public URL for a file in Supabase Storage
 * 
 * @param storagePath - The storage_path from your documents table
 * @returns Full public URL to the file
 * 
 * @example
 * const url = getDocumentUrl("public/1771635350827-Roper_106.avif");
 * // Returns: https://xyz.supabase.co/storage/v1/object/public/documents/public/1771635350827-Roper_106.avif
 */
export function getDocumentUrl(storagePath?: string | null): string {
  if (!storagePath) return '';
  
  // Remove leading slash if present
  const cleanPath = storagePath.startsWith('/') ? storagePath.slice(1) : storagePath;
  
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${cleanPath}`;
}

/**
 * Get all documents in a specific folder (server-side)
 * 
 * @param folderPath - Folder path (e.g., "public/", "images/")
 * @returns Array of documents with URLs
 * 
 * @example
 * const publicImages = await getDocumentsByFolder("public/");
 * publicImages.forEach(img => console.log(img.url));
 */
export async function getDocumentsByFolder(folderPath: string) {
  const supabase = await createClient();
  
  const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
  
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .eq('parent_path', normalizedPath)
    .is('deleted_at', null)
    .order('name');
  
  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
  
  return (documents || []).map(doc => ({
    ...doc,
    url: doc.storage_path ? getDocumentUrl(doc.storage_path) : null,
    dimensions: getDimensionsFromTags(doc.tags),
    resolution: getResolution(doc.tags),
  }));
}

/**
 * Get all documents in a specific folder (client-side)
 * 
 * @param folderPath - Folder path (e.g., "public/", "images/")
 * @returns Array of documents with URLs
 */
export async function getDocumentsByFolderClient(folderPath: string) {
  const supabase = createBrowserClient();
  
  const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
  
  const { data: documents, error } = await supabase
    .from('documents')
    .select('*')
    .eq('parent_path', normalizedPath)
    .is('deleted_at', null)
    .order('name');
  
  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
  
  return (documents || []).map(doc => ({
    ...doc,
    url: doc.storage_path ? getDocumentUrl(doc.storage_path) : null,
    dimensions: getDimensionsFromTags(doc.tags),
    resolution: getResolution(doc.tags),
  }));
}

/**
 * Get a single document by ID (server-side)
 * 
 * @param documentId - Document UUID
 * @returns Document with URL or null
 */
export async function getDocumentById(documentId: string) {
  const supabase = await createClient();
  
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .is('deleted_at', null)
    .single();
  
  if (error || !document) {
    console.error('Error fetching document:', error);
    return null;
  }
  
  return {
    ...document,
    url: document.storage_path ? getDocumentUrl(document.storage_path) : null,
    dimensions: getDimensionsFromTags(document.tags),
    resolution: getResolution(document.tags),
  };
}

/**
 * Get a single document by ID (client-side)
 */
export async function getDocumentByIdClient(documentId: string) {
  const supabase = createBrowserClient();
  
  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .is('deleted_at', null)
    .single();
  
  if (error || !document) {
    console.error('Error fetching document:', error);
    return null;
  }
  
  return {
    ...document,
    url: document.storage_path ? getDocumentUrl(document.storage_path) : null,
    dimensions: getDimensionsFromTags(document.tags),
    resolution: getResolution(document.tags),
  };
}

/**
 * Get all public folders (server-side)
 * 
 * @returns Array of public folders
 */
export async function getPublicFolders() {
  const supabase = await createClient();
  
  const { data: folders, error } = await supabase
    .from('documents')
    .select('*')
    .eq('type', 'folder')
    .eq('is_public_folder', true)
    .is('deleted_at', null)
    .order('name');
  
  if (error) {
    console.error('Error fetching public folders:', error);
    return [];
  }
  
  return folders || [];
}

/**
 * Get all folders (server-side)
 * 
 * @returns Array of all folders
 */
export async function getAllFolders() {
  const supabase = await createClient();
  
  const { data: folders, error } = await supabase
    .from('documents')
    .select('*')
    .eq('type', 'folder')
    .is('deleted_at', null)
    .order('name');
  
  if (error) {
    console.error('Error fetching folders:', error);
    return [];
  }
  
  return folders || [];
}

/**
 * Get all images in a folder (server-side)
 * Filters for image mime types only
 * 
 * @param folderPath - Folder path
 * @returns Array of image documents with URLs
 */
export async function getImagesByFolder(folderPath: string) {
  const documents = await getDocumentsByFolder(folderPath);
  return documents.filter(doc => isImage(doc.mime_type));
}

/**
 * Get all images in a folder (client-side)
 */
export async function getImagesByFolderClient(folderPath: string) {
  const documents = await getDocumentsByFolderClient(folderPath);
  return documents.filter(doc => isImage(doc.mime_type));
}

/**
 * Find a document by name in a folder (server-side)
 * 
 * @param folderPath - Folder to search in
 * @param fileName - File name to find
 * @returns Document with URL or null
 */
export async function findDocumentByName(folderPath: string, fileName: string) {
  const documents = await getDocumentsByFolder(folderPath);
  return documents.find(doc => doc.name === fileName) || null;
}

/**
 * Check if a file is an image based on mime type
 */
export function isImage(mimeType?: string | null): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith('image/');
}

/**
 * Check if a file is a PDF
 */
export function isPDF(mimeType?: string | null): boolean {
  return mimeType === 'application/pdf';
}

/**
 * Check if a file is a video
 */
export function isVideo(mimeType?: string | null): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith('video/');
}

/**
 * Check if a file is a document (Word, Excel, etc.)
 */
export function isDocument(mimeType?: string | null): boolean {
  if (!mimeType) return false;
  return (
    mimeType.includes('word') ||
    mimeType.includes('excel') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation') ||
    mimeType === 'application/pdf'
  );
}

/**
 * Get file extension from mime type
 */
export function getExtensionFromMimeType(mimeType?: string | null): string {
  if (!mimeType) return '';
  
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
  };
  
  return mimeToExt[mimeType] || '';
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Parse image dimensions from tags
 * Tags are stored as: ["width:1920", "height:1080", "resolution:1920x1080"]
 */
export function getDimensionsFromTags(tags?: string[] | null): { width: number; height: number } | null {
  if (!tags || tags.length === 0) return null;
  
  let width = 0;
  let height = 0;
  
  tags.forEach(tag => {
    if (tag.startsWith('width:')) {
      width = parseInt(tag.split(':')[1], 10);
    }
    if (tag.startsWith('height:')) {
      height = parseInt(tag.split(':')[1], 10);
    }
  });
  
  if (width && height) {
    return { width, height };
  }
  
  return null;
}

/**
 * Get resolution string from tags
 * Returns something like "1920x1080" or null
 */
export function getResolution(tags?: string[] | null): string | null {
  if (!tags || tags.length === 0) return null;
  
  const resolutionTag = tags.find(tag => tag.startsWith('resolution:'));
  if (resolutionTag) {
    return resolutionTag.split(':')[1];
  }
  
  const dimensions = getDimensionsFromTags(tags);
  if (dimensions) {
    return `${dimensions.width}x${dimensions.height}`;
  }
  
  return null;
}

/**
 * Get file category based on mime type
 * Returns: 'image' | 'video' | 'document' | 'audio' | 'other'
 */
export function getFileCategory(mimeType?: string | null): string {
  if (!mimeType) return 'other';
  
  if (isImage(mimeType)) return 'image';
  if (isVideo(mimeType)) return 'video';
  if (isDocument(mimeType)) return 'document';
  if (mimeType.startsWith('audio/')) return 'audio';
  
  return 'other';
}

/**
 * Generate srcset for responsive images
 * Useful for Next.js Image or responsive img tags
 */
export function generateSrcSet(storagePath: string, widths: number[]): string {
  const baseUrl = getDocumentUrl(storagePath);
  return widths.map(w => `${baseUrl} ${w}w`).join(', ');
}