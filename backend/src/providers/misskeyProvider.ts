import type {
  ProviderPlugin,
  ProviderAuthData,
  NormalizedPost,
  PublishResult
} from './types';
import type { ProviderCapabilities } from '../types/domain';

const capabilities: ProviderCapabilities = {
  maxTextLength: 3000,
  maxImages: 4,
  maxVideoMb: 100,
  supportedPostTypes: ['short', 'image_gallery'],
  authType: 'api_key',
  notes: 'Misskey provider stub - federated like Mastodon with different API',
  retryConfig: {
    maxRetries: 3
  }
};

export const misskeyProvider: ProviderPlugin = {
  id: 'misskey',
  label: 'Misskey',
  capabilities,

  async validateAuth(_authData: ProviderAuthData): Promise<boolean> {
    return true;
  },

  normalizePostInput(postDraft: NormalizedPost): NormalizedPost {
    return postDraft;
  },

  async publishPost(_socialAccount, _normalizedPost): Promise<PublishResult> {
    return {
      success: false,
      errorMessage: 'Misskey provider not fully implemented - requires Misskey API integration'
    };
  },

  async fetchConstraints(): Promise<ProviderCapabilities> {
    return capabilities;
  }
};
