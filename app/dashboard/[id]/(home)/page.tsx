// page.tsx - FIXED PGBOR dashboard using server-side user fetching

import { Suspense } from 'react';
import { createTimeFrameExtractor } from '@/utils/timeframe-extractor';
import { createClient } from "@/utils/supabase/server";

// Import existing dashboard components from each role folder
import AdminDashboard from './admin/page';
import CoachDashboard from './coach/page';
import ClientDashboard from './cliant/page';

// Role mapping - THIS IS THE KEY FIX
const ROLE_MAP: {[key: string]: string} = {
  'admin1': 'admin',
  'coachx7': 'jobcoach',
  'user0x': 'user',
  'client7x': 'client'
};

type PropsType = {
  params: { id: string };
  searchParams?: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function DashboardHome({ params, searchParams }: PropsType) {
  console.log('[Dashboard] 🏠 PGBOR System Active - Server Side');
  
  // Get the user ID from params
  let userId = params.id;
  
  if (!userId) {
    console.error('[Dashboard] ❌ No user ID provided in params');
    return <ErrorDashboard message="No user ID provided" />;
  }

  console.log('[Dashboard] 📝 Initial userId from params:', userId);

  try {
    // Use server-side Supabase to get user role
    const supabase = await createClient();
    
    // 🔥 FIX: If userId is "me", get the actual user ID from auth session
    if (userId === 'me') {
      console.log('[Dashboard] 🔍 userId is "me", getting actual user ID from auth session');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('[Dashboard] ❌ Auth error when resolving "me":', authError);
        return <ErrorDashboard message="Authentication required - please sign in" />;
      }
      
      userId = user.id;
      console.log('[Dashboard] ✅ Resolved "me" to actual user ID:', userId);
    }
    
    console.log('[Dashboard] 🔍 Getting user data from database for:', userId);
    
    // Check if Supabase is configured properly
    try {
      const { data: testConnection } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      console.log('[Dashboard] ✅ Supabase connection test passed');
    } catch (connectionError) {
      console.error('[Dashboard] ❌ Supabase connection failed:', connectionError);
      return <ErrorDashboard message="Database connection failed - check Supabase configuration" />;
    }
    
    // Try to get the profile with detailed error handling
    let profile, profileError;
    try {
      const result = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', userId)
        .single();
      
      profile = result.data;
      profileError = result.error;
      
      console.log('[Dashboard] 📊 Raw Supabase response:', {
        data: profile,
        error: profileError,
        userId,
        hasData: !!profile,
        hasError: !!profileError
      });
      
    } catch (queryError) {
      console.error('[Dashboard] ❌ Query execution failed:', queryError);
      return <ErrorDashboard message="Database query failed" error={queryError} />;
    }

    if (profileError) {
      console.error('[Dashboard] ❌ Profile fetch error details:', {
        error: profileError,
        message: profileError?.message || 'No message',
        code: profileError?.code || 'No code',
        details: profileError?.details || 'No details',
        hint: profileError?.hint || 'No hint',
        userId
      });
      
      // Handle specific error codes
      if (profileError.code === 'PGRST116' || profileError.message?.includes('not found')) {
        return <ErrorDashboard message={`User profile not found for ID: ${userId}`} />;
      }
      
      return <ErrorDashboard message="Failed to fetch user profile" error={profileError} />;
    }

    if (!profile) {
      console.error('[Dashboard] ❌ No profile data returned for user:', userId);
      return <ErrorDashboard message={`No profile data found for user ID: ${userId}`} />;
    }

    // Map role ID to role name using ROLE_MAP
    const roleId = profile.role; // This is 'admin1', 'coachx7', etc.
    const roleName = ROLE_MAP[roleId]; // This maps to 'admin', 'jobcoach', etc.

    console.log('[Dashboard] 🎯 Role mapping:', {
      userId,
      roleId,
      roleName,
      availableRoles: Object.keys(ROLE_MAP)
    });

    if (!roleName) {
      console.error('[Dashboard] ❌ No role mapping found for role ID:', roleId);
      console.error('[Dashboard] Available role mappings:', ROLE_MAP);
      
      // Fallback to 'user' role if mapping fails
      const fallbackRole = 'user';
      console.log('[Dashboard] 🔄 Using fallback role:', fallbackRole);
      
      const dashboardProps = {
        searchParams: resolvedSearchParams,
        extractTimeFrame,
        user: {
          id: profile.id,
          email: undefined,
          role_name: fallbackRole,
          role_id: roleId,
          profile: {
            first_name: 'User',
            last_name: ''
          }
        },
        params
      };
      
      return (
        <Suspense fallback={<DashboardLoading role="User (Fallback)" />}>
          <ClientDashboard {...dashboardProps} />
        </Suspense>
      );
    }

    console.log('[Dashboard] ✅ User role resolved:', {
      userId,
      roleId,
      roleName
    });

    // Resolve search params
    const resolvedSearchParams = await searchParams;
    const extractTimeFrame = createTimeFrameExtractor(resolvedSearchParams?.selected_time_frame);

    // Prepare props for dashboard components
    const dashboardProps = {
      searchParams: resolvedSearchParams,
      extractTimeFrame,
      user: {
        id: profile.id,
        email: undefined, // Will be filled by individual dashboards if needed
        role_name: roleName,
        role_id: roleId,
        profile: {
          first_name: 'User', // Fallback
          last_name: ''
        }
      },
      params
    };

    console.log('[Dashboard] 🎯 Routing to dashboard for role:', roleName);

    // Render role-specific dashboard using PGBOR system
    switch (roleName) {
      case 'admin':
        console.log('[Dashboard] ✅ Rendering Admin Dashboard');
        return (
          <Suspense fallback={<DashboardLoading role="Admin" />}>
            <AdminDashboard {...dashboardProps} />
          </Suspense>
        );
      
      case 'jobcoach':
        console.log('[Dashboard] ✅ Rendering Job Coach Dashboard');
        return (
          <Suspense fallback={<DashboardLoading role="Job Coach" />}>
            <CoachDashboard {...dashboardProps} />
          </Suspense>
        );
      
      case 'client':
        console.log('[Dashboard] ✅ Rendering Client Dashboard');
        return (
          <Suspense fallback={<DashboardLoading role="Client" />}>
            <ClientDashboard {...dashboardProps} />
          </Suspense>
        );
      
      case 'user':
      default:
        console.log('[Dashboard] ✅ Rendering Default Client Dashboard for role:', roleName);
        return (
          <Suspense fallback={<DashboardLoading role="User" />}>
            <ClientDashboard {...dashboardProps} />
          </Suspense>
        );
    }

  } catch (error) {
    console.error('[Dashboard] ❌ Error loading dashboard:', error);
    return <ErrorDashboard message="Failed to load dashboard" error={error} />;
  }
}

// Loading component
function DashboardLoading({ role }: { role: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
        <p>Loading {role} Dashboard...</p>
        <div className="mt-2 text-sm text-muted-foreground">
          PGBOR System: Server-Side Role Detection
        </div>
      </div>
    </div>
  );
}

// Error dashboard component - converted to client component
function ErrorDashboard({ message, error }: { message: string; error?: any }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="text-center max-w-md">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold mb-2">Dashboard Error</h1>
        <p className="text-muted-foreground mb-4">{message}</p>
        {error && (
          <details className="text-sm text-left bg-muted p-4 rounded">
            <summary className="cursor-pointer mb-2">Error Details</summary>
            <pre className="whitespace-pre-wrap">
              {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
            </pre>
          </details>
        )}
        <div className="mt-4 text-sm text-muted-foreground">
          Please refresh the page or contact support if the issue persists.
        </div>
      </div>
    </div>
  );
}