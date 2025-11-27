import type { ProviderPlugin } from './types';
import { mastodonProvider } from './mastodonProvider';
import { blueskyProvider } from './blueskyProvider';
import { instagramProvider } from './instagramProvider';
import { substackProvider } from './substackProvider';
import { misskeyProvider } from './misskeyProvider';
import { tumblrProvider } from './tumblrProvider';

const providers: Record<string, ProviderPlugin> = {
  [mastodonProvider.id]: mastodonProvider,
  [blueskyProvider.id]: blueskyProvider,
  [instagramProvider.id]: instagramProvider,
  [substackProvider.id]: substackProvider,
  [misskeyProvider.id]: misskeyProvider,
  [tumblrProvider.id]: tumblrProvider
};

export function getProvider(id: string): ProviderPlugin | undefined {
  return providers[id];
}

export function listProviders(): ProviderPlugin[] {
  return Object.values(providers);
}
