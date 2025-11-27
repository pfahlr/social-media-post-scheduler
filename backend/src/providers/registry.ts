import type { ProviderPlugin } from './types';
import { mastodonProvider } from './mastodonProvider';

const providers: Record<string, ProviderPlugin> = {
  [mastodonProvider.id]: mastodonProvider
  // TODO: register substack, instagram, misskey, bluesky, tumblr providers
};

export function getProvider(id: string): ProviderPlugin | undefined {
  return providers[id];
}

export function listProviders(): ProviderPlugin[] {
  return Object.values(providers);
}
