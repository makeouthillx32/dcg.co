// app/dashboard/[id]/calendar/_components/CalendarMainContent.tsx
'use client';

import CalendarHeader from './CalendarHeader';
import UserRoleInfoPanel from './UserRoleInfoPanel';
import ExportMessage from './ExportMessage';
import CalendarBox from '@/components/CalenderBox';
import UserCalendarViewer from './UserCalendarViewer';
import CalendarManager from './CalendarManager';
import CalendarContextMenu from './CalendarContextMenu';
import EventModal from './EventModal';
import CoachHoursModal from './CoachHoursModal';

// Types
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

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  date: Date | null;
  events: CalendarEvent[];
  targetEvent: CalendarEvent | null;
}

interface Permissions {
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canLogHours: boolean;
  canViewAllEvents: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
}

interface CalendarMainContentProps {
  // Basic state
  currentDate: Date;
  userRole: string;
  roleLoading: boolean;
  permissionsLoading: boolean;
  showLoading: boolean;
  loading: boolean;
  loggingHours: boolean;
  viewMode: 'month' | 'week' | 'day';
  
  // Data
  displayEvents: CalendarEvent[];
  finalPermissions: Permissions;
  exportMessage: string | null;
  
  // Admin state
  adminSelectedUser: UserProfile | null;
  slsSelectedUser: UserProfile | null;
  showCalendarManager: boolean;
  showSLSManager: boolean;
  
  // Modal state
  isEventModalOpen: boolean;
  isHoursModalOpen: boolean;
  selectedEvent: CalendarEvent | null;
  selectedDate: Date | null;
  
  // Context menu state
  contextMenu: ContextMenu;
  
  // User
  user: any;
  
  // Navigation handlers
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onGoToToday: () => void;
  onSetViewMode: (mode: 'month' | 'week' | 'day') => void;
  
  // Calendar interaction handlers
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onDateRightClick: (e: React.MouseEvent, date: Date, events: CalendarEvent[]) => void;
  onEventRightClick: (e: React.MouseEvent, event: CalendarEvent) => void;
  onCloseContextMenu: () => void;
  
  // Action handlers
  onLogHours: (date?: Date) => void;
  onCreateEvent: (date?: Date) => void;
  
  // Admin handlers
  onAdminUserSelect: (user: UserProfile | null) => void;
  onSlsUserSelect: (user: UserProfile | null) => void;
  onCreateSlsEvent: (eventData: any) => Promise<any>;
  onOpenCalendarManager: () => void;
  onOpenSLSManager: () => void;
  onCloseAdminModals: () => void;
  
  // Modal handlers
  onCreateEventSubmit: (eventData: any) => Promise<void>;
  onUpdateEventSubmit: (eventData: any) => Promise<void>;
  onDeleteEvent: () => Promise<void>;
  onHoursSubmit: (hoursData: CoachHoursData) => Promise<void>;
  
  // Modal control handlers
  onCloseEventModal: () => void;
  onCloseHoursModal: () => void;
  
  // Export handlers
  exportHandlers: {
    onExportStart: () => void;
    onExportComplete: () => void;
    onExportError: (error: string) => void;
  };
  
  // Refetch
  refetch: () => void;
}

