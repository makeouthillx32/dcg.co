import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, Clock, Plus, Copy, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';

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

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
  date?: Date;
  events?: CalendarEvent[];
  targetEvent?: CalendarEvent;
}

interface Permissions {
  canLogHours: boolean;
  canCreateEvents: boolean;
  canEditEvents: boolean;
  canDeleteEvents: boolean;
  canViewAllEvents: boolean;
}

interface CalendarContextMenuProps {
  menu: ContextMenu;
  permissions: Permissions;
  userRole: string;
  onClose: () => void;
  onCreateEvent: (date: Date) => void;
  onLogHours: (date: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  onViewEvents: (date: Date, events: CalendarEvent[]) => void;
}

// Main Context Menu Component
export default function CalendarContextMenu({
  menu,
  permissions,
  userRole,
  onClose,
  onCreateEvent,
  onLogHours,
  onEditEvent,
  onDeleteEvent,
  onViewEvents
}: CalendarContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (menu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, [menu.visible, onClose]);

  // Handle menu actions
  const handleAction = useCallback((action: string, target?: CalendarEvent) => {
    if (!menu.date) return;

    switch (action) {
      case 'create-event':
        onCreateEvent(menu.date);
        break;
      case 'log-hours':
        onLogHours(menu.date);
        break;
      case 'view-events':
        if (menu.events) {
          onViewEvents(menu.date, menu.events);
        }
        break;
      case 'edit-event':
        if (target) {
          onEditEvent(target);
        }
        break;
      case 'delete-event':
        if (target) {
          onDeleteEvent(target);
        }
        break;
      case 'copy-date':
        navigator.clipboard?.writeText(menu.date.toLocaleDateString());
        break;
      case 'copy-event':
        if (target) {
          const eventText = `${target.title}\n${target.event_date} ${target.start_time}-${target.end_time}${target.description ? '\n' + target.description : ''}`;
          navigator.clipboard?.writeText(eventText);
        }
        break;
    }
    onClose();
  }, [menu, onCreateEvent, onLogHours, onViewEvents, onEditEvent, onDeleteEvent, onClose]);

  if (!menu.visible || !menu.date) return null;

  const hasEvents = menu.events && menu.events.length > 0;
  const isTargetEvent = !!menu.targetEvent;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/10"
        onClick={onClose}
      />
      
      {/* Context Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[180px] py-1"
        style={{
          left: Math.min(menu.x, window.innerWidth - 200),
          top: Math.min(menu.y, window.innerHeight - 300),
        }}
      >
        {/* Header */}
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {isTargetEvent 
              ? menu.targetEvent!.title
              : menu.date.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })
            }
          </div>
          {hasEvents && !isTargetEvent && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {menu.events!.length} event{menu.events!.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Menu Actions */}
        <div className="py-1">
          {isTargetEvent ? (
            // Actions for specific event
            <>
              <button
                onClick={() => handleAction('edit-event', menu.targetEvent)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Event
              </button>
              
              <button
                onClick={() => handleAction('copy-event', menu.targetEvent)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Event
              </button>

              {permissions.canDeleteEvents && (
                <button
                  onClick={() => handleAction('delete-event', menu.targetEvent)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Event
                </button>
              )}
            </>
          ) : (
            // Actions for date
            <>
              {hasEvents && (
                <button
                  onClick={() => handleAction('view-events')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View All Events ({menu.events!.length})
                </button>
              )}

              {permissions.canCreateEvents && (
                <button
                  onClick={() => handleAction('create-event')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Event
                </button>
              )}

              {permissions.canLogHours && userRole === 'coachx7' && (
                <button
                  onClick={() => handleAction('log-hours')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Log Hours
                </button>
              )}

              {(permissions.canCreateEvents || (permissions.canLogHours && userRole === 'coachx7')) && (
                <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
              )}

              <button
                onClick={() => handleAction('copy-date')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Date
              </button>
            </>
          )}
        </div>

        {/* Event List for date with multiple events */}
        {hasEvents && !isTargetEvent && menu.events!.length > 1 && (
          <div className="border-t border-gray-100 dark:border-gray-700 mt-1">
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quick Actions:
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {menu.events!.map((event, index) => (
                  <div
                    key={event.id || index}
                    className="flex items-center justify-between p-1 bg-gray-50 dark:bg-gray-700 rounded text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {event.start_time}-{event.end_time}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleAction('edit-event', event)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Edit event"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleAction('copy-event', event)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        title="Copy event"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}