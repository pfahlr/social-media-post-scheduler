export type PostType = 'short' | 'long_form' | 'image_gallery' | 'video' | 'link';

export interface ProviderRetryConfig {
  maxRetries: number;
}

export interface ProviderCapabilities {
  maxTextLength: number | null;
  maxImages: number | null;
  maxVideoMb: number | null;
  supportedPostTypes: PostType[];
  authType: 'oauth2' | 'api_key' | 'basic' | 'custom';
  notes?: string;
  retryConfig?: ProviderRetryConfig;
}
