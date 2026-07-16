/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: LanguageSwitcher.tsx
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
'use client';
import { GlobalOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space } from 'antd';
import { usePathname, useRouter } from 'next/navigation';

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = pathname.split('/')[1];

  const changeLanguage = (locale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    router.push(newPath);
  };

  const menuItems = [
    {
      key: 'it',
      label: 'Italiano',
      onClick: () => changeLanguage('it'),
    },
    {
      key: 'en',
      label: 'English',
      onClick: () => changeLanguage('en'),
    },
  ];

  const getCurrentLanguageLabel = () => {
    return menuItems.find((item) => item.key === currentLocale)?.label || '';
  };

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottomRight">
      <Button
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: 'black',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Space>
          <GlobalOutlined />
          <span>{getCurrentLanguageLabel()}</span>
        </Space>
      </Button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
