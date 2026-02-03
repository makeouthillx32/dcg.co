// app/dashboard/[id]/calendar/_components/UserRoleInfoPanel.tsx
'use client';

import { useState } from 'react';
import { Users, Eye, Mail, Info, X } from 'lucide-react';

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

interface UserRoleInfoPanelProps {
  userRole: string;
  roleLoading?: boolean;
  selectedUser?: UserProfile | null;
}

export default function UserRoleInfoPanel({ 
  userRole, 
  roleLoading = false,
  selectedUser 
}: UserRoleInfoPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Convert role to display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin1': return 'Administrator';
      case 'coachx7': return 'Job Coach';
      case 'client7x': return 'Client';
      case 'user0x': return 'Basic User';
      default: return 'User';
    }
  };

  // Get role-specific instructions
  const getRoleInstructions = (role: string, hasSelectedUser: boolean) => {
    if (hasSelectedUser) {
      return `Viewing ${selectedUser?.display_name || selectedUser?.email}'s calendar as admin. You can see all their events and manage their schedule.`;
    }

    switch (role) {
      case 'admin1': 
        return 'You can create, edit and delete all calendar events. Use Admin Tools to manage other users\' calendars.';
      case 'coachx7': 
        return 'Click any date to log your work hours (try "TB 7" for quick entry). Your logged hours appear as green calendar events.';
      case 'client7x': 
        return 'You can view your scheduled appointments and meetings. Coach hour logs appear for transparency.';
      case 'user0x': 
        return 'Basic user - limited calendar access.';
      default: 
        return 'Unknown role - no calendar access.';
    }
  };

  if (roleLoading) {
    return (
      <div className="mb-4">
        <button
          className="flex items-center gap-2 p-2 bg-[hsl(var(--muted))] rounded-lg border border-[hsl(var(--border))] opacity-50 cursor-not-allowed"
          disabled
        >
          <Info className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Loading role info...</span>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {/* Info Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]/80 rounded-lg border border-[hsl(var(--border))] transition-colors"
        title="View role information"
      >
        <Info className="h-4 w-4 text-[hsl(var(--primary))]" />
        <span className="text-sm font-medium">
          {getRoleDisplayName(userRole)} Info
        </span>
        {selectedUser && (
          <div className="text-xs px-2 py-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded">
            Viewing: {selectedUser.display_name || selectedUser.email}
          </div>
        )}
      </button>

      {/* Expandable Content */}
      {isOpen && (
        <div className="mt-2 p-4 bg-[hsl(var(--muted))] rounded-lg border border-[hsl(var(--border))] animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                Viewing as: {getRoleDisplayName(userRole)}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[hsl(var(--background))] rounded transition-colors"
              title="Close info panel"
            >
              <X className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
            </button>
          </div>

          {/* Target User Display */}
          {selectedUser && (
            <div className="mt-3 flex items-center gap-2 bg-[hsl(var(--background))] px-3 py-2 rounded-md border border-[hsl(var(--border))]">
              <Eye className="h-3 w-3 text-[hsl(var(--primary))]" />
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {selectedUser.display_name?.charAt(0) || selectedUser.email.charAt(0)}
                </div>
                <div className="text-xs">
                  <div className="font-medium text-[hsl(var(--foreground))]">
                    {selectedUser.display_name || 'Unnamed User'}
                  </div>
                  <div className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                    <Mail className="h-2 w-2" />
                    {selectedUser.email}
                  </div>
                </div>
              </div>
              <div className="text-xs px-2 py-1 bg-[hsl(var(--muted))] rounded text-[hsl(var(--muted-foreground))]">
                {getRoleDisplayName(selectedUser.role)}
              </div>
            </div>
          )}
          
          {/* Instructions */}
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-3 leading-relaxed">
            {getRoleInstructions(userRole, !!selectedUser)}
          </div>

          {/* Active Overlay Notice */}
          {selectedUser && (
            <div className="mt-3 p-2 bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 rounded text-xs text-[hsl(var(--primary))] font-medium">
              📋 Calendar overlay active - showing {selectedUser.display_name || selectedUser.email}'s events
            </div>
          )}
        </div>
      )}
    </div>
  );
}