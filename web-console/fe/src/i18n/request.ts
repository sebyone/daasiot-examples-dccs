/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: i18n.ts
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['it', 'en'] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  if (!locale || !locales.includes(locale as (typeof locales)[number])) notFound();

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
