'use client';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  useDocuments,
  useFileUpload,
  useFolderFavorites,
} from '@/hooks/useDocuments';
import { usePublicFolders } from '@/hooks/usePublicFolders';
import Toolbar from './Toolbar';
import ContextMenu from './ContextMenu';
import Preview from './Preview';
import FavoritesBar from './FavoritesBar';
import FileGrid from './FileGrid';

interface DocumentsProps {
  className?: string;
}

const debounce = (fn: Function, delay = 300) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export default function Documents({ className = '' }: DocumentsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    documentId: string;
  } | null>(null);
  const [previewDocument, setPreviewDocument] = useState<string | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Additional state for toolbar functionality
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // ALWAYS call hooks first, no matter what
  const {
    documents,
    loading,
    error,
    currentPath,
    navigateToFolder,
    createFolder,
    updateDocument,
    deleteDocument,
    searchDocuments,
    fetchDocuments,
  } = useDocuments();

  const { uploadFiles, isUploading } = useFileUpload();
  const { favorites, addFavorite, removeFavorite } = useFolderFavorites();
  const { 
    makefolderPublic, 
    makeFolderPrivate, 
    copyFolderUrl, 
    generateUsageExample,
    getPublicAssetUrl 
  } = usePublicFolders();

  useEffect(() => {
    if (!loading && isInitialLoading) {
      setIsInitialLoading(false);
    }
  }, [loading, isInitialLoading]);

  const debouncedSearch = useCallback(
    debounce(async (query: string, path: string) => {
      setIsSearching(true);
      try {
        if (query.trim()) {
          await searchDocuments(query, path);
        } else {
          await fetchDocuments();
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [searchDocuments, fetchDocuments]
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      debouncedSearch(query, currentPath);
    },
    [debouncedSearch, currentPath]
  );

  const handleNavigate = useCallback(
    async (path: string) => {
      setIsNavigating(true);
      try {
        await navigateToFolder(path);
      } catch (error) {
        console.error('Navigation error:', error);
      } finally {
        setIsNavigating(false);
      }
    },
    [navigateToFolder]
  );

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      try {
        await uploadFiles(files, currentPath);
        await fetchDocuments();
      } catch (error) {
        console.error('Upload failed:', error);
      }
    },
    [uploadFiles, currentPath, fetchDocuments]
  );

  const handleCreateFolder = useCallback(
    async () => {
      console.log('🎯 Documents handleCreateFolder called');
      
      // Show prompt to get folder name
      const folderName = prompt('Enter folder name:');
      
      // Validate folder name
      if (!folderName || folderName.trim().length === 0) {
        console.log('❌ User cancelled or provided empty folder name');
        return;
      }
      
      const safeFolderName = folderName.trim();
      console.log('🎯 Creating folder:', {
        folderName: safeFolderName,
        currentPath,
        currentPathType: typeof currentPath
      });
      
      // Ensure currentPath is a string
      const safeCurrentPath = typeof currentPath === 'string' ? currentPath : '';
      
      try {
        console.log('🎯 Calling createFolder with safe values:', {
          folderName: safeFolderName,
          parentPath: safeCurrentPath
        });
        
        await createFolder(safeFolderName, safeCurrentPath || undefined);
        console.log('✅ Folder created successfully');
        toast.success(`Folder "${safeFolderName}" created successfully`);
        
        // Refresh the documents list
        await fetchDocuments();
      } catch (error) {
        console.error('❌ Failed to create folder:', error);
        toast.error('Failed to create folder');
      }
    },
    [createFolder, currentPath, fetchDocuments]
  );

  // Public folder handlers
  const handleMakePublic = useCallback(async (documentId: string) => {
    console.log('🎯 Making folder public:', documentId);
    try {
      await makefolderPublic(documentId);
      toast.success('Folder made public successfully');
      await fetchDocuments(); // Refresh to get updated data
    } catch (error) {
      console.error('❌ Failed to make folder public:', error);
      toast.error('Failed to make folder public');
    }
  }, [makefolderPublic, fetchDocuments]);

  const handleMakePrivate = useCallback(async (documentId: string) => {
    console.log('🎯 Making folder private:', documentId);
    try {
      await makeFolderPrivate(documentId);
      toast.success('Folder made private successfully');
      await fetchDocuments(); // Refresh to get updated data
    } catch (error) {
      console.error('❌ Failed to make folder private:', error);
      toast.error('Failed to make folder private');
    }
  }, [makeFolderPrivate, fetchDocuments]);

  const handleCopyPublicUrl = useCallback((publicSlug: string) => {
    console.log('🎯 Copying public URL for slug:', publicSlug);
    try {
      copyFolderUrl(publicSlug);
      toast.success('Public URL copied to clipboard');
    } catch (error) {
      console.error('❌ Failed to copy URL:', error);
      toast.error('Failed to copy URL');
    }
  }, [copyFolderUrl]);

  const handleGenerateCode = useCallback((publicSlug: string) => {
    console.log('🎯 Generating code for slug:', publicSlug);
    try {
      const code = generateUsageExample(publicSlug);
      navigator.clipboard.writeText(code);
      toast.success('Code snippet copied to clipboard');
    } catch (error) {
      console.error('❌ Failed to generate code:', error);
      toast.error('Failed to generate code');
    }
  }, [generateUsageExample]);

  const handleDocumentAction = useCallback(
    async (action: string, documentId: string) => {
      console.log('🎯 Document action triggered:', { action, documentId });
      const document = documents.find((d) => d.id === documentId);
      if (!document) {
        console.error('❌ Document not found for action:', documentId);
        return;
      }
      
      try {
        switch (action) {
          case 'preview':
            console.log('👁️ Opening preview for:', document.name);
            setPreviewDocument(documentId);
            break;
          case 'download':
            console.log('⬇️ Downloading:', document.name);
            window.open(`/api/documents/${documentId}/download`, '_blank');
            break;
          case 'favorite':
            console.log('⭐ Toggling favorite for:', document.name);
            await updateDocument(documentId, {
              is_favorite: !document.is_favorite,
            });
            break;
          case 'delete':
            console.log('🗑️ Attempting to delete:', document.name);
            if (confirm(`Are you sure you want to delete "${document.name}"?`)) {
              await deleteDocument(documentId);
            }
            break;
          case 'edit':
            console.log('✏️ Editing:', document.name);
            const newName = prompt('Enter new name:', document.name);
            if (newName && newName !== document.name) {
              await updateDocument(documentId, { name: newName });
            }
            break;
          default:
            console.log('❓ Unknown action:', action);
        }
      } catch (error) {
        console.error(`❌ Failed to ${action} document:`, error);
      }
      
      // Always close context menu after action
      setContextMenu(null);
    },
    [documents, updateDocument, deleteDocument]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, documentId: string) => {
      console.log('🎯 Context menu triggered:', { 
        documentId, 
        clientX: e.clientX, 
        clientY: e.clientY,
        button: e.button,
        type: e.type 
      });
      
      e.preventDefault();
      e.stopPropagation();
      
      // Find the document to make sure it exists
      const document = documents.find(d => d.id === documentId);
      if (!document) {
        console.error('❌ Document not found for context menu:', documentId);
        return;
      }
      
      console.log('✅ Setting context menu state for:', document.name);
      
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        documentId,
      });
    },
    [documents]
  );

  const handleSelect = useCallback((id: string, isMulti: boolean) => {
    console.log('🎯 Selection triggered:', { id, isMulti });
    setSelectedItems((prev) =>
      isMulti
        ? prev.includes(id)
          ? prev.filter((item) => item !== id)
          : [...prev, id]
        : [id]
    );
  }, []);

  // Toolbar handlers
  const handleSortChange = useCallback((newSortBy: 'name' | 'date' | 'size' | 'type', newSortOrder: 'asc' | 'desc') => {
    console.log('🎯 Sort changed:', { newSortBy, newSortOrder });
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    // TODO: Implement actual sorting logic here
    // For now, just log the change
  }, []);

  const handleToggleFavorites = useCallback(() => {
    console.log('🎯 Toggle favorites filter:', !showFavoritesOnly);
    setShowFavoritesOnly(prev => !prev);
    
    // TODO: Implement favorites filtering logic here
    // For now, just toggle the state
  }, [showFavoritesOnly]);

  const handleClearSelection = useCallback(() => {
    console.log('🎯 Clearing selection');
    setSelectedItems([]);
  }, []);

  const handleSelectAll = useCallback(() => {
    console.log('🎯 Selecting all documents');
    setSelectedItems(documents.map(doc => doc.id));
  }, [documents]);

  const handleRefresh = useCallback(async () => {
    console.log('🎯 Refreshing documents');
    try {
      await fetchDocuments();
    } catch (error) {
      console.error('❌ Failed to refresh:', error);
    }
  }, [fetchDocuments]);

  const fileGridHandlers = useMemo(
    () => ({
      onPreview: (id: string) => {
        console.log('🎯 Preview handler called:', id);
        setPreviewDocument(id);
      },
      onDownload: (id: string) => {
        console.log('🎯 Download handler called:', id);
        handleDocumentAction('download', id);
      },
      onToggleFavorite: (id: string) => {
        console.log('🎯 Favorite handler called:', id);
        handleDocumentAction('favorite', id);
      },
      onNavigate: handleNavigate,
      onAddFavorite: addFavorite,
      onContextMenu: handleContextMenu,
      onSelect: handleSelect,
    }),
    [handleDocumentAction, handleNavigate, addFavorite, handleContextMenu, handleSelect]
  );

  const favoriteItems = useMemo(
    () =>
      favorites.map((fav) => ({
        id: fav.id,
        name: fav.folder_name,
        path: fav.folder_path,
        type: 'folder' as const,
        isPinned: false,
        created_at: fav.created_at,
      })),
    [favorites]
  );

  const previewDoc = useMemo(
    () => previewDocument && documents.find((d) => d.id === previewDocument),
    [previewDocument, documents]
  );

  // Filter documents based on favorites filter
  const filteredDocuments = useMemo(() => {
    if (showFavoritesOnly) {
      return documents.filter(doc => doc.is_favorite);
    }
    return documents;
  }, [documents, showFavoritesOnly]);

  // Sort documents
  const sortedDocuments = useMemo(() => {
    const sorted = [...filteredDocuments].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'size':
          comparison = (a.size_bytes || 0) - (b.size_bytes || 0);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredDocuments, sortBy, sortOrder]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking on the context menu itself
      const target = e.target as HTMLElement;
      if (target.closest('.context-menu')) {
        return;
      }
      
      console.log('🎯 Closing context menu due to outside click');
      setContextMenu(null);
    };

    if (contextMenu) {
      console.log('✅ Adding outside click listener');
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [contextMenu]);

  // Debug context menu state
  useEffect(() => {
    if (contextMenu) {
      console.log('🎯 Context menu state updated:', contextMenu);
      const document = documents.find(d => d.id === contextMenu.documentId);
      console.log('📄 Context menu document:', document);
    }
  }, [contextMenu, documents]);

  // NOW we can conditionally render content (but hooks are already called)
  const renderContent = () => {
    if (isInitialLoading && loading) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading documents...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <h3 className="text-destructive-foreground font-medium">Error loading documents</h3>
            <p className="text-destructive-foreground mt-2">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <main className={`flex-1 flex flex-col overflow-hidden bg-background text-foreground ${className}`}>
        <div className="sticky top-0 z-10 border-b border-border bg-card">
          <Toolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            searchPlaceholder="Search documents..."
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onUpload={() => setShowUploadZone(true)}
            onCreateFolder={handleCreateFolder}
            onRefresh={handleRefresh}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavorites={handleToggleFavorites}
            selectedCount={selectedItems.length}
            onClearSelection={handleClearSelection}
            onSelectAll={handleSelectAll}
            isUploading={isUploading}
            isLoading={loading || isSearching || isNavigating}
            className=""
          />
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            {(loading || isSearching || isNavigating) && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm text-muted-foreground">{
                    isSearching ? 'Searching...' : isNavigating ? 'Navigating...' : 'Loading...'
                  }</span>
                </div>
              </div>
            )}
            <FileGrid
              documents={sortedDocuments}
              viewMode={viewMode}
              selectedItems={selectedItems}
              searchQuery={searchQuery}
              currentPath={currentPath}
              {...fileGridHandlers}
            />
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-border p-6 bg-card">
          <FavoritesBar
            favorites={favoriteItems}
            currentPath={currentPath}
            onNavigate={handleNavigate}
            onAddFavorite={(path, name) => addFavorite(path, name)}
            onRemoveFavorite={(favoriteId) => {
              const favorite = favorites.find((f) => f.id === favoriteId);
              if (favorite) removeFavorite(favorite.folder_path);
            }}
          />
        </div>

        {/* Debug: Show context menu state */}
        {process.env.NODE_ENV === 'development' && contextMenu && (
          <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 p-2 rounded text-xs z-50">
            <div>Context Menu Active</div>
            <div>Document: {contextMenu.documentId}</div>
            <div>Position: {contextMenu.x}, {contextMenu.y}</div>
          </div>
        )}

        {contextMenu && (
          <ContextMenu
            isOpen={true}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            documentItem={documents.find((d) => d.id === contextMenu.documentId)}
            onClose={() => {
              console.log('🎯 Context menu onClose called');
              setContextMenu(null);
            }}
            onAction={(action, docId) => {
              console.log('🎯 Context menu onAction called:', { action, docId });
              handleDocumentAction(action, docId);
            }}
            // Public folder props
            isPublicFolder={documents.find((d) => d.id === contextMenu.documentId)?.is_public_folder || false}
            publicSlug={documents.find((d) => d.id === contextMenu.documentId)?.public_slug || undefined}
            onMakePublic={handleMakePublic}
            onMakePrivate={handleMakePrivate}
            onCopyPublicUrl={handleCopyPublicUrl}
            onGenerateCode={handleGenerateCode}
            className="context-menu"
          />
        )}

        {previewDocument && (
          <Preview
            isOpen={true}
            document={previewDoc}
            documents={documents}
            onClose={() => setPreviewDocument(null)}
            onDownload={(docId) => handleDocumentAction('download', docId)}
            onDelete={(docId) => handleDocumentAction('delete', docId)}
            onNext={(docId) => setPreviewDocument(docId)}
            onPrevious={(docId) => setPreviewDocument(docId)}
          />
        )}

        {showUploadZone && (
          <div className="fixed inset-0 bg-muted/70 flex items-center justify-center z-50">
            <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4 text-foreground border border-border">
              <h3 className="text-lg font-medium mb-4">Upload Files</h3>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    handleFileUpload(files);
                    setShowUploadZone(false);
                  }
                }}
                className="block w-full border border-border rounded-lg p-2 bg-background text-foreground"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowUploadZone(false)}
                  className="px-4 py-2 text-muted-foreground border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  };

  // Always return JSX, never return early after hooks
  return renderContent();
}