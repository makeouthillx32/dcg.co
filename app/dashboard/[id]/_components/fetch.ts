// app/dashboard/[id]/messages/_components/fetch.ts

export interface OverviewMetrics {
  views: { value: number; growthRate: number };
  profit: { value: number; growthRate: number };
  products: { value: number; growthRate: number };
  members: { value: number; growthRate: number };
}

export async function getOverviewData(): Promise<OverviewMetrics> {
  const res = await fetch("/api/overview");
  if (!res.ok) {
    throw new Error(`Failed to fetch overview data: ${res.statusText}`);
  }
  return (await res.json()) as OverviewMetrics;
}

export interface ConversationSummary {
  channel_id: string;
  channel_name: string;
  is_group: boolean;
  last_message_content: string;
  last_message_at: string;
  unread_count: number;
  participants: { user_id: string; role: string; avatar_url: string }[];
}

export async function getChatsData(): Promise<ConversationSummary[]> {
  const res = await fetch("/api/conversations");
  if (!res.ok) {
    throw new Error(`Failed to fetch chats: ${res.statusText}`);
  }
  return (await res.json()) as ConversationSummary[];
}