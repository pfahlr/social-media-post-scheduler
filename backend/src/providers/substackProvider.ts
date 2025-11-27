import type {
  ProviderPlugin,
  ProviderAuthData,
  NormalizedPost,
  PublishResult
} from './types';
import type { ProviderCapabilities } from '../types/domain';

const capabilities: ProviderCapabilities = {
  maxTextLength: null,
  maxImages: null,
  maxVideoMb: null,
  supportedPostTypes: ['long_form'],
  authType: 'api_key',
  notes: 'Substack provider stub - may require unofficial API or automation',
  retryConfig: {
    maxRetries: 3
  }
};

export const substackProvider: ProviderPlugin = {
  id: 'substack',
  label: 'Substack',
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
      errorMessage: 'Substack provider not fully implemented - requires custom integration'
    };
  },

  async fetchConstraints(): Promise<ProviderCapabilities> {
    return capabilities;
  }
};
