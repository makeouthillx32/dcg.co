// app/dashboard/[id]/calendar/_components/SLSManager.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Users, Search, Calendar, Clock, User, Mail, Building, ChevronDown, Filter, RefreshCw, Download, Eye, Plus, X, Check } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  role: string;
  department?: string;
  specialization?: string;
  avatar_url?: string;
  created_at: string;
  last_sign_in?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time: string;
  end_time: string;
  event_type: string;
  client_name?: string;
  coach_name?: string;
  color_code: string;
  status: string;
  is_hour_log?: boolean;
  duration_minutes: number;
}

interface SLSManagerProps {
  currentDate: Date;
  userRole: string;
  onUserSelect: (user: UserProfile | null) => void;
  selectedUser: UserProfile | null;
  onCreateSlsEvent: (eventData: any) => Promise<any>;
}

const SLSManager = ({
  currentDate,
  userRole,
  onUserSelect,
  selectedUser,
  onCreateSlsEvent
}: SLSManagerProps) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSlsModal, setShowSlsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slsEventData, setSlsEventData] = useState({
    title: '',
    date: '',
    time: '09:00',
    duration: '60',
    notes: '',
    eventType: 'appointment'
  });

  // Only show for admins
  if (userRole !== 'admin1') {
    return null;
  }

  // Enhanced user fetching function that combines auth and profile data
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      // First get basic user data from auth
      const authResponse = await fetch('/api/get-all-users', {
        credentials: 'include'
      });

      if (!authResponse.ok) {
        throw new Error('Failed to fetch users from auth');
      }

      const authUsers = await authResponse.json();
      console.log('[SLSManager] Auth users fetched:', authUsers.length);

      // Now get profile data for each user
      const enrichedUsers = await Promise.allSettled(
        authUsers.map(async (authUser: any) => {
          try {
            const profileResponse = await fetch(`/api/profile/${authUser.id}`, {
              credentials: 'include'
            });

            if (!profileResponse.ok) {
              // User might not have a profile yet, use auth data only
              return {
                id: authUser.id,
                email: authUser.email || 'No email',
                display_name: authUser.display_name || authUser.email?.split('@')[0] || 'Unknown',
                role: 'user0x', // Default role
                avatar_url: null,
                created_at: new Date().toISOString()
              };
            }

            const profileData = await profileResponse.json();
            
            return {
              id: authUser.id,
              email: authUser.email || 'No email',
              display_name: authUser.display_name || authUser.email?.split('@')[0] || 'Unknown',
              role: profileData.role || 'user0x',
              avatar_url: profileData.avatar_url,
              created_at: profileData.created_at || new Date().toISOString()
            };
          } catch (error) {
            console.error(`Error fetching profile for user ${authUser.id}:`, error);
            // Return basic data if profile fetch fails
            return {
              id: authUser.id,
              email: authUser.email || 'No email',
              display_name: authUser.display_name || authUser.email?.split('@')[0] || 'Unknown',
              role: 'user0x',
              avatar_url: null,
              created_at: new Date().toISOString()
            };
          }
        })
      );

      // Filter out failed requests and process results
      const successfulUsers = enrichedUsers
        .filter((result): result is PromiseFulfilledResult<UserProfile> => result.status === 'fulfilled')
        .map(result => result.value);

      // Filter to only show clients and coaches for SLS management
      const slsUsers = successfulUsers.filter(user => 
        user.role === 'client7x' || user.role === 'coachx7'
      );

      console.log('[SLSManager] SLS users:', slsUsers.length);
      setUsers(slsUsers);

    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Enhanced filter and search functionality
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      // Search functionality
      const matchesSearch = !searchTerm || 
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Role filter
      const matchesRole = filterRole === 'all' || user.role === filterRole;

      return matchesSearch && matchesRole;
    });

    // Sort by display name
    filtered.sort((a, b) => {
      return (a.display_name || '').localeCompare(b.display_name || '');
    });

    return filtered;
  }, [users, searchTerm, filterRole]);

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'coachx7': return 'Job Coach';
      case 'client7x': return 'Client';
      default: return 'User';
    }
  };

  // Get role color
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'coachx7': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'client7x': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllUsers();
    setRefreshing(false);
  };

  // Updated handleCreateSlsEvent function - ADD OPTIMISTIC UPDATE
  const handleCreateSlsEvent = async () => {
    if (!selectedUser || !slsEventData.title.trim() || !slsEventData.date) return;

    try {
      // Calculate end time
      const endTime = calculateEndTime(slsEventData.time, parseInt(slsEventData.duration));
      
      // Create event data object that matches the parent's API expectations
      const eventData = {
        title: slsEventData.title, // Don't prefix with "SLS:" here, the API will do it
        description: slsEventData.notes,
        event_date: slsEventData.date, // KEY FIX: Make sure this field is included
        start_time: slsEventData.time, // KEY FIX: Make sure this field is included
        end_time: endTime, // KEY FIX: Make sure this field is included
        event_type: slsEventData.eventType,
        user_id: selectedUser.id,
        user_role: selectedUser.role,
        notes: slsEventData.notes,
        location: '', // Add location field if needed
        is_virtual: false, // Add virtual meeting support if needed
        virtual_meeting_link: '', // Add virtual link if needed
        priority: 'medium'
      };

      console.log('🎯 SLSManager sending event data:', eventData);

      // Call the parent function to create the event (this will handle optimistic update)
      await onCreateSlsEvent(eventData);
      
      // Reset form and close modal on success
      setSlsEventData({
        title: '',
        date: '',
        time: '09:00',
        duration: '60',
        notes: '',
        eventType: 'appointment'
      });
      setShowSlsModal(false);
      
      // Show success message
      alert('SLS Event created successfully!');
      
    } catch (error) {
      console.error('Error creating SLS event:', error);
      alert('Failed to create SLS event. Please try again.');
    }
  };

  // Helper function to calculate end time
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">SLS Manager</h3>
          <span className="text-sm text-gray-500">({filteredUsers.length} users)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Refresh users"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          
          {selectedUser && (
            <button
              onClick={() => onUserSelect(null)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-3">
        {/* Primary Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients and coaches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All ({users.length})</option>
            <option value="coachx7">Job Coaches ({users.filter(u => u.role === 'coachx7').length})</option>
            <option value="client7x">Clients ({users.filter(u => u.role === 'client7x').length})</option>
          </select>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              {selectedUser ? (
                <>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {selectedUser.display_name?.charAt(0) || selectedUser.email.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {selectedUser.display_name || selectedUser.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getRoleDisplayName(selectedUser.role)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500">
                    Select a user to create SLS events... ({filteredUsers.length} available)
                  </span>
                </>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown List */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-center text-gray-500">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                  Loading users...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-3 text-center text-gray-500">
                  {searchTerm || filterRole !== 'all' ? 'No users match your filters' : 'No users found'}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        onUserSelect(user);
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                        {user.display_name?.charAt(0) || user.email.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {user.display_name || user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getRoleColor(user.role)} flex-shrink-0`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {user.email}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected User SLS Actions */}
      {selectedUser && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                {selectedUser.display_name?.charAt(0) || selectedUser.email.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {selectedUser.display_name || 'Unnamed User'}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-3 h-3" />
                  {selectedUser.email}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(selectedUser.role)}`}>
                {getRoleDisplayName(selectedUser.role)}
              </span>
            </div>
          </div>

          {/* SLS Actions */}
          <div className="mt-3 flex gap-2 flex-wrap">
            <button 
              onClick={() => setShowSlsModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create SLS Event
            </button>
            
            <button 
              onClick={() => window.open(`/dashboard/admin/users/${selectedUser.id}`, '_blank')}
              className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              View Profile
            </button>
          </div>
        </div>
      )}

      {/* SLS Event Creation Modal */}
      {showSlsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create SLS Event</h3>
              <button
                onClick={() => setShowSlsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={slsEventData.title}
                  onChange={(e) => setSlsEventData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter SLS event title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={slsEventData.date}
                    onChange={(e) => setSlsEventData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={slsEventData.time}
                    onChange={(e) => setSlsEventData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <select
                    value={slsEventData.duration}
                    onChange={(e) => setSlsEventData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SLS Event Type
                  </label>
                  <select
                    value={slsEventData.eventType}
                    onChange={(e) => setSlsEventData(prev => ({ ...prev, eventType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="appointment">SLS Appointment</option>
                    <option value="meeting">SLS Meeting</option>
                    <option value="training">SLS Training</option>
                    <option value="assessment">SLS Assessment</option>
                    <option value="follow-up">SLS Follow-up</option>
                    <option value="support">SLS Support Session</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={slsEventData.notes}
                  onChange={(e) => setSlsEventData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for this SLS event..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateSlsEvent}
                disabled={!slsEventData.title.trim() || !slsEventData.date}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Create SLS Event
              </button>
              
              <button
                onClick={() => setShowSlsModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SLSManager;