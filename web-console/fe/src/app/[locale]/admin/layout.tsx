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
'use client';

import { Layout } from 'antd';

const { Header, Sider, Content } = Layout;

import NavMenu from '@/components/base/NavMenu';
import Settings from '@/components/base/Settings';
import UserMenu from '@/components/base/UserMenu';
import DaaSIoTLogo from '@/components/DaaSIoTLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Footer } from 'antd/es/layout/layout';
import version from '../../../../version';
import styles from './Layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { width } = useWindowSize();
  const wh = width < 1024;
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          padding: '0 1rem',
          top: 0,
          background: '#001529',
          zIndex: 1,
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
        }}
      >
        <DaaSIoTLogo />

        <div
          style={{
            display: 'flex',
            gap: '2px',
            alignItems: 'flex-end',
            minWidth: 'fit-content',
          }}
        >
          <UserMenu />
        </div>
      </Header>
      <Layout style={{ padding: 0 }}>
        <Sider breakpoint="lg" collapsedWidth="0" className={styles.siderCustom} width={130}>
          <NavMenu />
        </Sider>

        <Content
          style={{
            margin: 0,
            padding: 24,
            background: 'white',
          }}
        >
          <div id="form-menu-portal" style={{ marginTop: -20 }}></div>
          {children}
        </Content>
      </Layout>
      <Footer
        style={{
          textAlign: 'left',
          backgroundColor: '#002140',
          height: '25px',
          position: 'fixed',
          bottom: '0',
          width: '100%',
          padding: '0 1rem',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ color: '#fff', fontSize: '0.8rem', lineHeight: 1 }}>DaaS-IoT NodeJs | ver {version}</div>
      </Footer>
    </Layout>
  );
}
