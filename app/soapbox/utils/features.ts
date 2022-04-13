// Detect backend features to conditionally render elements
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import { createSelector } from 'reselect';
import gte from 'semver/functions/gte';
import lt from 'semver/functions/lt';

import { custom } from 'soapbox/custom';

import type { Instance } from 'soapbox/types/entities';

// Import custom overrides, if exists
const overrides = custom('features');

// Truthy array convenience function
const any = (arr: Array<any>): boolean => arr.some(Boolean);

// For uglification
export const MASTODON    = 'Mastodon';
export const PLEROMA     = 'Pleroma';
export const MITRA       = 'Mitra';
export const TRUTHSOCIAL = 'TruthSocial';
export const PIXELFED    = 'Pixelfed';

const getInstanceFeatures = (instance: Instance) => {
  const v = parseVersion(instance.version);
  const features = instance.pleroma.getIn(['metadata', 'features'], ImmutableList()) as ImmutableList<string>;
  const federation = instance.pleroma.getIn(['metadata', 'federation'], ImmutableMap()) as ImmutableMap<string, any>;

  return {
    media: true,
    privacyScopes: v.software !== TRUTHSOCIAL,
    spoilers: v.software !== TRUTHSOCIAL,
    filters: v.software !== TRUTHSOCIAL,
    polls: any([
      v.software === MASTODON && gte(v.version, '2.8.0'),
      v.software === PLEROMA,
    ]),
    scheduledStatuses: any([
      v.software === MASTODON && gte(v.version, '2.7.0'),
      v.software === PLEROMA,
    ]),
    bookmarks: any([
      v.software === MASTODON && gte(v.compatVersion, '3.1.0'),
      v.software === PLEROMA && gte(v.version, '0.9.9'),
      v.software === PIXELFED,
    ]),
    lists: any([
      v.software === MASTODON && gte(v.compatVersion, '2.1.0'),
      v.software === PLEROMA && gte(v.version, '0.9.9'),
    ]),
    suggestions: any([
      v.software === MASTODON && gte(v.compatVersion, '2.4.3'),
      v.software === TRUTHSOCIAL,
      features.includes('v2_suggestions'),
    ]),
    suggestionsV2: any([
      v.software === MASTODON && gte(v.compatVersion, '3.4.0'),
      v.software === TRUTHSOCIAL,
      features.includes('v2_suggestions'),
    ]),
    blockersVisible: features.includes('blockers_visible'),
    trends: any([
      v.software === MASTODON && gte(v.compatVersion, '3.0.0'),
      v.software === TRUTHSOCIAL,
    ]),
    mediaV2: any([
      v.software === MASTODON && gte(v.compatVersion, '3.1.3'),
      // Even though Pleroma supports these endpoints, it has disadvantages
      // v.software === PLEROMA && gte(v.version, '2.1.0'),
    ]),
    directTimeline: any([
      v.software === MASTODON && lt(v.compatVersion, '3.0.0'),
      v.software === PLEROMA && gte(v.version, '0.9.9'),
    ]),
    conversations: any([
      v.software === MASTODON && gte(v.compatVersion, '2.6.0'),
      v.software === PLEROMA && gte(v.version, '0.9.9'),
      v.software === PIXELFED,
    ]),
    emojiReacts: v.software === PLEROMA && gte(v.version, '2.0.0'),
    emojiReactsRGI: v.software === PLEROMA && gte(v.version, '2.2.49'),
    focalPoint: v.software === MASTODON && gte(v.compatVersion, '2.3.0'),
    importAPI: v.software === PLEROMA,
    importMutes: v.software === PLEROMA && gte(v.version, '2.2.0'),
    emailList: features.includes('email_list'),
    chats: v.software === PLEROMA && gte(v.version, '2.1.0'),
    chatsV2: v.software === PLEROMA && gte(v.version, '2.3.0'),
    scopes: v.software === PLEROMA ? 'read write follow push admin' : 'read write follow push',
    federating: federation.get('enabled', true) === true, // Assume true unless explicitly false
    richText: v.software === PLEROMA,
    securityAPI: any([
      v.software === PLEROMA,
      v.software === TRUTHSOCIAL,
    ]),
    settingsStore: any([
      v.software === PLEROMA,
      v.software === TRUTHSOCIAL,
    ]),
    accountAliasesAPI: v.software === PLEROMA,
    resetPasswordAPI: v.software === PLEROMA,
    exposableReactions: features.includes('exposable_reactions'),
    accountSubscriptions: v.software === PLEROMA && gte(v.version, '1.0.0'),
    accountNotifies: any([
      v.software === MASTODON && gte(v.compatVersion, '3.3.0'),
      v.software === PLEROMA && gte(v.version, '2.4.50'),
    ]),
    unrestrictedLists: v.software === PLEROMA,
    accountByUsername: v.software === PLEROMA,
    profileDirectory: any([
      v.software === MASTODON && gte(v.compatVersion, '3.0.0'),
      features.includes('profile_directory'),
    ]),
    accountLookup: any([
      v.software === MASTODON && gte(v.compatVersion, '3.4.0'),
      v.software === PLEROMA && gte(v.version, '2.4.50'),
    ]),
    remoteInteractionsAPI: v.software === PLEROMA && gte(v.version, '2.4.50'),
    explicitAddressing: any([
      v.software === PLEROMA && gte(v.version, '1.0.0'),
      v.software === TRUTHSOCIAL,
    ]),
    accountEndorsements: v.software === PLEROMA && gte(v.version, '2.4.50'),
    quotePosts: any([
      v.software === PLEROMA && gte(v.version, '2.4.50'),
      instance.feature_quote === true,
    ]),
    birthdays: v.software === PLEROMA && gte(v.version, '2.4.50'),
    ethereumLogin: v.software === MITRA,
    accountMoving: v.software === PLEROMA && gte(v.version, '2.4.50'),
    notes: any([
      v.software === MASTODON && gte(v.compatVersion, '3.2.0'),
      v.software === PLEROMA && gte(v.version, '2.4.50'),
    ]),
    trendingTruths: v.software === TRUTHSOCIAL,
    trendingStatuses: v.software === MASTODON && gte(v.compatVersion, '3.5.0'),
    pepe: v.software === TRUTHSOCIAL,

    // FIXME: long-term this shouldn't be a feature,
    // but for now we want it to be overrideable in the build
    darkMode: true,
  };
};

export type Features = ReturnType<typeof getInstanceFeatures>;

export const getFeatures = createSelector([
  (instance: Instance) => instance,
], (instance): Features => {
  const features = getInstanceFeatures(instance);
  return Object.assign(features, overrides) as Features;
});

interface Backend {
  software: string | null,
  version: string,
  compatVersion: string,
}

export const parseVersion = (version: string): Backend => {
  const regex = /^([\w.]*)(?: \(compatible; ([\w]*) (.*)\))?$/;
  const match = regex.exec(version);

  if (match) {
    return {
      software: match[2] || MASTODON,
      version: match[3] || match[1],
      compatVersion: match[1],
    };
  } else {
    // If we can't parse the version, this is a new and exotic backend.
    // Fall back to minimal featureset.
    return {
      software: null,
      version: '0.0.0',
      compatVersion: '0.0.0',
    };
  }
};
