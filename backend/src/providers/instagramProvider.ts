import type {
  ProviderPlugin,
  ProviderAuthData,
  NormalizedPost,
  PublishResult
} from './types';
import type { ProviderCapabilities } from '../types/domain';

const capabilities: ProviderCapabilities = {
  maxTextLength: 2200,
  maxImages: 10,
  maxVideoMb: 100,
  supportedPostTypes: ['short', 'image_gallery', 'video'],
  authType: 'oauth2',
  notes: 'Instagram provider stub - requires Facebook Graph API setup',
  retryConfig: {
    maxRetries: 3
  }
};

export const instagramProvider: ProviderPlugin = {
  id: 'instagram',
  label: 'Instagram',
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
      errorMessage: 'Instagram provider not fully implemented - requires Facebook Graph API'
    };
  },

  async fetchConstraints(): Promise<ProviderCapabilities> {
    return capabilities;
  }
};
