import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface User {
  id: string;
  email: string;
}

export interface SocialAccount {
  id: string;
  providerId: string;
  displayName: string;
  handle: string;
  instanceUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  lastValidatedAt?: string | null;
}

export interface Provider {
  id: string;
  label: string;
  capabilities: {
    maxTextLength: number | null;
    maxImages: number | null;
    maxVideoMb: number | null;
    supportedPostTypes: string[];
    authType: string;
    notes?: string;
  };
}

export interface PostDraft {
  id: string;
  userId: string;
  title?: string | null;
  bodyText: string;
  postType: string;
  mediaAssetIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledPost {
  id: string;
  userId: string;
  postDraftId: string;
  scheduledFor: string;
  publishImmediately: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  retentionUntil: string;
  postDraft?: PostDraft;
  postTargets?: Array<{
    id: string;
    providerId: string;
    socialAccountId: string;
    status: string;
    errorMessage?: string | null;
    socialAccount?: Partial<SocialAccount>;
  }>;
}

export const authApi = {
  signup: (email: string, password: string) =>
    apiClient.post<User>('/auth/signup', { email, password }),
  login: (email: string, password: string) =>
    apiClient.post<User>('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get<User>('/auth/me')
};

export const socialAccountsApi = {
  list: () => apiClient.get<{ accounts: SocialAccount[] }>('/social-accounts'),
  create: (data: {
    providerId: string;
    displayName: string;
    handle: string;
    instanceUrl?: string | null;
    authData: Record<string, unknown>;
  }) => apiClient.post<SocialAccount>('/social-accounts', data),
  update: (id: string, data: Partial<SocialAccount>) =>
    apiClient.put<SocialAccount>(`/social-accounts/${id}`, data),
  delete: (id: string) => apiClient.delete(`/social-accounts/${id}`),
  listProviders: () => apiClient.get<{ providers: Provider[] }>('/social-accounts/providers')
};

export const draftsApi = {
  list: () => apiClient.get<{ drafts: PostDraft[] }>('/drafts'),
  get: (id: string) => apiClient.get<PostDraft>(`/drafts/${id}`),
  create: (data: {
    title?: string | null;
    bodyText: string;
    postType: string;
    mediaAssetIds?: string[];
  }) => apiClient.post<PostDraft>('/drafts', data),
  update: (id: string, data: Partial<PostDraft>) =>
    apiClient.put<PostDraft>(`/drafts/${id}`, data),
  clone: (id: string) => apiClient.post<PostDraft>(`/drafts/${id}/clone`)
};

export const mediaApi = {
  upload: (mimeType: string, data: string) =>
    apiClient.post<{ id: string; mimeType: string; sizeBytes: number; createdAt: string }>(
      '/media',
      { mimeType, data }
    ),
  get: (id: string) => apiClient.get(`/media/${id}`, { responseType: 'blob' }),
  delete: (id: string) => apiClient.delete(`/media/${id}`)
};

export const scheduledPostsApi = {
  list: () => apiClient.get<{ posts: ScheduledPost[] }>('/scheduled-posts'),
  get: (id: string) => apiClient.get<ScheduledPost>(`/scheduled-posts/${id}`),
  create: (data: {
    postDraftId: string;
    scheduledFor?: string;
    publishImmediately?: boolean;
    targets: Array<{
      socialAccountId: string;
      providerId: string;
    }>;
  }) => apiClient.post<ScheduledPost>('/scheduled-posts', data),
  cancel: (id: string) => apiClient.post<ScheduledPost>(`/scheduled-posts/${id}/cancel`)
};

export const configApi = {
  get: () =>
    apiClient.get<{
      postRetentionDays: number;
      schedulerIntervalSeconds: number;
      defaultMaxRetries: number;
    }>('/config')
};
