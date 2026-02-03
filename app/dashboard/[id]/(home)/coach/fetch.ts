import { createClient } from '@/utils/supabase/server';

export async function getOverviewData() {
  try {
    const [membersData, usersData, viewsData] = await Promise.all([
      getMembersData(),
      getUsersData(), 
      getViewsData()
    ]);
    
    return {
      views: viewsData,
      profit: {
        value: 0,
        growthRate: 0,
      },
      products: {
        value: 0,
        growthRate: 0,
      },
      members: membersData,
      users: usersData,
    };
  } catch (error) {
    console.error('Error fetching overview data:', error);
    return {
      views: { value: 0, growthRate: 0 },
      profit: { value: 0, growthRate: 0 },
      products: { value: 0, growthRate: 0 },
      members: { value: 0, growthRate: 0 },
      users: { value: 0, growthRate: 0 },
    };
  }
}

// Members = Registered platform users (from profiles table)
async function getMembersData() {
  try {
    const supabase = await createClient();
    
    const { count: totalMembers, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching members count:', countError);
      return { value: 0, growthRate: 0 };
    }

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const { count: thisMonthMembers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayThisMonth.toISOString());

    const { count: lastMonthMembers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayLastMonth.toISOString())
      .lt('created_at', firstDayThisMonth.toISOString());

    let growthRate = 0;
    if (lastMonthMembers && lastMonthMembers > 0) {
      growthRate = ((thisMonthMembers || 0) - lastMonthMembers) / lastMonthMembers;
    } else if (thisMonthMembers && thisMonthMembers > 0) {
      growthRate = 1;
    }

    return {
      value: totalMembers || 0,
      growthRate: Math.round(growthRate * 10000) / 100,
    };
  } catch (error) {
    console.error('Error fetching members data:', error);
    return { value: 0, growthRate: 0 };
  }
}

// Users = Analytics users (unique visitors from analytics_users table)
async function getUsersData() {
  try {
    const supabase = await createClient();
    
    // Get all analytics users with session_id to count unique users
    const { data: allUsers, error: fetchError } = await supabase
      .from('analytics_users')
      .select('session_id, created_at')
      .eq('is_bot', false); // Exclude bots

    if (fetchError) {
      console.error('Error fetching analytics users:', fetchError);
      return { value: 0, growthRate: 0 };
    }

    // Count unique users by session_id
    const uniqueSessionIds = new Set(allUsers?.map(user => user.session_id) || []);
    const totalUsers = uniqueSessionIds.size;

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Filter for this month's users and count unique sessions
    const thisMonthUsers = allUsers?.filter(user => 
      new Date(user.created_at) >= firstDayThisMonth
    ) || [];
    const thisMonthUniqueSessionIds = new Set(thisMonthUsers.map(user => user.session_id));
    const thisMonthCount = thisMonthUniqueSessionIds.size;

    // Filter for last month's users and count unique sessions
    const lastMonthUsers = allUsers?.filter(user => {
      const createdAt = new Date(user.created_at);
      return createdAt >= firstDayLastMonth && createdAt < firstDayThisMonth;
    }) || [];
    const lastMonthUniqueSessionIds = new Set(lastMonthUsers.map(user => user.session_id));
    const lastMonthCount = lastMonthUniqueSessionIds.size;

    let growthRate = 0;
    if (lastMonthCount > 0) {
      growthRate = (thisMonthCount - lastMonthCount) / lastMonthCount;
    } else if (thisMonthCount > 0) {
      growthRate = 1;
    }

    return {
      value: totalUsers,
      growthRate: Math.round(growthRate * 10000) / 100,
    };
  } catch (error) {
    console.error('Error fetching analytics users data:', error);
    return { value: 0, growthRate: 0 };
  }
}

// Views = Page views from analytics_page_views table
async function getViewsData() {
  try {
    const supabase = await createClient();
    
    // Get total page views
    const { count: totalViews, error: countError } = await supabase
      .from('analytics_page_views')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching page views count:', countError);
      return { value: 0, growthRate: 0 };
    }

    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // This month's page views
    const { count: thisMonthViews } = await supabase
      .from('analytics_page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayThisMonth.toISOString());

    // Last month's page views
    const { count: lastMonthViews } = await supabase
      .from('analytics_page_views')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', firstDayLastMonth.toISOString())
      .lt('created_at', firstDayThisMonth.toISOString());

    let growthRate = 0;
    if (lastMonthViews && lastMonthViews > 0) {
      growthRate = ((thisMonthViews || 0) - lastMonthViews) / lastMonthViews;
    } else if (thisMonthViews && thisMonthViews > 0) {
      growthRate = 1;
    }

    return {
      value: totalViews || 0,
      growthRate: Math.round(growthRate * 10000) / 100,
    };
  } catch (error) {
    console.error('Error fetching page views data:', error);
    return { value: 0, growthRate: 0 };
  }
}

export async function getChatsData() {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase.rpc('get_user_conversations_with_display_name', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('RPC Error:', error.message);
      return [];
    }

    if (!Array.isArray(data)) {
      console.error('Conversations data is not an array:', data);
      return [];
    }

    const mappedChats = data.map((conv) => {
      let displayName = conv.channel_name || 'Unnamed Chat';
      
      if (!conv.is_group && conv.participants && Array.isArray(conv.participants)) {
        const otherParticipant = conv.participants.find(p => p.user_id !== user.id);
        if (otherParticipant && otherParticipant.display_name) {
          displayName = otherParticipant.display_name;
        }
      }
      
      let profileImage = '/images/user/user-default.png';
      if (conv.is_group) {
        profileImage = '/images/user/group-default.png';
      } else if (conv.participants && Array.isArray(conv.participants)) {
        const otherParticipant = conv.participants.find(p => p.user_id !== user.id);
        if (otherParticipant && otherParticipant.avatar_url) {
          profileImage = otherParticipant.avatar_url;
        }
      }
      
      let isActive = false;
      if (conv.participants && Array.isArray(conv.participants)) {
        isActive = conv.participants.some(p => p.online === true);
      }
      
      const lastMessageContent = conv.last_message_content || conv.last_message || 'No messages yet';
      const lastMessageTime = conv.last_message_at || new Date().toISOString();
      const hasUnread = (conv.unread_count || 0) > 0;
      
      return {
        name: displayName,
        profile: profileImage,
        isActive: isActive,
        lastMessage: {
          content: lastMessageContent,
          type: 'text',
          timestamp: lastMessageTime,
          isRead: !hasUnread,
        },
        unreadCount: conv.unread_count || 0,
      };
    });

    return mappedChats;
    
  } catch (error) {
    console.error('Error fetching chats data:', error);
    return [];
  }
}