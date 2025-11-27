import type {
  ProviderPlugin,
  ProviderAuthData,
  NormalizedPost,
  PublishResult
} from './types';
import type { ProviderCapabilities } from '../types/domain';

const capabilities: ProviderCapabilities = {
  maxTextLength: 300,
  maxImages: 4,
  maxVideoMb: 50,
  supportedPostTypes: ['short', 'image_gallery'],
  authType: 'api_key',
  notes: 'Bluesky provider stub - requires full AT Protocol implementation',
  retryConfig: {
    maxRetries: 3
  }
};

export const blueskyProvider: ProviderPlugin = {
  id: 'bluesky',
  label: 'Bluesky',
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
      errorMessage: 'Bluesky provider not fully implemented - requires AT Protocol integration'
    };
  },

  async fetchConstraints(): Promise<ProviderCapabilities> {
    return capabilities;
  }
};
