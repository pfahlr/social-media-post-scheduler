import type { ProviderCapabilities } from '../types/domain';

export interface ProviderAuthData {
  [key: string]: unknown;
}

export interface NormalizedPost {
  title?: string | null;
  bodyText: string;
  mediaAssetIds: string[];
  postType: string;
}

export interface PublishResult {
  success: boolean;
  providerPostId?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

export interface ProviderPlugin {
  id: string;
  label: string;
  capabilities: ProviderCapabilities;

  validateAuth(authData: ProviderAuthData): Promise<boolean>;

  getAuthUrl?(state: string): string;

  handleOAuthCallback?(req: unknown): Promise<ProviderAuthData>;

  normalizePostInput(
    postDraft: NormalizedPost,
    options?: Record<string, unknown>
  ): NormalizedPost;

  publishPost(
    socialAccount: {
      id: string;
      providerId: string;
      instanceUrl?: string | null;
      authData: ProviderAuthData;
    },
    normalizedPost: NormalizedPost
  ): Promise<PublishResult>;

  fetchConstraints?(): Promise<ProviderCapabilities>;
}
