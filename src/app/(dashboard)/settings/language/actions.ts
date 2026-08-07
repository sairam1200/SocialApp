'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isSupportedLocale } from '@/i18n/locales';
import { LOCALE_COOKIE } from '@/i18n/request';

/**
 * Persist the user's language choice.
 *
 * A server action rather than a client-side cookie write, for two reasons: the
 * cookie can be `httpOnly`-adjacent and set with proper attributes, and
 * `revalidatePath` forces the layout to re-render with the new catalog so the UI
 * changes language immediately instead of on the next hard navigation.
 *
 * The locale is validated against the registry before being written. Without that
 * check this is an arbitrary-value cookie sink, and src/i18n/request.ts would try
 * to `import()` a path derived from it.
 */
export async function setLocalePreference(locale: string): Promise<void> {
  if (!isSupportedLocale(locale)) {
    // Ignore silently: an unsupported locale means a stale or tampered client,
    // and throwing here would surface as an unhandled server-action error.
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    // Readable by client code that needs to know the active locale; it carries no
    // security value, only a display preference.
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
  });

  revalidatePath('/', 'layout');
}
