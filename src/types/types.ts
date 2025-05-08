export interface Bookmark {
  id: string;
  url: string;
  title: string | null;
  favicon: string | null;
  summary: string | null;
  created_at: string;
  tags: string[] | null;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

export interface BookmarkFormData {
  url: string;
  tags?: string;
}