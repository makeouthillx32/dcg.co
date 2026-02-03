'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Search, MoreHorizontal } from 'lucide-react';
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import './_components/members.scss';

// Define a comprehensive type for our user data
interface User {
  id: string;
  display_name: string;
  avatar_url: string;
  email: string;
  role_label: string;
  created_at: string;
  last_sign_in_at: string;
  email_confirmed_at: string | null;
  auth_providers: string[];
}

export default function MembersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users and their detailed information
  useEffect(() => {
    const fetchUsersWithDetails = async () => {
      try {
        setIsLoading(true);
        
        // Fetch base users list
        const usersResponse = await fetch('/api/get-all-users');
        if (!usersResponse.ok) {
          throw new Error('Failed to fetch users');
        }
        const baseUsers = await usersResponse.json();

        // Fetch detailed user information with roles
        const detailedUsers = await Promise.all(
          baseUsers.map(async (user: any) => {
            try {
              // Fetch profile details
              const profileResponse = await fetch(`/api/profile/${user.id}`);
              const profileData = await profileResponse.json();

              // Fetch role label
              let roleLabel = 'User';
              if (profileData.role) {
                const roleResponse = await fetch(`/api/profile/role-label?role_id=${profileData.role}`);
                const roleData = await roleResponse.json();
                roleLabel = roleData.role || 'User';
              }

              return {
                id: user.id,
                display_name: user.display_name || 'Unnamed User',
                avatar_url: profileData.avatar_url || '/images/user/user-03.png',
                email: user.email || 'No email',
                role_label: roleLabel,
                created_at: profileData.created_at || 'Unknown',
                last_sign_in_at: profileData.last_sign_in_at || 'Never',
                email_confirmed_at: profileData.email_confirmed_at || null,
                auth_providers: profileData.app_metadata?.providers || ['Unknown']
              };
            } catch (detailError) {
              console.error(`Error fetching details for user ${user.id}:`, detailError);
              return {
                id: user.id,
                display_name: user.display_name || 'Unnamed User',
                avatar_url: '/images/user/user-03.png',
                email: user.email || 'No email',
                role_label: 'User',
                created_at: 'Unknown',
                last_sign_in_at: 'Never',
                email_confirmed_at: null,
                auth_providers: ['Unknown']
              };
            }
          })
        );

        setUsers(detailedUsers);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setIsLoading(false);
      }
    };

    fetchUsersWithDetails();
  }, []);

  const toggleUserSelection = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) 
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  const filteredUsers = users.filter(user => 
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Select all users toggle
  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Unknown' || dateString === 'Never') return dateString;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <ShowcaseSection title="Members Management">
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--sidebar-primary))] border-t-transparent"></div>
          <p className="mt-2 text-[hsl(var(--foreground))]">Loading users...</p>
        </div>
      </ShowcaseSection>
    );
  }

  if (error) {
    return (
      <ShowcaseSection title="Members Management">
        <div className="text-center py-10 text-[hsl(var(--destructive))]">
          {error}
        </div>
      </ShowcaseSection>
    );
  }

  return (
    <ShowcaseSection title="Members Management">
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <input 
            type="text" 
            placeholder="Search by username or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-[var(--radius)] bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={20} />
        </div>
        <div className="flex space-x-4">
          <button className="flex items-center gap-2 rounded-[var(--radius)] px-4 py-2 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors">
            Sort <ChevronDown size={16} />
          </button>
          <button className="rounded-[var(--radius)] px-4 py-2 bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive))/0.9] transition-colors shadow-[var(--shadow-xs)]">
            Prune
          </button>
        </div>
      </div>

      <div className="overflow-x-auto members-table">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--muted))] border-b border-[hsl(var(--border))]">
            <tr>
              <th className="p-3 text-left">
                <input 
                  type="checkbox" 
                  checked={filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                  onChange={toggleSelectAll}
                  className="form-checkbox rounded-[calc(var(--radius)_-_2px)] text-[hsl(var(--sidebar-primary))] border-[hsl(var(--border))]"
                />
              </th>
              <th className="p-3 text-left text-[hsl(var(--muted-foreground))] uppercase font-[var(--font-sans)]">NAME</th>
              <th className="p-3 text-left text-[hsl(var(--muted-foreground))] uppercase font-[var(--font-sans)]">EMAIL</th>
              <th className="p-3 text-left text-[hsl(var(--muted-foreground))] uppercase font-[var(--font-sans)]">ROLE</th>
              <th className="p-3 text-left text-[hsl(var(--muted-foreground))] uppercase font-[var(--font-sans)]">CREATED</th>
              <th className="p-3 text-left text-[hsl(var(--muted-foreground))] uppercase font-[var(--font-sans)]">LAST LOGIN</th>
              <th className="p-3 text-left text-[hsl(var(--muted-foreground))] uppercase font-[var(--font-sans)]">AUTH PROVIDERS</th>
              <th className="p-3 text-right text-[hsl(var(--muted-foreground))] uppercase font-[var(--font-sans)]">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr 
                key={user.id} 
                className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
              >
                <td className="p-3">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="form-checkbox rounded-[calc(var(--radius)_-_2px)] text-[hsl(var(--sidebar-primary))] border-[hsl(var(--border))]"
                  />
                </td>
                <td className="p-3 flex items-center space-x-3">
                  <img 
                    src={user.avatar_url} 
                    alt={user.display_name} 
                    className="w-10 h-10 rounded-full object-cover shadow-[var(--shadow-xs)]"
                  />
                  <span className="font-medium text-[hsl(var(--foreground))]">{user.display_name}</span>
                </td>
                <td className="p-3 text-[hsl(var(--muted-foreground))]">{user.email}</td>
                <td className="p-3">
                  <span 
                    className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] px-2 py-1 rounded-full text-xs"
                  >
                    {user.role_label}
                  </span>
                </td>
                <td className="p-3 text-[hsl(var(--muted-foreground))]">{formatDate(user.created_at)}</td>
                <td className="p-3 text-[hsl(var(--muted-foreground))]">{formatDate(user.last_sign_in_at)}</td>
                <td className="p-3 text-[hsl(var(--muted-foreground))]">
                  {user.auth_providers.join(', ')}
                </td>
                <td className="p-3 text-right">
                  <button className="text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] p-2 rounded-[var(--radius)] transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-6">
        <span className="text-[hsl(var(--muted-foreground))]">
          Showing {filteredUsers.length} of {users.length} members
        </span>
        <div className="flex space-x-2 pagination">
          <button className="px-4 py-2 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-[var(--radius)] page-btn shadow-[var(--shadow-xs)]">
            Back
          </button>
          <button className="px-4 py-2 bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] rounded-[var(--radius)] active-page shadow-[var(--shadow-xs)]">1</button>
          <button className="px-4 py-2 bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-[var(--radius)] page-btn shadow-[var(--shadow-xs)]">
            Next
          </button>
        </div>
      </div>
    </ShowcaseSection>
  );
}