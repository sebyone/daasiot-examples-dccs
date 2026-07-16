import { DownOutlined, LogoutOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, MenuProps, Space } from 'antd';
import React from 'react';
import styles from './UserMenu.module.css';

const items: MenuProps['items'] = [
  {
    label: <div>Profilo</div>,
    key: '0',
  },
  {
    type: 'divider',
  },
  {
    label: 'Log Out',
    icon: <LogoutOutlined style={{ color: 'red' }} />,
    key: 'logout',
  },
];

export default function UserMenu() {
  return (
    <>
      <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
        <Button
          onClick={(e) => e.preventDefault()}
          type="link"
          style={{ color: 'white', border: ' none', backgroundColor: 'transparent' }}
        >
          <Space>
            <span className={styles.user}>{'Utente xxx'}</span>
            <Avatar
              icon={<UserOutlined style={{ color: 'white' }} />}
              style={{ backgroundColor: 'transparent', border: 'none' }}
            />
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>
    </>
  );
}
