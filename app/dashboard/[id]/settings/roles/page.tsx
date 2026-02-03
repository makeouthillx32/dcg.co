// app/dashboard/[id]/settings/roles/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { ShowcaseSection } from '@/components/Layouts/showcase-section';
import RoleModal from './_components/RoleModal';
import DeleteConfirmModal from './_components/DeleteConfirmModal';
import RolesSearchBar from './_components/RolesSearchBar';
import RolesActionBar from './_components/RolesActionBar';
import LoadingState from './_components/LoadingState';
import ErrorAlert from './_components/ErrorAlert';
import RolesTable from './_components/RolesTable';
import { toast } from 'react-hot-toast';

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  role_type: string;
  member_count: number;
}

export default function RolesManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [loadingMemberCounts, setLoadingMemberCounts] = useState(false);

  // Fetch all roles and then their member counts
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile/specializations/get-all');
      if (!res.ok) throw new Error(`Failed to fetch roles: ${res.status}`);
      const data = await res.json();
      const transformed: Role[] = data.map((r: any) => ({
        id: r.id,
        name: r.name,
        description: r.description || '',
        color: r.color || 'hsl(var(--chart-5))', // Default to a chart color instead of hardcoded gray
        role_type: r.role || 'Unassigned',
        member_count: 0
      }));
      setRoles(transformed);
      await fetchMemberCounts(transformed);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load roles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMemberCounts = async (list: Role[]) => {
    if (!list.length) return;
    setLoadingMemberCounts(true);
    try {
      const counts = await Promise.all(
        list.map(async (role) => {
          try {
            const res = await fetch(
              `/api/profile/specializations/get-members?id=${role.id}`
            );
            if (!res.ok) return { id: role.id, count: 0 };
            const members = await res.json();
            return { id: role.id, count: Array.isArray(members) ? members.length : 0 };
          } catch {
            return { id: role.id, count: 0 };
          }
        })
      );
      setRoles((prev) =>
        prev.map((r) => {
          const found = counts.find((c) => c.id === r.id);
          return found ? { ...r, member_count: found.count } : r;
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMemberCounts(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = roles.filter((r) =>
    [r.name, r.description, r.role_type]
      .join(' ')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleCreateRole = () => {
    setCurrentRole(null);
    setIsCreateModalOpen(true);
  };
  const handleEditRole = (role: Role) => {
    setCurrentRole(role);
    setIsEditModalOpen(true);
  };
  const handleDeleteRole = (role: Role) => {
    setCurrentRole(role);
    setIsDeleteModalOpen(true);
  };

  const handleSaveRole = async (updatedRole: Role) => {
    setIsLoading(true);
    try {
      const isNew = !updatedRole.id;
      const endpoint = isNew
        ? '/api/profile/specializations/create'
        : '/api/profile/specializations/update';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRole),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Failed to ${isNew ? 'create' : 'update'} role`);
      if (isNew) {
        setRoles((prev) => [...prev, { ...json, member_count: 0 }]);
        toast.success(`Role "${json.name}" created!`);
      } else {
        setRoles((prev) =>
          prev.map((r) => (r.id === json.id ? { ...json, member_count: r.member_count } : r))
        );
        toast.success(`Role "${json.name}" updated!`);
      }
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Save failed. Please try again.');
      toast.error(err.message || 'Save failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentRole) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/profile/specializations/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentRole.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      setRoles((prev) => prev.filter((r) => r.id !== currentRole.id));
      toast.success(`Role "${currentRole.name}" deleted!`);
      setIsDeleteModalOpen(false);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Delete failed. Please try again.');
      toast.error(err.message || 'Delete failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissError = () => setError(null);
  const handleRefreshCounts = async () => {
    await fetchMemberCounts(roles);
    toast.success('Member counts refreshed');
  };

  return (
    <ShowcaseSection title="Role Management">
      <div className="roles-management">
        {/* Search + Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <RolesSearchBar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
          <RolesActionBar
            onCreateRole={handleCreateRole}
            onRefreshCounts={handleRefreshCounts}
            isRefreshing={loadingMemberCounts}
          />
        </div>

        {/* Status */}
        {isLoading && <LoadingState message="Loading roles..." />}

        {error && (
          <ErrorAlert message={error} onDismiss={handleDismissError} />
        )}

        {/* Roles Table */}
        {!isLoading && !error && (
          <RolesTable
            roles={filteredRoles}
            allRolesCount={roles.length}
            loadingMemberCounts={loadingMemberCounts}
            onEdit={handleEditRole}
            onDelete={handleDeleteRole}
          />
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <RoleModal
          title="Create New Role"
          role={null}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleSaveRole}
        />
      )}
      {isEditModalOpen && currentRole && (
        <RoleModal
          title={`Edit Role: ${currentRole.name}`}
          role={currentRole}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveRole}
        />
      )}
      {isDeleteModalOpen && currentRole && (
        <DeleteConfirmModal
          title="Delete Role"
          message={`Are you sure you want to delete "${currentRole.name}"? This cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}
    </ShowcaseSection>
  );
}