import type {
  ProviderPlugin,
  ProviderAuthData,
  NormalizedPost,
  PublishResult
} from './types';
import type { ProviderCapabilities } from '../types/domain';

const capabilities: ProviderCapabilities = {
  maxTextLength: null,
  maxImages: 10,
  maxVideoMb: 500,
  supportedPostTypes: ['short', 'long_form', 'image_gallery'],
  authType: 'oauth2',
  notes: 'Tumblr provider stub - requires Tumblr OAuth implementation',
  retryConfig: {
    maxRetries: 3
  }
};

export const tumblrProvider: ProviderPlugin = {
  id: 'tumblr',
  label: 'Tumblr',
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
      errorMessage: 'Tumblr provider not fully implemented - requires Tumblr API integration'
    };
  },

  async fetchConstraints(): Promise<ProviderCapabilities> {
    return capabilities;
  }
};
