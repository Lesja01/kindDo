export type DreamStatus = "OPEN" | "TAKEN" | "COMPLETED";
export type DreamVisibility = "public" | "private";
export type SocialPlatform = "instagram" | "tiktok" | "telegram";

export type Profile = {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  age: number | null;
  location: string | null;
  reputation_score: number;
  created_at: string;
};

export type Dream = {
  id: string;
  author_id: string;
  title: string;
  description: string;
  video_url: string;
  category: string;
  visibility: DreamVisibility;
  status: DreamStatus;
  helper_id: string | null;
  created_at: string;
  author?: Profile | null;
  helper?: Profile | null;
  tasks?: DreamTask[];
  media?: DreamMedia[];
  responders?: DreamResponder[];
};

export type DreamResponder = {
  id: string;
  candidate?: Pick<Profile, "id" | "name" | "avatar"> | Pick<Profile, "id" | "name" | "avatar">[] | null;
};

export type DreamMedia = {
  id: string;
  dream_id: string;
  url: string;
  position: number;
  created_at: string;
};

export type DreamTask = {
  id: string;
  dream_id: string;
  author_id: string;
  helper_id: string | null;
  text: string;
  completed: boolean;
  status: DreamStatus;
  created_at: string;
  helper?: Profile | null;
};

export type Chat = {
  id: string;
  dream_id: string;
  task_id: string | null;
  user_1: string;
  user_2: string;
  created_at: string;
  dream?: Dream | null;
  other_user?: Profile | null;
};

export type ChatRead = {
  chat_id: string;
  user_id: string;
  last_read_at: string;
};

export type Message = {
  id: string;
  chat_id: string;
  sender_id: string | null;
  text: string;
  kind: "user" | "system";
  attachment_type: "image" | "contact" | "location" | null;
  attachment_url: string | null;
  attachment_payload: Record<string, unknown> | null;
  created_at: string;
  edited_at: string | null;
  sender?: Profile | null;
};

export type Story = {
  id: string;
  dream_id: string;
  author_id: string;
  helper_id: string;
  video_url: string;
  text: string | null;
  created_at: string;
  dream?: Dream | null;
  author?: Profile | null;
  helper?: Profile | null;
  mentions?: StoryMention[];
};

export type StoryMention = {
  id: string;
  story_id: string;
  user_id: string | null;
  name: string;
  created_at: string;
  user?: Profile | null;
};

export type SocialLink = {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  url: string;
};

export type Favorite = {
  user_id: string;
  dream_id: string;
  created_at: string;
};

export type ProfilePhoto = {
  id: string;
  user_id: string;
  url: string;
  created_at: string;
};
