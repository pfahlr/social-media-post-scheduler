import axios from 'axios';
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
  notes: 'Mastodon provider for federated instances',
  retryConfig: {
    maxRetries: 3
  }
};

export const mastodonProvider: ProviderPlugin = {
  id: 'mastodon',
  label: 'Mastodon',
  capabilities,

  async validateAuth(authData: ProviderAuthData): Promise<boolean> {
    try {
      const { instanceUrl, accessToken } = authData as {
        instanceUrl?: string;
        accessToken?: string;
      };

      if (!instanceUrl || !accessToken) {
        return false;
      }

      const response = await axios.get(`${instanceUrl}/api/v1/accounts/verify_credentials`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        timeout: 5000
      });

      return response.status === 200;
    } catch {
      return false;
    }
  },

  getAuthUrl(state: string): string {
    return `/auth/mastodon?state=${state}`;
  },

  async handleOAuthCallback(_req: unknown): Promise<ProviderAuthData> {
    return {};
  },

  normalizePostInput(postDraft: NormalizedPost): NormalizedPost {
    let bodyText = postDraft.bodyText;
    if (bodyText.length > capabilities.maxTextLength!) {
      bodyText = bodyText.substring(0, capabilities.maxTextLength! - 3) + '...';
    }

    let mediaAssetIds = postDraft.mediaAssetIds;
    if (mediaAssetIds.length > capabilities.maxImages!) {
      mediaAssetIds = mediaAssetIds.slice(0, capabilities.maxImages!);
    }

    return {
      ...postDraft,
      bodyText,
      mediaAssetIds
    };
  },

  async publishPost(socialAccount, normalizedPost): Promise<PublishResult> {
    try {
      const { instanceUrl, accessToken } = socialAccount.authData as {
        instanceUrl?: string;
        accessToken?: string;
      };

      if (!instanceUrl || !accessToken) {
        return {
          success: false,
          errorMessage: 'Missing instance URL or access token'
        };
      }

      const response = await axios.post(
        `${instanceUrl}/api/v1/statuses`,
        {
          status: normalizedPost.bodyText,
          visibility: 'public'
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return {
        success: true,
        providerPostId: response.data.id,
        rawResponse: response.data
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return {
        success: false,
        errorMessage,
        rawResponse: err
      };
    }
  },

  async fetchConstraints(): Promise<ProviderCapabilities> {
    return capabilities;
  }
};
