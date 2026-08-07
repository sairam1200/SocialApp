import type { Metadata } from 'next';
import {
  getPublicProfile,
  profileDescription,
  profileDisplayName,
  profileJsonLd,
} from '@/lib/public-profile';
import { profileUrl, siteConfig } from '@/lib/site-config';

/**
 * Server layout for the public profile route — this is what makes profiles
 * indexable.
 *
 * `page.tsx` is a client component ("use client"), and a client component cannot
 * export `metadata` or `generateMetadata`. The result was that Gaddr's most
 * valuable SEO surface — the shareable public profile, the core artifact of the
 * product — shipped with only the generic root metadata: title "Gaddr",
 * description "Gaddr". Every profile looked identical to a crawler and to any
 * social platform generating a link preview.
 *
 * Wrapping the route in a *server* layout fixes that without rewriting the
 * interactive page: layouts and pages resolve independently, so this file runs on
 * the server and emits real per-profile metadata and JSON-LD while `page.tsx`
 * stays a client component.
 */

type LayoutParams = { username: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<LayoutParams>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  const canonical = profileUrl(username);

  // Backend unreachable or profile missing: emit honest, non-indexable metadata
  // rather than a wrong title. Never throw here — that would fail the page render.
  if (!profile) {
    return {
      title: `@${username}`,
      description: `Profile @${username} on ${siteConfig.name}.`,
      alternates: { canonical },
      robots: { index: false, follow: true },
    };
  }

  const name = profileDisplayName(profile);
  const description = profileDescription(profile);

  // Title carries both the display name and the handle: people search for either,
  // and the handle disambiguates common names.
  const title = `${name} (@${profile.userName})`;

  const images = profile.profileImage
    ? [{ url: profile.profileImage, alt: `${name} on ${siteConfig.name}` }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'profile',
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      ...(images ? { images } : {}),
      ...(profile.firstName ? { firstName: profile.firstName } : {}),
      ...(profile.lastName ? { lastName: profile.lastName } : {}),
      username: profile.userName,
    },
    twitter: {
      card: profile.profileImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        // Allow full-size image previews and untruncated snippets: profile pages
        // are the content, so richer previews are wanted here.
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function PublicProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<LayoutParams>;
}) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  return (
    <>
      {profile ? (
        // JSON-LD, not visible markup. `sameAs` links this profile to the user's
        // presences on other platforms — the entity-consolidation signal that a
        // universal-profile product should be emitting.
        <script
          type="application/ld+json"
          // Content is server-generated from our own API response, not user-authored
          // HTML. JSON.stringify escapes the values; the `<` guard prevents a
          // crafted bio from closing the script tag early.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(profileJsonLd(profile)).replace(
              /</g,
              '\\u003c',
            ),
          }}
        />
      ) : null}
      {children}
    </>
  );
}
