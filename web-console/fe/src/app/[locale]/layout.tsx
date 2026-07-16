/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: layout.tsx
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { ThemeConfig } from 'antd';
import { ConfigProvider } from 'antd';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import './globals.css';

const config: ThemeConfig = {
  // Use dark algorithm
  // algorithm: theme.darkAlgorithm,
  // token: {
  //   colorPrimary: '#1890ff',
  // },
};

export const metadata: Metadata = {
  title: 'DaaS-NodeJS - Sebyone',
  description: 'DaaS-NodeJS app by Sebyone',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const theme = {
    components: {
      Form: { verticalLabelPadding: 0 },
    },
  };

  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body suppressHydrationWarning={true}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AntdRegistry>
            <ConfigProvider theme={theme}>{children}</ConfigProvider>
          </AntdRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
