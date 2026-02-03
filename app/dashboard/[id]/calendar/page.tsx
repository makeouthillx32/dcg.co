// app/dashboard/[id]/calendar/page.tsx - Optimized with cookie-based role caching
'use client';

import { useState, useEffect, useMemo } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import EventModal from './_components/EventModal';
import CoachHoursModal from './_components/CoachHoursModal';
import CalendarHeader from './_components/CalendarHeader';
import CalendarExport from './_components/CalendarExport';
import UserRoleInfoPanel from './_components/UserRoleInfoPanel';
import ExportMessage from './_components/ExportMessage';
import CalendarContent from './_components/CalendarContent';
import UserCalendarViewer from './_components/UserCalendarViewer';
import CalendarManager from './_components/CalendarManager';
import SLSManager from './_components/SLSManager';
import CalendarContextMenu from './_components/CalendarContextMenu';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useAuth } from '@/app/provider';
import { useCalendarPermissions } from '@/hooks/useCalendarPermissions';
import { userRoleCookies, profileCache } from '@/lib/cookieUtils';

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
  is_payday?: boolean;
  is_holiday?: boolean;
  is_sales_day?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  location?: string;
  amount?: number;
  duration_minutes: number;
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

export default function CalendarPage() {
  const { user } = useAuth();
  
  const [userRole, setUserRole] = useState<string>(() => {
    return user?.id ? userRoleCookies.getUserRole(user.id) || 'user0x' : 'user0x';
  });
  const [roleLoading, setRoleLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [adminSelectedUser, setAdminSelectedUser] = useState<UserProfile | null>(null);
  const [showCalendarManager, setShowCalendarManager] = useState(false);
  const [showSLSManager, setShowSLSManager] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    date: null as Date | null,
    events: [] as CalendarEvent[],
    targetEvent: null as CalendarEvent | null
  });
  const [slsSelectedUser, setSlsSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.calendar-day') && !target.closest('.calendar-event')) {
        e.preventDefault();
      }
    };
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener('selectstart', preventDefault);
    document.addEventListener('dragstart', preventDefault);
    document.addEventListener('contextmenu', handleContextMenu);
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.mozUserSelect = 'none';
    document.body.style.msUserSelect = 'none';
    document.body.style.webkitTouchCallout = 'none';
    document.body.style.webkitUserDrag = 'none';
    return () => {
      document.removeEventListener('selectstart', preventDefault);
      document.removeEventListener('dragstart', preventDefault);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.mozUserSelect = '';
      document.body.style.msUserSelect = '';
      document.body.style.webkitTouchCallout = '';
      document.body.style.webkitUserDrag = '';
    };
  }, []);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user?.id) {
        setRoleLoading(false);
        return;
      }
      const cachedProfile = profileCache.getProfile(user.id);
      if (cachedProfile?.role) {
        setUserRole(cachedProfile.role);
        setRoleLoading(false);
        return;
      }
      setRoleLoading(true);
      try {
        const role = await userRoleCookies.getRoleWithFallback(user.id, `/api/profile/${user.id}`);
        setUserRole(role);
        const response = await fetch(`/api/profile/${user.id}`);
        if (response.ok) {
          const profileData = await response.json();
          profileCache.setProfile(user.id, profileData);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        const fallbackRole = user?.user_metadata?.role || user?.app_metadata?.role || 'user0x';
        setUserRole(fallbackRole);
      } finally {
        setRoleLoading(false);
      }
    }
    fetchUserRole();
  }, [user?.id]);

  const isAdmin = userRole === 'admin1';
  
  const { 
    permissions: dynamicPermissions, 
    loading: permissionsLoading, 
    error: permissionsError,
    hasPermission,
    refetch: refetchPermissions 
  } = useCalendarPermissions(isAdmin ? null : user?.id || null, userRole);

  const fallbackPermissions = useMemo(() => {    
    switch (userRole) {
      case 'admin1':
        return {
          canCreateEvents: true,
          canEditEvents: true,
          canDeleteEvents: true,
          canLogHours: true,
          canViewAllEvents: true,
          canManageUsers: true,
          canExportData: true
        };
      case 'coachx7':
        return {
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: true,
          canViewAllEvents: false,
          canManageUsers: false,
          canExportData: true
        };
      case 'client7x':
        return {
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: false,
          canViewAllEvents: false,
          canManageUsers: false,
          canExportData: true
        };
      default:
        return {
          canCreateEvents: false,
          canEditEvents: false,
          canDeleteEvents: false,
          canLogHours: false,
          canViewAllEvents: false,
          canManageUsers: false,
          canExportData: false
        };
    }
  }, [userRole]);

  const finalPermissions = isAdmin 
    ? fallbackPermissions
    : ((!permissionsLoading && !permissionsError && dynamicPermissions) 
        ? dynamicPermissions 
        : fallbackPermissions);

  const targetUserId = slsSelectedUser?.id || adminSelectedUser?.id || user?.id;
  
  const { 
    events, 
    loading, 
    error, 
    hasLoaded,
    createEvent, 
    updateEvent, 
    deleteEvent,
    logHours,
    loggingHours,
    refetch
  } = useCalendarEvents({
    startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    userId: targetUserId,
    userRole: slsSelectedUser ? slsSelectedUser.role : (adminSelectedUser ? adminSelectedUser.role : userRole),
    coachName: slsSelectedUser?.display_name || adminSelectedUser?.display_name || user?.user_metadata?.display_name || user?.email || 'Unknown Coach'
  });

  const displayEvents = useMemo(() => {
    let baseEvents = events || [];
    if (userRole === 'admin1' && (adminSelectedUser || slsSelectedUser)) {
      return baseEvents;
    }
    switch (userRole) {
      case 'admin1':
      case 'coachx7':
      case 'client7x':
        return baseEvents;
      default:
        return [];
    }
  }, [events, userRole, adminSelectedUser, slsSelectedUser]);

  const showLoading = (loading && !hasLoaded) || roleLoading;

  const handleNavigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleGoToToday = () => setCurrentDate(new Date());

  const handleDateRightClick = (e: React.MouseEvent, date: Date, events: CalendarEvent[]) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      date,
      events,
      targetEvent: null
    });
  };

  const handleEventRightClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      date: new Date(event.event_date),
      events: [event],
      targetEvent: event
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      date: null,
      events: [],
      targetEvent: null
    });
  };

  const handleContextViewEvents = (date: Date, events: CalendarEvent[]) => {
    if (events.length > 0) {
      setSelectedEvent(events[0]);
      setSelectedDate(new Date(events[0].event_date));
      setIsEventModalOpen(true);
    }
  };

  const handleLogHours = (date?: Date) => {
    setSelectedDate(date || new Date());
    setIsHoursModalOpen(true);
  };

  const handleCreateEvent = (date?: Date) => {
    setSelectedDate(date || new Date());
    setSelectedEvent(null);
    setIsEventModalOpen(true);
  };

  const handleCreateEventSubmit = async (eventData: any) => {
    if (!finalPermissions.canCreateEvents) return;
    try {
      await createEvent(eventData);
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleUpdateEventSubmit = async (eventData: any) => {
    if (!selectedEvent || !finalPermissions.canEditEvents) return;
    try {
      await updateEvent(selectedEvent.id, eventData);
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !finalPermissions.canDeleteEvents) return;
    try {
      await deleteEvent(selectedEvent.id);
      setIsEventModalOpen(false);
      setSelectedEvent(null);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleHoursSubmit = async (hoursData: CoachHoursData) => {
    if (!finalPermissions.canLogHours) return;
    try {
      await logHours(hoursData);
      setIsHoursModalOpen(false);
      setSelectedDate(null);
    } catch (error) {
      console.error('Failed to log hours:', error);
      throw error;
    }
  };

  const handleCreateSlsEvent = async (eventData: any) => {
    if (!slsSelectedUser || !user?.id) return;
    try {
      const response = await fetch('/api/calendar/sls-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description || eventData.notes,
          event_date: eventData.event_date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          event_type: eventData.event_type,
          user_id: eventData.user_id,
          user_role: eventData.user_role,
          notes: eventData.notes,
          location: eventData.location || '',
          is_virtual: eventData.is_virtual || false,
          virtual_meeting_link: eventData.virtual_meeting_link || '',
          priority: eventData.priority || 'medium',
          created_by_id: user.id
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create SLS event');
      }
      const result = await response.json();
      refetch();
      return result;
    } catch (error) {
      console.error('Error creating SLS event:', error);
      throw error;
    }
  };

  const exportHandlers = {
    onExportStart: () => setExportMessage(null),
    onExportComplete: () => {
      setExportMessage('Calendar exported successfully!');
      setTimeout(() => setExportMessage(null), 3000);
    },
    onExportError: (error: string) => {
      setExportMessage(`Export failed: ${error}`);
      setTimeout(() => setExportMessage(null), 5000);
    }
  };

  if (!user) {
    return (
      <>
        <Breadcrumb pageName="Calendar" />
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-[hsl(var(--muted-foreground))]">Please sign in to view your calendar.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Calendar" />
      <div className="mx-auto max-w-7xl">
        {(showLoading || permissionsLoading) && (
          <div className="mb-4">
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <div className="text-sm text-gray-600 text-center">
              {roleLoading && "Loading user role..."}
              {permissionsLoading && "Loading permissions..."}
              {loading && "Loading calendar..."}
            </div>
          </div>
        )}

        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          userRole={userRole}
          roleLoading={roleLoading}
          loggingHours={loggingHours}
          optimisticCount={0}
          permissions={finalPermissions}
          onNavigateMonth={handleNavigateMonth}
          onGoToToday={handleGoToToday}
          onSetViewMode={setViewMode}
          onOpenHoursModal={handleLogHours}
          onOpenEventModal={handleCreateEvent}
        />

        {finalPermissions.canExportData && (
          <div className="mb-6 flex justify-end">
            <CalendarExport
              currentDate={currentDate}
              events={displayEvents}
              userRole={userRole}
              userId={user?.id || ''}
              userName={user?.user_metadata?.display_name || user?.email}
              userEmail={user?.email}
              department={user?.user_metadata?.department}
              specialization={user?.user_metadata?.specialization}
              onExportStart={exportHandlers.onExportStart}
              onExportComplete={exportHandlers.onExportComplete}
              onExportError={exportHandlers.onExportError}
            />
          </div>
        )}

        <ExportMessage message={exportMessage} />

        {userRole === 'admin1' && (
          <UserCalendarViewer
            currentDate={currentDate}
            userRole={userRole}
            onUserSelect={setAdminSelectedUser}
            selectedUser={adminSelectedUser}
            onOpenCalendarManager={() => { setShowCalendarManager(true); setShowSLSManager(false); }}
            onOpenSLSManager={() => { setShowSLSManager(true); setShowCalendarManager(false); }}
          />
        )}

        <UserRoleInfoPanel 
          userRole={userRole} 
          roleLoading={roleLoading}
          selectedUser={slsSelectedUser || adminSelectedUser}
        />

        <CalendarContent
          showLoading={showLoading}
          error={error}
          roleLoading={roleLoading}
          currentDate={currentDate}
          displayEvents={displayEvents}
          viewMode={viewMode}
          userRole={userRole}
          onDateClick={() => {}}
          onEventClick={() => {}}
          onRefetch={refetch}
          onDateRightClick={handleDateRightClick}
          onEventRightClick={handleEventRightClick}
          disableBrowserDefaults={true}
        />

        <CalendarContextMenu
          menu={contextMenu}
          permissions={finalPermissions}
          userRole={userRole}
          onClose={handleCloseContextMenu}
          onCreateEvent={handleCreateEvent}
          onLogHours={handleLogHours}
          onEditEvent={(event) => {
            setSelectedEvent(event);
            setSelectedDate(new Date(event.event_date));
            setIsEventModalOpen(true);
          }}
          onDeleteEvent={async (event) => {
            if (finalPermissions.canDeleteEvents) {
              try {
                await deleteEvent(event.id);
              } catch (error) {
                console.error('Failed to delete event:', error);
              }
            }
          }}
          onViewEvents={handleContextViewEvents}
        />

        {(finalPermissions.canCreateEvents || finalPermissions.canEditEvents) && (
          <EventModal
            isOpen={isEventModalOpen}
            onClose={() => {
              setIsEventModalOpen(false);
              setSelectedEvent(null);
              setSelectedDate(null);
            }}
            onSubmit={selectedEvent ? handleUpdateEventSubmit : handleCreateEventSubmit}
            onDelete={selectedEvent && finalPermissions.canDeleteEvents ? handleDeleteEvent : undefined}
            selectedDate={selectedDate}
            selectedEvent={selectedEvent}
          />
        )}

        {finalPermissions.canLogHours && (
          <CoachHoursModal
            isOpen={isHoursModalOpen}
            onClose={() => {
              setIsHoursModalOpen(false);
              setSelectedDate(null);
            }}
            onSubmit={handleHoursSubmit}
            selectedDate={selectedDate}
            coachName={slsSelectedUser?.display_name || adminSelectedUser?.display_name || user?.user_metadata?.display_name || user?.email || 'Unknown Coach'}
          />
        )}

        {showCalendarManager && (
          <div className="mb-6">
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Calendar Manager</h2>
                <button
                  onClick={() => {
                    setShowCalendarManager(false);
                    setShowSLSManager(false);
                    setAdminSelectedUser(null);
                    setSlsSelectedUser(null);
                  }}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] p-2 rounded-md hover:bg-[hsl(var(--background))] transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <CalendarManager
                  currentDate={currentDate}
                  userRole={userRole}
                />
              </div>
            </div>
          </div>
        )}

        {showSLSManager && (
          <div className="mb-6">
            <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">SLS Manager</h2>
                <button
                  onClick={() => {
                    setShowCalendarManager(false);
                    setShowSLSManager(false);
                    setAdminSelectedUser(null);
                    setSlsSelectedUser(null);
                  }}
                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] p-2 rounded-md hover:bg-[hsl(var(--background))] transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">
                <SLSManager
                  currentDate={currentDate}
                  userRole={userRole}
                  onUserSelect={setSlsSelectedUser}
                  selectedUser={slsSelectedUser}
                  onCreateSlsEvent={handleCreateSlsEvent}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}