// app/api/schedule/daily-instances/monthly/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Missing required parameters: start_date, end_date" },
      { status: 400 }
    );
  }

  try {
    console.log(`📊 Fetching monthly instances from ${startDate} to ${endDate}`);

    // Fetch all daily instances within the date range
    const { data: instances, error: instancesError } = await supabase
      .from("daily_clean_instances")
      .select(`
        id,
        instance_date,
        week_number,
        day_name,
        status,
        created_at,
        updated_at,
        daily_clean_items!daily_clean_items_instance_id_fkey (
          id,
          business_id,
          business_name,
          address,
          before_open,
          status,
          cleaned_at,
          moved_to_date,
          notes,
          updated_at
        )
      `)
      .gte("instance_date", startDate)
      .lte("instance_date", endDate)
      .order("instance_date");

    if (instancesError) {
      console.error("Error fetching monthly instances:", instancesError);
      return NextResponse.json({ error: instancesError.message }, { status: 500 });
    }

    console.log(`✅ Found ${instances?.length || 0} instances`);

    // Calculate summary statistics
    const summary = {
      total_instances: instances?.length || 0,
      total_businesses_cleaned: 0,
      total_cleaning_sessions: 0,
      days_with_activity: new Set(),
      completion_rate: 0
    };

    let totalBusinesses = 0;
    let completedBusinesses = 0;

    instances?.forEach(instance => {
      if (instance.daily_clean_items && instance.daily_clean_items.length > 0) {
        summary.days_with_activity.add(instance.instance_date);
        
        instance.daily_clean_items.forEach((item: any) => {
          totalBusinesses++;
          if (item.status === 'cleaned') {
            completedBusinesses++;
            summary.total_cleaning_sessions++;
          }
        });
      }
    });

    summary.total_businesses_cleaned = completedBusinesses;
    summary.completion_rate = totalBusinesses > 0 ? 
      Math.round((completedBusinesses / totalBusinesses) * 100) : 0;

    // Convert Set to number for JSON serialization
    const summaryWithDaysCount = {
      ...summary,
      days_with_activity: summary.days_with_activity.size
    };

    return NextResponse.json({
      instances: instances || [],
      summary: summaryWithDaysCount,
      date_range: {
        start_date: startDate,
        end_date: endDate
      }
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}