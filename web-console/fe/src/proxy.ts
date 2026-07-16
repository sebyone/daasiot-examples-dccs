/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: middleware.ts
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const locales = ['it', 'en'];
const defaultLocale = 'it';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
});

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}/admin`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(it|en)/:path*'],
};
