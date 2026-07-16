/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: NavMenu.tsx
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
import { useWindowSize } from '@/hooks/useWindowSize';
import {
  BoxPlotOutlined,
  DeploymentUnitOutlined,
  DesktopOutlined,
  SettingOutlined,
  ShoppingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Menu, MenuProps, Tooltip } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type MenuItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  roles?: string[];
};

const getPathMap = (locale: string) => ({
  [`/${locale}/admin/configurazione`]: '/admin/configurazione',
  [`/${locale}/admin/dispositivi`]: '/admin/dispositivi',
  [`/${locale}/admin/updater-Esp32`]: '/admin/updater-Esp32',
  [`/${locale}/admin/catalogo`]: '/admin/catalogo',
  [`/${locale}/admin/impostazioni`]: '/admin/impostazioni',
  [`/${locale}/admin`]: '/admin',
});

const getSelectedKey = (pathname: string, locale: string): string => {
  const pathMap = getPathMap(locale);
  for (const [path, key] of Object.entries(pathMap)) {
    if (pathname.startsWith(path)) {
      return key;
    }
  }
  return '';
};

const menuItemStyle = {
  height: '4vh',
  padding: '0px 0px 0px 0px',
};

export default function NavMenu({ role }: { role?: string }) {
  const pathname = usePathname();
  const t = useTranslations('NavMenu');
  const locale = useLocale();
  const { width } = useWindowSize();

  const wh = width < 768;

  const iconStyle = {
    fontSize: '25px',
    lineHeight: '64px',
    display: 'flex',
    justifyContent: 'center',

    width: '100%',
  };

  const [selectedKey, setSelectedKey] = useState<string>(getSelectedKey(pathname, locale));

  const allMenuItems: MenuItem[] = [
    {
      key: '/admin',
      icon: <DesktopOutlined style={iconStyle} />,
      label: t('dashboard'),
      href: `/${locale}/admin`,
    },
    {
      key: '/admin/configurazione',
      icon: <DeploymentUnitOutlined style={iconStyle} />,
      label: t('system'),
      href: `/${locale}/admin/configurazione`,
    },
    {
      key: '/admin/dispositivi',
      icon: <BoxPlotOutlined style={iconStyle} />,
      label: t('devices'),
      href: `/${locale}/admin/dispositivi`,
    },
    {
      key: '/admin/catalogo',
      icon: <ShoppingOutlined style={iconStyle} />,
      label: t('catalog'),
      href: `/${locale}/admin/catalogo`,
    },
    {
      key: '/admin/updater-Esp32',
      icon: <SyncOutlined style={iconStyle} />,
      label: t('otaService'),
      href: `/${locale}/admin/updater-Esp32`,
    },
    {
      key: '/admin/impostazioni',
      icon: <SettingOutlined style={iconStyle} />,
      label: t('settings'),
      href: `/${locale}/admin/impostazioni`,
    },
  ];

  useEffect(() => {
    setSelectedKey(getSelectedKey(pathname, locale));
  }, [pathname]);

  const menuItems = useMemo(() => {
    const roles = Array.isArray(role) ? role : [role];
    return allMenuItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.some((itemRole) => roles.includes(itemRole));
    });
  }, [role]);

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      style={{ height: '100%', borderRight: 0 }}
      inlineIndent={0}
    >
      {menuItems.map((item) => (
        <Menu.Item key={item.key} icon={item.icon} style={menuItemStyle}>
          <Tooltip placement="right" title={item.label} mouseEnterDelay={0.1}>
            <Link href={item.href} style={{ color: 'inherit' }}>
              <span className="sr-only">{item.label}</span>
            </Link>
          </Tooltip>
        </Menu.Item>
      ))}
    </Menu>
  );
}
