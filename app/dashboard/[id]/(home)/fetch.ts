// fetch.ts - SIMPLIFIED server-side role fetching (NO client-side Hall Monitor)

import { createClient } from "@/utils/supabase/server";

// Role mapping that matches your database
const ROLE_MAP: {[key: string]: string} = {
  'admin1': 'admin',
  'coachx7': 'jobcoach',
  'user0x': 'user',
  'client7x': 'client'
};

// Types for user role data
export interface DashboardUser {
  id: string;
  email?: string;
  role_name: string;
  role_id: string;
  specializations?: any[];
  profile?: any;
}

// Get user role info for server-side routing
export async function getUserRoleInfo(userId: string): Promise<DashboardUser | null> {
  try {
    console.log('[Server Fetch] Getting role info for user:', userId);
    
    const supabase = await createClient();
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('[Server Fetch] Error getting profile:', error);
      return null;
    }

    // Map role ID to role name
    const roleId = profile.role;
    const roleName = ROLE_MAP[roleId] || 'user';

    // Try to get specializations (optional, won't break if it fails)
    let specializations = [];
    try {
      const { data: specializationData } = await supabase
        .rpc('get_user_specializations', { user_id: userId });
      
      if (specializationData) {
        specializations = specializationData;
      }
    } catch (specError) {
      console.log('[Server Fetch] No specializations found (non-critical)');
    }

    return {
      id: profile.id,
      role_name: roleName,
      role_id: roleId,
      specializations,
      profile: {
        first_name: 'User',
        last_name: ''
      }
    };
  } catch (error) {
    console.error('[Server Fetch] Unexpected error:', error);
    return null;
  }
}

// Quick role check function
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const userData = await getUserRoleInfo(userId);
    return userData?.role_name || null;
  } catch (error) {
    console.error('[Server Fetch] Error getting user role:', error);
    return null;
  }
}