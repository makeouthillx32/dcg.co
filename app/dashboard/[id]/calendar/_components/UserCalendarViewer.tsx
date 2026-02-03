// app/dashboard/[id]/calendar/_components/UserCalendarViewer.tsx
'use client';

import { Users, Calendar, Settings } from 'lucide-react';

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

interface UserCalendarViewerProps {
  currentDate: Date;
  userRole: string;
  onUserSelect: (user: UserProfile | null) => void;
  selectedUser: UserProfile | null;
  onOpenCalendarManager: () => void;
  onOpenSLSManager: () => void;
}

const UserCalendarViewer = ({
  currentDate,
  userRole,
  onUserSelect,
  selectedUser,
  onOpenCalendarManager,
  onOpenSLSManager
}: UserCalendarViewerProps) => {
  // Only show for admins
  if (userRole !== 'admin1') {
    return null;
  }

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-sm p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[hsl(var(--primary))]" />
          <h3 className="font-semibold text-[hsl(var(--foreground))]">Admin Tools</h3>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onOpenCalendarManager}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-md hover:bg-[hsl(var(--primary))]/90 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Calendar Manager
        </button>

        <button
          onClick={onOpenSLSManager}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-md hover:bg-[hsl(var(--secondary))]/90 transition-colors"
        >
          <Settings className="w-4 h-4" />
          SLS Manager
        </button>
      </div>

      {/* Selected User Display */}
      {selectedUser && (
        <div className="mt-4 p-3 bg-[hsl(var(--muted))] rounded-md border border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {selectedUser.display_name?.charAt(0) || selectedUser.email.charAt(0)}
              </div>
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                Viewing: {selectedUser.display_name || selectedUser.email}
              </span>
            </div>
            <button
              onClick={() => onUserSelect(null)}
              className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] px-2 py-1 rounded hover:bg-[hsl(var(--background))]"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCalendarViewer;