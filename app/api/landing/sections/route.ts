// app/api/landing/sections/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('landing_sections')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (error) {
      console.error('[landing/sections] Database error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      sections: data || [] 
    });
  } catch (error: any) {
    console.error('[landing/sections] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// Optional: Add revalidation time
export const revalidate = 60; // Revalidate every 60 seconds