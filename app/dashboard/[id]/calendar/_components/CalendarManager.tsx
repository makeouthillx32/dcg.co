// app/dashboard/[id]/calendar/_components/CalendarManager.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Search, Filter, RefreshCw, Download, Eye, ChevronDown, User, Mail, Building } from 'lucide-react';
import CalendarBox from '@/components/CalenderBox';

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  role: string;
  department?: string;
  specialization?: string;
  avatar_url?: string;
  created_at: string;
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

interface CalendarManagerProps {
  currentDate: Date;
  userRole: string;
}

const CalendarManager = ({ currentDate, userRole }: CalendarManagerProps) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userEvents, setUserEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    dateRange: 'month',
    includeHours: true,
    includeEvents: true
  });

  // Only show for admins
  if (userRole !== 'admin1') {
    return null;
  }

  // Fetch users (simplified)
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/get-all-users', {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          // Transform basic auth data to user profiles
          const enrichedUsers = userData.map((user: any) => ({
            id: user.id,
            email: user.email || 'No email',
            display_name: user.display_name || user.email?.split('@')[0] || 'Unknown',
            role: 'user0x', // Default role - would need profile fetch for real role
            created_at: new Date().toISOString()
          }));
          setUsers(enrichedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch events for selected user
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!selectedUser || loadingEvents) return;

      setLoadingEvents(true);
      try {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const response = await fetch(
          `/api/admin/user-calendar?user_id=${selectedUser.id}&start_date=${startDateStr}&end_date=${endDateStr}`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const eventsData = await response.json();
          setUserEvents(eventsData);
        }
      } catch (error) {
        console.error('Error fetching user events:', error);
        setUserEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    if (selectedUser) {
      fetchUserEvents();
    }
  }, [selectedUser?.id, currentDate.getMonth(), currentDate.getFullYear()]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = filterRole === 'all' || user.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  // Helper functions
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin1': return 'Administrator';
      case 'coachx7': return 'Job Coach';
      case 'client7x': return 'Client';
      case 'user0x': return 'Basic User';
      default: return 'User';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin1': return 'bg-red-100 text-red-800 border-red-200';
      case 'coachx7': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'client7x': return 'bg-green-100 text-green-800 border-green-200';
      case 'user0x': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  // Calendar event handlers
  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
    // TODO: Add event creation functionality
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
    // TODO: Add event viewing/editing functionality
  };

  // Export calendar data
  const handleExportCalendar = () => {
    if (!selectedUser || !userEvents.length) return;

    const exportData = userEvents.map(event => ({
      'Date': event.event_date,
      'Title': event.title,
      'Start Time': event.start_time,
      'End Time': event.end_time,
      'Duration (min)': event.duration_minutes,
      'Type': event.is_hour_log ? 'Hour Log' : 'Event',
      'Status': event.status,
      'Client': event.client_name || '',
      'Coach': event.coach_name || ''
    }));

    const csvContent = [
      Object.keys(exportData[0] || {}).join(','),
      ...exportData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedUser.display_name || 'user'}-calendar-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setShowExportModal(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Calendar Manager</h3>
          <span className="text-sm text-gray-500">({filteredUsers.length} users)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            disabled={!selectedUser}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
            title="Export calendar"
          >
            <Download className="w-4 h-4" />
          </button>
          
          {selectedUser && (
            <button
              onClick={() => setSelectedUser(null)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
            >
              Clear Selection
            </button>
          )}
        </div>
      </div>

      {/* User Selection */}
      <div className="space-y-3">
        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin1">Administrators</option>
            <option value="coachx7">Job Coaches</option>
            <option value="client7x">Clients</option>
            <option value="user0x">Basic Users</option>
          </select>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              {selectedUser ? (
                <>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
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
                  <span className="text-gray-500">Select a user to view their calendar...</span>
                </>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown List */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-center text-gray-500">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-3 text-center text-gray-500">No users found</div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.display_name?.charAt(0) || user.email.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">
                        {user.display_name || user.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs border ${getRoleColor(user.role)}`}>
                          {getRoleDisplayName(user.role)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected User Calendar */}
      {selectedUser && (
        <div className="mt-4 space-y-4">
          {/* User Info */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
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
              <div className="ml-auto">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(selectedUser.role)}`}>
                  {getRoleDisplayName(selectedUser.role)}
                </span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="mt-3 grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded p-2">
                <div className="font-semibold text-gray-900">{userEvents.filter(e => !e.is_hour_log).length}</div>
                <div className="text-xs text-gray-500">Events</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="font-semibold text-blue-600">{userEvents.filter(e => e.is_hour_log).length}</div>
                <div className="text-xs text-gray-500">Hour Logs</div>
              </div>
              <div className="bg-white rounded p-2">
                <div className="font-semibold text-green-600">{userEvents.length}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {/* Calendar Display */}
          {!loadingEvents && (
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b bg-gray-50">
                <h5 className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {selectedUser.display_name || selectedUser.email}'s Calendar - {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h5>
              </div>
              
              <div className="p-4">
                <CalendarBox
                  currentDate={currentDate}
                  events={userEvents}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  viewMode="month"
                />
              </div>
            </div>
          )}

          {loadingEvents && (
            <div className="flex items-center justify-center p-8">
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4 animate-spin" />
                Loading calendar data...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Export Calendar Data</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <select
                  value={exportOptions.dateRange}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="month">Current Month</option>
                  <option value="week">Current Week</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeEvents}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeEvents: e.target.checked }))}
                    className="mr-2"
                  />
                  Include Events
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeHours}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeHours: e.target.checked }))}
                    className="mr-2"
                  />
                  Include Hour Logs
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleExportCalendar}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Export
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
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

export default CalendarManager;