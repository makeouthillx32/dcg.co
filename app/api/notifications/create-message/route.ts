// app/api/notifications/create-message/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface CreateMessageNotificationRequest {
  channel_id: string;
  sender_id: string;
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      channel_id,
      sender_id,
      content,
    }: CreateMessageNotificationRequest = await req.json();

    console.log('🔥 NOTIFICATION API CALLED:', { channel_id, sender_id, content: content.slice(0, 20) + '...' });

    if (!channel_id || !sender_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: channel_id, sender_id, content' }, 
        { status: 400 }
      );
    }

    // 1️⃣ Get sender's display name from auth.users (EXACTLY like SQL)
    const { data: senderUser, error: senderError } = await supabase
      .from('auth.users')
      .select('email, raw_user_meta_data')
      .eq('id', sender_id)
      .single();

    if (senderError) {
      console.error('🔥 FAILED TO GET SENDER:', senderError.message);
      return NextResponse.json({ error: 'Failed to fetch sender info' }, { status: 500 });
    }

    const metadata = (senderUser.raw_user_meta_data as Record<string, any>) || {};
    const senderName = 
      metadata.display_name ||
      metadata.full_name ||
      senderUser.email ||
      'Someone';

    console.log('🔥 SENDER NAME:', senderName);

    // 2️⃣ Get channel participants (EXACTLY like SQL)
    const { data: participants, error: participantsError } = await supabase
      .from('channel_participants')
      .select('user_id')
      .eq('channel_id', channel_id)
      .neq('user_id', sender_id);

    if (participantsError) {
      console.error('🔥 FAILED TO GET PARTICIPANTS:', participantsError.message);
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
    }

    if (!participants || participants.length === 0) {
      console.log('🔥 NO PARTICIPANTS FOUND');
      return NextResponse.json({ message: 'No participants found to notify' }, { status: 200 });
    }

    console.log('🔥 FOUND PARTICIPANTS:', participants.length);

    // 3️⃣ Process each participant (EXACTLY like SQL loop)
    const results = [];
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    for (const participant of participants) {
      try {
        console.log('🔥 PROCESSING PARTICIPANT:', participant.user_id);

        // Check for existing recent notification (EXACTLY like SQL)
        const { data: existingNotification, error: checkError } = await supabase
          .from('notifications')
          .select('id')
          .eq('receiver_id', participant.user_id)
          .eq('sender_id', sender_id)
          .like('title', '%sent you%message%')
          .gte('created_at', fiveMinutesAgo)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (checkError) {
          console.error('🔥 ERROR CHECKING EXISTING:', checkError.message);
          results.push({ user_id: participant.user_id, status: 'error', error: checkError.message });
          continue;
        }

        if (existingNotification) {
          // Update existing notification (EXACTLY like SQL)
          console.log('🔥 UPDATING EXISTING NOTIFICATION:', existingNotification.id);
          
          const { error: updateError } = await supabase
            .from('notifications')
            .update({
              subtitle: content.length > 50 ? content.slice(0, 50) + '...' : content,
              created_at: new Date().toISOString(),
            })
            .eq('id', existingNotification.id);

          if (updateError) {
            console.error('🔥 UPDATE FAILED:', updateError.message);
            results.push({ user_id: participant.user_id, status: 'error', error: updateError.message });
          } else {
            console.log('🔥 UPDATE SUCCESS');
            results.push({ user_id: participant.user_id, status: 'updated' });
          }
        } else {
          // Create new notification (EXACTLY like SQL)
          console.log('🔥 CREATING NEW NOTIFICATION');
          
          const { error: insertError } = await supabase
            .from('notifications')
            .insert({
              sender_id: sender_id,
              receiver_id: participant.user_id,
              title: `${senderName} sent you a message`,
              subtitle: content.length > 50 ? content.slice(0, 50) + '...' : content,
              image_url: 'https://chsmesvozsjcgrwuimld.supabase.co/storage/v1/object/public/avatars/notification.png',
              action_url: '/dashboard/me/messages',
              role_admin: false,
              role_jobcoach: false,
              role_client: false,
              role_user: false,
            });

          if (insertError) {
            console.error('🔥 INSERT FAILED:', insertError.message);
            results.push({ user_id: participant.user_id, status: 'error', error: insertError.message });
          } else {
            console.log('🔥 INSERT SUCCESS');
            results.push({ user_id: participant.user_id, status: 'created' });
          }
        }
      } catch (error) {
        console.error('🔥 PARTICIPANT ERROR:', participant.user_id, error);
        results.push({ user_id: participant.user_id, status: 'error', error: String(error) });
      }
    }

    console.log('🔥 NOTIFICATION API COMPLETE:', results);

    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      results: results
    });

  } catch (error) {
    console.error('🔥 NOTIFICATION API ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}