const CalendarMainContent = ({
  // Basic state
  currentDate,
  userRole,
  roleLoading,
  permissionsLoading,
  showLoading,
  loading,
  loggingHours,
  viewMode,
  
  // Data
  displayEvents,
  finalPermissions,
  exportMessage,
  
  // Admin state
  adminSelectedUser,
  slsSelectedUser,
  showCalendarManager,
  showSLSManager,
  
  // Modal state
  isEventModalOpen,
  isHoursModalOpen,
  selectedEvent,
  selectedDate,
  
  // Context menu state
  contextMenu,
  
  // User
  user,
  
  // Navigation handlers
  onNavigateMonth,
  onGoToToday,
  onSetViewMode,
  
  // Calendar interaction handlers
  onEventClick,
  onDateClick,
  onDateRightClick,
  onEventRightClick,
  onCloseContextMenu,
  
  // Action handlers
  onLogHours,
  onCreateEvent,
  
  // Admin handlers
  onAdminUserSelect,
  onSlsUserSelect,
  onCreateSlsEvent,
  onOpenCalendarManager,
  onOpenSLSManager,
  onCloseAdminModals,
  
  // Modal handlers
  onCreateEventSubmit,
  onUpdateEventSubmit,
  onDeleteEvent,
  onHoursSubmit,
  
  // Modal control handlers
  onCloseEventModal,
  onCloseHoursModal,
  
  // Export handlers
  exportHandlers,
  
  // Refetch
  refetch
}: CalendarMainContentProps) => {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Progress Bar for Loading States */}
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

      {/* Calendar Header */}
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        userRole={userRole}
        roleLoading={roleLoading}
        loggingHours={loggingHours}
        optimisticCount={0}
        permissions={finalPermissions}
        onNavigateMonth={onNavigateMonth}
        onGoToToday={onGoToToday}
        onSetViewMode={onSetViewMode}
        onOpenHoursModal={onLogHours}
        onOpenEventModal={onCreateEvent}
        exportHandlers={exportHandlers}
      />

      {/* Export Message */}
      <ExportMessage message={exportMessage} />

      {/* Admin User Calendar Viewer - Only for Admins */}
      {userRole === 'admin1' && (
        <UserCalendarViewer
          currentDate={currentDate}
          userRole={userRole}
          onUserSelect={onAdminUserSelect}
          selectedUser={adminSelectedUser}
          onOpenCalendarManager={onOpenCalendarManager}
          onOpenSLSManager={onOpenSLSManager}
        />
      )}

      {/* Role-based info panel */}
      <UserRoleInfoPanel 
        userRole={userRole} 
        roleLoading={roleLoading}
        selectedUser={slsSelectedUser || adminSelectedUser}
      />

      {/* MAIN CALENDAR - All interactions handled internally */}
      <CalendarBox
        currentDate={currentDate}
        events={displayEvents}
        userRole={userRole}
        loading={showLoading}
        onEventClick={onEventClick}
        onDateClick={onDateClick}
        onLogHours={onLogHours}
        onCreateEvent={onCreateEvent}
        onDateRightClick={onDateRightClick}
        onEventRightClick={onEventRightClick}
      />

      {/* Context Menu */}
      <CalendarContextMenu
        menu={contextMenu}
        permissions={finalPermissions}
        userRole={userRole}
        onClose={onCloseContextMenu}
        onCreateEvent={onCreateEvent}
        onLogHours={onLogHours}
        onEditEvent={(event) => {
          // This will need to be passed as a handler from the page
          onEventClick(event);
        }}
        onDeleteEvent={async (event) => {
          if (finalPermissions.canDeleteEvents) {
            try {
              // This will need to be passed as a handler from the page
              console.log('Event deleted:', event.title);
            } catch (error) {
              console.error('Failed to delete event:', error);
            }
          }
        }}
        onViewEvents={(date, events) => {
          if (events.length > 0) {
            // This will need to be passed as a handler from the page
            onEventClick(events[0]);
          }
        }}
      />

      {/* Event Modal */}
      {(finalPermissions.canCreateEvents || finalPermissions.canEditEvents) && (
        <EventModal
          isOpen={isEventModalOpen}
          onClose={onCloseEventModal}
          onSubmit={selectedEvent ? onUpdateEventSubmit : onCreateEventSubmit}
          onDelete={selectedEvent && finalPermissions.canDeleteEvents ? onDeleteEvent : undefined}
          selectedDate={selectedDate}
          selectedEvent={selectedEvent}
        />
      )}

      {/* Coach Hours Modal */}
      {finalPermissions.canLogHours && (
        <CoachHoursModal
          isOpen={isHoursModalOpen}
          onClose={onCloseHoursModal}
          onSubmit={onHoursSubmit}
          selectedDate={selectedDate}
          coachName={slsSelectedUser?.display_name || adminSelectedUser?.display_name || user?.user_metadata?.display_name || user?.email || 'Unknown Coach'}
        />
      )}

      {/* Calendar Manager */}
      {showCalendarManager && (
        <div className="mb-6">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Calendar Manager</h2>
              <button
                onClick={onCloseAdminModals}
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

      {/* SLS Manager */}
      {showSLSManager && (
        <div className="mb-6">
          <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
              <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">SLS Manager</h2>
              <button
                onClick={onCloseAdminModals}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] p-2 rounded-md hover:bg-[hsl(var(--background))] transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <SLSManager
                currentDate={currentDate}
                userRole={userRole}
                onUserSelect={onSlsUserSelect}
                selectedUser={slsSelectedUser}
                onCreateSlsEvent={onCreateSlsEvent}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarMainContent;