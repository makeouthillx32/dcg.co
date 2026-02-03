// app/dashboard/[id]/calendar/_components/EventModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Clock, MapPin, Users, Video, Trash2, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'react-hot-toast';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
  onDelete?: () => void;
  selectedDate: Date | null;
  selectedEvent: any | null;
}

interface EventType {
  id: string;
  name: string;
  color_code: string;
  description: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Coach {
  id: string;
  name: string;
  email: string;
}

export default function EventModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  selectedDate,
  selectedEvent
}: EventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    start_time: '09:00',
    end_time: '10:00',
    event_type_id: '',
    client_id: '',
    coach_id: '',
    location: '',
    is_virtual: false,
    virtual_meeting_link: '',
    priority: 'medium',
    reminder_minutes: 60
  });

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Load dropdown data
  const loadDropdownData = async () => {
    try {
      setLoadingData(true);

      // Load event types
      const { data: eventTypesData, error: eventTypesError } = await supabase
        .from('event_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (eventTypesError) throw eventTypesError;
      setEventTypes(eventTypesData || []);

      // Load clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('status', 'active')
        .order('name');

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Load coaches
      const { data: coachesData, error: coachesError } = await supabase
        .from('job_coaches')
        .select('id, name, email')
        .eq('status', 'active')
        .order('name');

      if (coachesError) throw coachesError;
      setCoaches(coachesData || []);

    } catch (error) {
      console.error('Error loading dropdown data:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  // Set form data when selectedEvent or selectedDate changes
  useEffect(() => {
    if (selectedEvent) {
      setFormData({
        title: selectedEvent.title || '',
        description: selectedEvent.description || '',
        event_date: selectedEvent.event_date || '',
        start_time: selectedEvent.start_time || '09:00',
        end_time: selectedEvent.end_time || '10:00',
        event_type_id: selectedEvent.event_type_id || '',
        client_id: selectedEvent.client_id || '',
        coach_id: selectedEvent.coach_id || '',
        location: selectedEvent.location || '',
        is_virtual: selectedEvent.is_virtual || false,
        virtual_meeting_link: selectedEvent.virtual_meeting_link || '',
        priority: selectedEvent.priority || 'medium',
        reminder_minutes: selectedEvent.reminder_minutes || 60
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        event_date: format(selectedDate, 'yyyy-MM-dd'),
        title: '',
        description: '',
        event_type_id: '',
        client_id: '',
        coach_id: '',
        location: '',
        is_virtual: false,
        virtual_meeting_link: ''
      }));
    }
  }, [selectedEvent, selectedDate]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter an event title');
      return false;
    }
    
    if (!formData.event_date) {
      toast.error('Please select an event date');
      return false;
    }
    
    if (!formData.start_time || !formData.end_time) {
      toast.error('Please enter start and end times');
      return false;
    }
    
    if (formData.start_time >= formData.end_time) {
      toast.error('End time must be after start time');
      return false;
    }
    
    if (!formData.event_type_id) {
      toast.error('Please select an event type');
      return false;
    }

    if (formData.is_virtual && !formData.virtual_meeting_link.trim()) {
      toast.error('Please provide a meeting link for virtual events');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this event?');
    if (!confirmed) return;
    
    try {
      setLoading(true);
      await onDelete();
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-[hsl(var(--card))] shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-6">
          <h2 className="text-xl font-semibold text-[hsl(var(--card-foreground))]">
            {selectedEvent ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Title */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">
              Event Type *
            </label>
            <select
              name="event_type_id"
              value={formData.event_type_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              required
            >
              <option value="">Select event type</option>
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date *
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Start Time *
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                End Time *
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Client and Coach */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Client
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              >
                <option value="">Select client (optional)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">
                <Users className="inline h-4 w-4 mr-1" />
                Job Coach
              </label>
              <select
                name="coach_id"
                value={formData.coach_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              >
                <option value="">Select coach (optional)</option>
                {coaches.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Virtual Meeting Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_virtual"
              name="is_virtual"
              checked={formData.is_virtual}
              onChange={handleInputChange}
              className="rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--ring))]"
            />
            <label htmlFor="is_virtual" className="text-sm font-medium text-[hsl(var(--card-foreground))]">
              <Video className="inline h-4 w-4 mr-1" />
              Virtual Meeting
            </label>
          </div>

          {/* Location / Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">
              {formData.is_virtual ? (
                <>
                  <Video className="inline h-4 w-4 mr-1" />
                  Meeting Link {formData.is_virtual ? '*' : ''}
                </>
              ) : (
                <>
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Location
                </>
              )}
            </label>
            <input
              type={formData.is_virtual ? 'url' : 'text'}
              name={formData.is_virtual ? 'virtual_meeting_link' : 'location'}
              value={formData.is_virtual ? formData.virtual_meeting_link : formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              placeholder={formData.is_virtual ? 'https://zoom.us/j/...' : 'Enter location'}
              required={formData.is_virtual}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              placeholder="Enter event description"
            />
          </div>

          {/* Priority and Reminder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">
                Reminder (minutes before)
              </label>
              <select
                name="reminder_minutes"
                value={formData.reminder_minutes}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-[hsl(var(--border))] rounded-md bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:ring-2 focus:ring-[hsl(var(--ring))] focus:border-transparent"
              >
                <option value="0">No reminder</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="1440">1 day</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-[hsl(var(--border))]">
            <div>
              {selectedEvent && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 hover:bg-[hsl(var(--destructive))]/20 rounded-md transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Event
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || loadingData}
                className="px-6 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : selectedEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}