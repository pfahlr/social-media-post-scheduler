import type {
  ProviderPlugin,
  ProviderAuthData,
  NormalizedPost,
  PublishResult
} from './types';
import type { ProviderCapabilities } from '../types/domain';

const capabilities: ProviderCapabilities = {
  maxTextLength: 500,
  maxImages: 4,
  maxVideoMb: 40,
  supportedPostTypes: ['short', 'image_gallery'],
  authType: 'oauth2',
  notes: 'Mastodon provider stub for v0',
  retryConfig: {
    maxRetries: 3
  }
};

export const mastodonProvider: ProviderPlugin = {
  id: 'mastodon',
  label: 'Mastodon',
  capabilities,

  async validateAuth(_authData: ProviderAuthData): Promise<boolean> {
    // TODO: ping instance API to verify token
    return true;
  },

  getAuthUrl(_state: string): string {
    // TODO: implement OAuth2 auth URL generation
    return '';
  },

  async handleOAuthCallback(_req: unknown): Promise<ProviderAuthData> {
    // TODO: exchange code for token, return structured auth data
    return {};
  },

  normalizePostInput(postDraft: NormalizedPost): NormalizedPost {
    // TODO: enforce Mastodon-specific constraints
    return postDraft;
  },

  async publishPost(_socialAccount, _normalizedPost): Promise<PublishResult> {
    // TODO: call Mastodon API to publish post
    return {
      success: false,
      errorMessage: 'Not implemented'
    };
  },

  async fetchConstraints(): Promise<ProviderCapabilities> {
    // TODO: optionally fetch per-instance constraints
    return capabilities;
  }
};
