// app/dashboard/[id]/calendar/_components/CoachHoursModal.tsx - FIXED location handling
'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Save, MapPin, FileText, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface CoachHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (hoursData: CoachHoursData) => void;
  selectedDate: Date | null;
  coachName: string;
  existingHours?: number;
}

interface CoachHoursData {
  report_date: string;
  hours_worked: number;
  work_location_id?: string;
  location?: string;
  activity_type?: string;
  notes?: string;
  initials?: string;
}

// Dynamic data interfaces
interface WorkLocation {
  id: string;
  location_name: string;
  location_type: string;
  city?: string;
  is_active: boolean;
}

interface Specialization {
  id: string;
  name: string;
  description?: string;
  role: string;
  color?: string;
}

export default function CoachHoursModal({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  coachName,
  existingHours = 0
}: CoachHoursModalProps) {
  const [formData, setFormData] = useState<CoachHoursData>({
    report_date: '',
    hours_worked: 0,
    work_location_id: '',
    location: '',
    activity_type: '',
    notes: '',
    initials: ''
  });
  
  const [quickEntry, setQuickEntry] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dynamic data loading states
  const [workLocations, setWorkLocations] = useState<WorkLocation[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingSpecializations, setLoadingSpecializations] = useState(false);

  // Load work locations from existing API
  const loadWorkLocations = async () => {
    if (workLocations.length > 0) return;
    
    setLoadingLocations(true);
    try {
      const response = await fetch('/api/calendar/work-locations', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const locations = await response.json();
        const activeLocations = locations.filter((loc: WorkLocation) => loc.is_active);
        setWorkLocations(activeLocations);
        console.log('Loaded work locations:', activeLocations.length);
      } else {
        console.warn('Failed to load work locations, status:', response.status);
        // Set a fallback location in form data
        setFormData(prev => ({
          ...prev,
          location: 'Office' // Default fallback location
        }));
      }
    } catch (error) {
      console.error('Error loading work locations:', error);
      // Set a fallback location in form data
      setFormData(prev => ({
        ...prev,
        location: 'Office' // Default fallback location
      }));
    } finally {
      setLoadingLocations(false);
    }
  };

  // Load specializations from get-all API (filter for coachx7)
  const loadSpecializations = async () => {
    if (specializations.length > 0) return;
    
    setLoadingSpecializations(true);
    try {
      const response = await fetch('/api/profile/specializations/get-all', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const allSpecializations = await response.json();
        const coachSpecs = allSpecializations.filter((spec: any) => 
          spec.role === 'jobcoach'
        );
        setSpecializations(coachSpecs);
        
        // Set default activity type to first coach specialization
        if (coachSpecs.length > 0 && !formData.activity_type) {
          setFormData(prev => ({
            ...prev,
            activity_type: coachSpecs[0].name
          }));
        }
      } else {
        console.warn('Failed to load specializations, response not ok:', response.status);
        // Set fallback activity types
        setSpecializations([
          { id: '1', name: 'Client Coaching', description: '', role: 'jobcoach' },
          { id: '2', name: 'Administrative Tasks', description: '', role: 'jobcoach' },
          { id: '3', name: 'Other', description: '', role: 'jobcoach' }
        ]);
        
        // Set default activity
        if (!formData.activity_type) {
          setFormData(prev => ({
            ...prev,
            activity_type: 'Client Coaching'
          }));
        }
      }
    } catch (error) {
      console.error('Error loading specializations:', error);
      // Set fallback activity types
      setSpecializations([
        { id: '1', name: 'Client Coaching', description: '', role: 'jobcoach' },
        { id: '2', name: 'Administrative Tasks', description: '', role: 'jobcoach' },
        { id: '3', name: 'Other', description: '', role: 'jobcoach' }
      ]);
      
      // Set default activity
      if (!formData.activity_type) {
        setFormData(prev => ({
          ...prev,
          activity_type: 'Client Coaching'
        }));
      }
    } finally {
      setLoadingSpecializations(false);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadWorkLocations();
      loadSpecializations();
    }
  }, [isOpen]);

  // Update form data when selected date changes
  useEffect(() => {
    if (selectedDate && isOpen) {
      setFormData(prev => ({
        ...prev,
        report_date: format(selectedDate, 'yyyy-MM-dd')
      }));
    }
  }, [selectedDate, isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setIsSubmitting(false);
      setQuickEntry('');
    } else {
      // Reset form when closing
      setFormData({
        report_date: '',
        hours_worked: 0,
        work_location_id: '',
        location: '',
        activity_type: '',
        notes: '',
        initials: ''
      });
      setQuickEntry('');
    }
  }, [isOpen]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours_worked' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Quick hour buttons for common entries
  const handleQuickHours = (hours: number) => {
    setFormData(prev => ({
      ...prev,
      hours_worked: hours
    }));
    
    if (errors.hours_worked) {
      setErrors(prev => ({
        ...prev,
        hours_worked: ''
      }));
    }
  };

  // Parse "TB 7" style quick entry
  const parseQuickEntry = (entry: string) => {
    const trimmed = entry.trim().toUpperCase();
    const match = trimmed.match(/^([A-Z]{1,3})\s+(\d+(?:\.\d+)?)$/);
    
    if (!match) return null;
    
    const [, initials, hoursStr] = match;
    const hours = parseFloat(hoursStr);
    
    if (isNaN(hours) || hours <= 0 || hours > 12) return null;
    
    return {
      initials,
      hours,
      originalInput: entry
    };
  };

  // Handle quick entry input
  const handleQuickEntryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuickEntry(value);
    
    const parsed = parseQuickEntry(value);
    if (parsed) {
      setFormData(prev => ({
        ...prev,
        hours_worked: parsed.hours,
        initials: parsed.initials,
        notes: `Quick entry: ${parsed.originalInput}`
      }));
    }
  };

  // Apply quick entry
  const handleApplyQuickEntry = () => {
    const parsed = parseQuickEntry(quickEntry);
    if (parsed) {
      setFormData(prev => ({
        ...prev,
        hours_worked: parsed.hours,
        initials: parsed.initials,
        notes: `Quick entry: ${parsed.originalInput}`
      }));
      setQuickEntry('');
    }
  };

  // FIXED: Validate form with better location handling
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.report_date) {
      newErrors.report_date = 'Date is required';
    }

    if (!formData.hours_worked || formData.hours_worked <= 0) {
      newErrors.hours_worked = 'Hours worked must be greater than 0';
    }

    if (formData.hours_worked > 12) {
      newErrors.hours_worked = 'Hours worked cannot exceed 12 hours per day';
    }

    if (!formData.activity_type) {
      newErrors.activity_type = 'Activity type is required';
    }

    // FIXED: Better location validation
    const hasWorkLocationId = formData.work_location_id && formData.work_location_id.trim() !== '';
    const hasLocationText = formData.location && formData.location.trim() !== '';
    
    if (!hasWorkLocationId && !hasLocationText) {
      newErrors.location = 'Location is required (either select from dropdown or enter custom location)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // FIXED: Handle form submission with better data preparation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // FIXED: Prepare submission data with proper location handling
      const submissionData: CoachHoursData = {
        ...formData,
        initials: formData.initials || 'Coach', // Fallback if no initials set
        activity_type: formData.activity_type || 'Client Coaching', // Ensure activity type is set
      };

      // FIXED: Ensure we have location data one way or another
      if (formData.work_location_id && formData.work_location_id.trim() !== '') {
        // If work_location_id is selected, use it and clear location text
        submissionData.work_location_id = formData.work_location_id;
        submissionData.location = undefined; // Let API handle this
      } else if (formData.location && formData.location.trim() !== '') {
        // If custom location text is provided, use it and clear work_location_id
        submissionData.location = formData.location.trim();
        submissionData.work_location_id = undefined;
      } else {
        // Fallback: provide a default location
        submissionData.location = 'Office';
        submissionData.work_location_id = undefined;
      }
      
      console.log('🏗️ Modal submitting hours data:', submissionData);
      
      await onSubmit(submissionData);
      onClose();
    } catch (error) {
      console.error('Error submitting coach hours:', error);
      setErrors({ submit: 'Failed to log hours. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-[hsl(var(--card))] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-6">
          <div>
            <h2 className="text-xl font-semibold text-[hsl(var(--card-foreground))]">
              Log Work Hours
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
              {coachName} • {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select Date'}
              {formData.initials && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                  {formData.initials}
                </span>
              )}
            </p>
            {existingHours > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Already logged: {existingHours} hours today
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-[hsl(var(--muted))] transition-colors"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Entry */}
          <div className="bg-[hsl(var(--muted))] p-4 rounded-lg">
            <label className="block text-sm font-medium mb-2">
              Quick Entry (e.g., "TB 7", "SC 4.5", "GC 8")
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickEntry}
                onChange={handleQuickEntryChange}
                placeholder="TB 7 (Coach Initials + Hours)"
                className="flex-1 px-3 py-2 border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleApplyQuickEntry}
                disabled={!parseQuickEntry(quickEntry) || isSubmitting}
                className="px-3 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md hover:bg-[hsl(var(--primary))]/90 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {/* Show parsed result */}
            {quickEntry && parseQuickEntry(quickEntry) && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                <span className="text-green-700">
                  ✓ Parsed: <strong>{parseQuickEntry(quickEntry)?.initials}</strong> - {parseQuickEntry(quickEntry)?.hours} hours
                </span>
              </div>
            )}
            
            <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
              <p>💡 Enter your initials and hours (e.g., "TB 7") for quick logging</p>
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="report_date" className="block text-sm font-medium mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Date *
            </label>
            <input
              type="date"
              id="report_date"
              name="report_date"
              value={formData.report_date}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent ${
                errors.report_date ? 'border-red-500' : 'border-[hsl(var(--border))]'
              }`}
              disabled={isSubmitting}
              required
            />
            {errors.report_date && (
              <p className="text-red-500 text-xs mt-1">{errors.report_date}</p>
            )}
          </div>

          {/* Hours Worked */}
          <div>
            <label htmlFor="hours_worked" className="block text-sm font-medium mb-2">
              Hours Worked * (0.25-12 hours)
            </label>
            <div className="space-y-3">
              <input
                type="number"
                id="hours_worked"
                name="hours_worked"
                value={formData.hours_worked || ''}
                onChange={handleInputChange}
                step="0.25"
                min="0.25"
                max="12"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent ${
                  errors.hours_worked ? 'border-red-500' : 'border-[hsl(var(--border))]'
                }`}
                disabled={isSubmitting}
                required
              />
              
              {/* Quick Hour Buttons */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-[hsl(var(--muted-foreground))] mr-2">Quick:</span>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => handleQuickHours(hours)}
                    className="px-3 py-1 text-xs bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 rounded-md transition-colors"
                    disabled={isSubmitting}
                  >
                    {hours}h
                  </button>
                ))}
                {[1.5, 2.5, 4.5, 6.5].map(hours => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => handleQuickHours(hours)}
                    className="px-3 py-1 text-xs bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 rounded-md transition-colors"
                    disabled={isSubmitting}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>
            {errors.hours_worked && (
              <p className="text-red-500 text-xs mt-1">{errors.hours_worked}</p>
            )}
          </div>

          {/* Activity Type */}
          <div>
            <label htmlFor="activity_type" className="block text-sm font-medium mb-2">
              Activity Type *
              {loadingSpecializations && (
                <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />
              )}
            </label>
            <select
              id="activity_type"
              name="activity_type"
              value={formData.activity_type}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent ${
                errors.activity_type ? 'border-red-500' : 'border-[hsl(var(--border))]'
              }`}
              disabled={isSubmitting || loadingSpecializations}
              required
            >
              <option value="">Select Activity Type</option>
              {specializations.map(spec => (
                <option key={spec.id} value={spec.name}>
                  {spec.name}
                  {spec.description && ` - ${spec.description}`}
                </option>
              ))}
            </select>
            {errors.activity_type && (
              <p className="text-red-500 text-xs mt-1">{errors.activity_type}</p>
            )}
          </div>

          {/* FIXED: Location with better handling */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <MapPin className="inline h-4 w-4 mr-1" />
              Location *
              {loadingLocations && (
                <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />
              )}
            </label>
            
            {/* Work Location Dropdown (if available) */}
            {workLocations.length > 0 && (
              <select
                id="work_location_id"
                name="work_location_id"
                value={formData.work_location_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent mb-2 ${
                  errors.location ? 'border-red-500' : 'border-[hsl(var(--border))]'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Select Location</option>
                {workLocations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.location_name}
                    {location.city && ` - ${location.city}`}
                    {location.location_type && ` (${location.location_type})`}
                  </option>
                ))}
              </select>
            )}
            
            {/* Custom location input (always show as fallback) */}
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder={workLocations.length > 0 ? "Or enter custom location" : "Enter location (e.g., Office, Client Home, Community)"}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent ${
                errors.location ? 'border-red-500' : 'border-[hsl(var(--border))]'
              }`}
              disabled={isSubmitting}
            />
            
            {errors.location && (
              <p className="text-red-500 text-xs mt-1">{errors.location}</p>
            )}
            
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
              {workLocations.length > 0 
                ? "Select from dropdown or enter custom location below" 
                : "Enter location where work was performed"
              }
            </p>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional notes for KRC reporting..."
              className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[hsl(var(--border))] rounded-md hover:bg-[hsl(var(--muted))] transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md hover:bg-[hsl(var(--primary))]/90 transition-colors flex items-center justify-center gap-2"
              disabled={isSubmitting || !formData.hours_worked}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Log {formData.hours_worked || 0} Hours
                  {formData.initials && (
                    <span className="text-xs opacity-75">({formData.initials})</span>
                  )}
                </>
              )}
            </button>
          </div>
        </form>

        {/* KRC Info Footer */}
        <div className="px-6 pb-6">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-700 text-xs">
              <strong>For KRC Reporting:</strong> This information will be included in monthly reports. 
              Please ensure accuracy for compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}