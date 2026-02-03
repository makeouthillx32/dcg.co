"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTheme } from "@/app/provider";
import { Building2, Trash2, Plus, MapPin, Clock, StickyNote, X, Edit3 } from "lucide-react";

interface BusinessNote {
  id?: string;
  name: string;
  note: string;
  created_at?: string;
}

interface Business {
  id: number;
  business_name: string;
  address: string;
  before_open: boolean;
  business_notes?: BusinessNote[];
}

export default function BusinessManager() {
  const { themeType } = useTheme();
  const isDark = themeType === "dark";
  
  const [mode, setMode] = useState<"add" | "delete" | "edit">("add");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [beforeOpen, setBeforeOpen] = useState(false);
  const [notes, setNotes] = useState<BusinessNote[]>([]);

  // New note state
  const [newNoteName, setNewNoteName] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/schedule/businesses");
      if (!res.ok) throw new Error("Failed to fetch businesses");
      const data = await res.json();
      setBusinesses(data);
    } catch (error) {
      toast.error("Could not load businesses");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setAddress("");
    setBeforeOpen(false);
    setNotes([]);
    setSelectedId(null);
    setNewNoteName("");
    setNewNoteContent("");
  };

  const handleBusinessSelect = (businessId: number) => {
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      setSelectedId(businessId);
      setName(business.business_name);
      setAddress(business.address);
      setBeforeOpen(business.before_open);
      // Convert API format to our format
      const businessNotes = business.business_notes || [];
      const formattedNotes = businessNotes.map(note => ({
        id: note.id || `note_${Date.now()}_${Math.random()}`,
        name: note.title || note.name || "",
        note: note.content || note.note || "",
        created_at: note.created_at
      }));
      setNotes(formattedNotes);
    }
  };

  const addNote = () => {
    if (!newNoteName.trim() || !newNoteContent.trim()) {
      return toast.error("Please fill in both note name and content");
    }

    const newNote: BusinessNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newNoteName.trim(),
      note: newNoteContent.trim(),
      created_at: new Date().toISOString()
    };

    setNotes(prev => [...prev, newNote]);
    setNewNoteName("");
    setNewNoteContent("");
  };

  const removeNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const updateNote = (noteId: string, field: 'name' | 'note', value: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId ? { ...note, [field]: value } : note
    ));
  };

  const handleAdd = async () => {
    if (!name.trim()) return toast.error("Business name is required");
    
    setIsLoading(true);
    try {
      // Convert our format to API format
      const apiNotes = notes.map(note => ({
        type: "general",
        title: note.name,
        content: note.note
      }));

      const res = await fetch("/api/schedule/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          business_name: name, 
          address, 
          before_open: beforeOpen,
          notes: apiNotes
        }),
      });

      if (!res.ok) throw new Error("Failed to add business");
      
      toast.success("Business added successfully");
      fetchBusinesses();
      resetForm();
    } catch (error) {
      toast.error("Failed to add business");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedId || !name.trim()) return toast.error("Please select a business and provide a name");
    
    setIsLoading(true);
    try {
      // Convert our format to API format
      const apiNotes = notes.map(note => ({
        type: "general",
        title: note.name,
        content: note.note
      }));

      const res = await fetch("/api/schedule/businesses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: selectedId,
          business_name: name, 
          address, 
          before_open: beforeOpen,
          notes: apiNotes
        }),
      });

      if (!res.ok) throw new Error("Failed to update business");
      
      toast.success("Business updated successfully");
      fetchBusinesses();
      resetForm();
    } catch (error) {
      toast.error("Failed to update business");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return toast.error("Please select a business to delete");
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/schedule/businesses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId }),
      });

      if (!res.ok) throw new Error("Failed to delete business");
      
      toast.success("Business deleted successfully");
      fetchBusinesses();
      resetForm();
    } catch (error) {
      toast.error("Failed to delete business");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-6 rounded-[var(--radius)] shadow-[var(--shadow-md)] ${
      isDark 
        ? "bg-[hsl(var(--card))]" 
        : "bg-[hsl(var(--background))]"
    } mt-8`}>
      <h2 className="text-xl font-[var(--font-serif)] font-bold mb-6 flex items-center text-[hsl(var(--foreground))]">
        <Building2 className="mr-2 text-[hsl(var(--sidebar-primary))]" size={20} />
        Business Manager
      </h2>
      
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded-[var(--radius)] font-[var(--font-sans)] transition-colors duration-200 flex items-center ${
            mode === "add" 
              ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]" 
              : `${isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"} text-[hsl(var(--muted-foreground))]`
          }`}
          onClick={() => { setMode("add"); resetForm(); }}
          disabled={isLoading}
        >
          <Plus size={16} className="mr-1" />
          Add Business
        </button>
        
        <button
          className={`px-4 py-2 rounded-[var(--radius)] font-[var(--font-sans)] transition-colors duration-200 flex items-center ${
            mode === "edit" 
              ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]" 
              : `${isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"} text-[hsl(var(--muted-foreground))]`
          }`}
          onClick={() => { setMode("edit"); resetForm(); }}
          disabled={isLoading}
        >
          <Edit3 size={16} className="mr-1" />
          Edit Business
        </button>
        
        <button
          className={`px-4 py-2 rounded-[var(--radius)] font-[var(--font-sans)] transition-colors duration-200 flex items-center ${
            mode === "delete" 
              ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]" 
              : `${isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"} text-[hsl(var(--muted-foreground))]`
          }`}
          onClick={() => { setMode("delete"); resetForm(); }}
          disabled={isLoading}
        >
          <Trash2 size={16} className="mr-1" />
          Delete Business
        </button>
      </div>

      {/* Business Selection for Edit/Delete */}
      {(mode === "edit" || mode === "delete") && (
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium font-[var(--font-sans)] text-[hsl(var(--foreground))]">
              Select Business
            </label>
            <select
              className="w-full px-4 py-2 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] font-[var(--font-sans)]"
              value={selectedId ?? ""}
              onChange={(e) => e.target.value && handleBusinessSelect(parseInt(e.target.value))}
              disabled={isLoading}
            >
              <option value="">Select a business</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.business_name} - {b.address}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Business Form */}
      {(mode === "add" || (mode === "edit" && selectedId)) && (
        <div className="space-y-6">
          {/* Basic Business Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="business-name" className="block text-sm font-medium font-[var(--font-sans)] text-[hsl(var(--foreground))]">
                Business Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                  <Building2 size={16} />
                </span>
                <input
                  id="business-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter business name"
                  className="w-full px-4 py-2 pl-10 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] font-[var(--font-sans)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))] transition-colors leading-[1.5]"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="business-address" className="block text-sm font-medium font-[var(--font-sans)] text-[hsl(var(--foreground))]">
                Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]">
                  <MapPin size={16} />
                </span>
                <input
                  id="business-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter business address"
                  className="w-full px-4 py-2 pl-10 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] font-[var(--font-sans)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--sidebar-ring))] focus:border-[hsl(var(--sidebar-primary))] transition-colors leading-[1.5]"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2 py-1">
              <input
                id="before-open"
                type="checkbox"
                checked={beforeOpen}
                onChange={(e) => setBeforeOpen(e.target.checked)}
                className="h-4 w-4 rounded-sm border-[hsl(var(--border))] text-[hsl(var(--sidebar-primary))] focus:ring-[hsl(var(--sidebar-ring))]"
                disabled={isLoading}
              />
              <label htmlFor="before-open" className="flex items-center text-sm font-[var(--font-sans)] text-[hsl(var(--foreground))]">
                <Clock size={16} className="mr-1 text-[hsl(var(--muted-foreground))]" />
                Clean before opening hours
              </label>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StickyNote size={20} className="text-[hsl(var(--sidebar-primary))]" />
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Business Notes ({notes.length})
              </h3>
            </div>

            {/* Add New Note */}
            <div className={`p-4 border border-[hsl(var(--border))] rounded-[var(--radius)] ${
              isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
            }`}>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[hsl(var(--foreground))]">Note Name</label>
                    <input
                      type="text"
                      value={newNoteName}
                      onChange={(e) => setNewNoteName(e.target.value)}
                      placeholder="e.g., Alarm Code, Key Location, Special Instructions"
                      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] font-[var(--font-sans)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-[hsl(var(--foreground))]">Note Content</label>
                    <input
                      type="text"
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="e.g., Code: 1234, Under front mat, Use side entrance"
                      className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-[var(--radius)] bg-[hsl(var(--input))] text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] font-[var(--font-sans)]"
                    />
                  </div>
                </div>
                <button
                  onClick={addNote}
                  disabled={!newNoteName.trim() || !newNoteContent.trim()}
                  className={`px-4 py-2 bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded-[var(--radius)] hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors duration-200 font-[var(--font-sans)] font-medium flex items-center ${
                    !newNoteName.trim() || !newNoteContent.trim() ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Plus size={16} className="mr-1" />
                  Add Note
                </button>
              </div>
            </div>

            {/* Existing Notes */}
            {notes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[hsl(var(--foreground))]">Current Notes:</h4>
                {notes.map((note) => (
                  <div key={note.id} className={`p-3 border border-[hsl(var(--border))] rounded-[var(--radius)] ${
                    isDark ? "bg-[hsl(var(--card))]" : "bg-[hsl(var(--background))]"
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-[hsl(var(--muted-foreground))]">Name</label>
                        <input
                          type="text"
                          value={note.name}
                          onChange={(e) => updateNote(note.id!, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))] font-[var(--font-sans)]"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-1 text-[hsl(var(--muted-foreground))]">Note</label>
                          <input
                            type="text"
                            value={note.note}
                            onChange={(e) => updateNote(note.id!, 'note', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-[hsl(var(--border))] rounded bg-[hsl(var(--input))] text-[hsl(var(--foreground))] font-[var(--font-sans)]"
                          />
                        </div>
                        <button
                          onClick={() => removeNote(note.id!)}
                          className="p-1 text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive))]/10 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={mode === "add" ? handleAdd : handleUpdate}
            disabled={isLoading || !name.trim()}
            className={`px-6 py-2 bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded-[var(--radius)] hover:bg-[hsl(var(--sidebar-primary))]/90 transition-colors duration-200 shadow-[var(--shadow-sm)] font-[var(--font-sans)] font-medium ${
              isLoading || !name.trim() ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {isLoading ? (mode === "add" ? "Adding..." : "Updating...") : (mode === "add" ? "Add Business" : "Update Business")}
          </button>
        </div>
      )}

      {/* Delete Mode */}
      {mode === "delete" && selectedId && (
        <div className="space-y-4">
          <div className={`p-4 rounded-[var(--radius)] ${
            isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
          }`}>
            <p className="text-sm font-[var(--font-sans)] text-[hsl(var(--foreground))] mb-1">
              <span className="font-medium">Are you sure you want to delete:</span>
            </p>
            <p className="text-[hsl(var(--foreground))] font-[var(--font-sans)]">
              {businesses.find(b => b.id === selectedId)?.business_name}
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] font-[var(--font-sans)]">
              {businesses.find(b => b.id === selectedId)?.address}
            </p>
            {notes.length > 0 && (
              <p className="text-sm text-[hsl(var(--destructive))] font-[var(--font-sans)] mt-2">
                This will also delete {notes.length} note{notes.length !== 1 ? 's' : ''}.
              </p>
            )}
          </div>
          
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className={`px-6 py-2 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] rounded-[var(--radius)] hover:bg-[hsl(var(--destructive))]/90 transition-colors duration-200 shadow-[var(--shadow-sm)] font-[var(--font-sans)] font-medium flex items-center justify-center ${
              isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <Trash2 size={16} className="mr-1" />
            {isLoading ? "Deleting..." : "Delete Business"}
          </button>
        </div>
      )}
      
      {businesses.length === 0 && !isLoading && (
        <div className={`mt-4 p-4 rounded-[var(--radius)] text-center ${
          isDark ? "bg-[hsl(var(--secondary))]" : "bg-[hsl(var(--muted))]"
        }`}>
          <p className="text-[hsl(var(--muted-foreground))] font-[var(--font-sans)]">
            No businesses found. Add your first business.
          </p>
        </div>
      )}
    </div>
  );
}