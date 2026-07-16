/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: page.tsx
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
import IPAddressIcon from '@/components/IPAddressIcon';
import LTEIcon from '@/components/LTEIcon';
import { useCustomNotification } from '@/hooks/useNotificationHook';
import { useWindowSize } from '@/hooks/useWindowSize';
import ConfigService from '@/services/configService';
import { ConfigData, Version } from '@/types';
import { ApiOutlined, MessageOutlined, WifiOutlined } from '@ant-design/icons';
import { Card, Col, Row, Space } from 'antd';
import Title from 'antd/es/typography/Title';
import { useTranslations } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';

export default function Dashboard() {
  const { notify, contextHolder } = useCustomNotification();
  const [recievers, setRecievers] = useState<ConfigData[]>([]);
  const [version, setVersion] = useState<Version>();
  const [remotesCount, setRemotesCount] = useState<number>(0);
  const t = useTranslations('Dashboard');
  const { width } = useWindowSize();
  const wh = width < 768;

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await ConfigService.getVersion();
        setVersion(response);
      } catch (error) {
        console.error('Errore nel caricamento della versione:', error);
      }
    };

    const fetchRecievers = async () => {
      try {
        const response = await ConfigService.getReceivers();
        setRecievers(response);
      } catch (error) {
        notify('error', 'Qualcosa non ha funzionato', 'Errore nel caricamento dei receivers');
        console.error('Errore nel caricamento dei receivers:', error);
      }
    };

    const fetchRemotesCount = async () => {
      try {
        const count = await ConfigService.getRemotesCount();
        setRemotesCount(count);
      } catch (error) {
        console.error('Errore nel caricamento del conteggio dei nodi gestiti:', error);
      }
    };

    fetchVersion();
    fetchRecievers();
    fetchRemotesCount();
  }, []);

  const getIconForLinks = (tipologia: number): ReactNode => {
    switch (tipologia) {
      case 2:
        return <IPAddressIcon />;
      case 4:
        return <LTEIcon />;
    }
  };

  return (
    <>
      {contextHolder}
      {recievers.map((receiver) => (
        <Card key={receiver.id} style={{ width: '100%', padding: 16, marginTop: 30 }}>
          <Row gutter={[24, 24]}>
            <Col
              xs={24}
              md={8}
              style={{ paddingLeft: '64px', paddingRight: '64px', borderRight: wh ? '' : '2px solid #f0f0f0' }}
            >
              <Title level={3}>
                <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {receiver.title}
                  {<WifiOutlined style={{ fontSize: '24px', color: '#1890ff' }} />}
                </span>
              </Title>
              <div style={{ color: 'grey', fontSize: '1rem' }}>
                <strong>System ID: </strong>
                {receiver.din.sid}
              </div>
              <div style={{ color: 'grey', fontSize: '1rem', marginBottom: 15 }}>
                <strong>DaaS Id Name: </strong>
                {receiver.din.sid}
              </div>
              <Card
                title={
                  <div style={{ color: 'grey', fontSize: '1rem' }}>
                    <strong>{t('version')}</strong>
                  </div>
                }
                size="small"
                style={{ minWidth: '170px', maxWidth: '300px' }}
              >
                <div style={{ color: 'grey', fontSize: '0.9rem' }}>
                  <strong>daasLibrary: </strong>
                  <span>{version?.compiler}</span>
                </div>
                <div style={{ color: 'grey', fontSize: '0.9rem' }}>
                  <strong>compiler: </strong>
                  <span>{version?.cppStandardLibrary}</span>
                </div>
                <div style={{ color: 'grey', fontSize: '0.9rem' }}>
                  <strong>cppStandardLibrary: </strong>
                  <span>{version?.daasLibrary}</span>
                </div>
                <div style={{ color: 'grey', fontSize: '0.9rem' }}>
                  <strong>node: </strong>
                  <span>{version?.node}</span>
                </div>
                <div style={{ color: 'grey', fontSize: '0.9rem' }}>
                  <strong>nodeAddonApi: </strong>
                  <span>{version?.nodeAddonApi}</span>
                </div>
              </Card>
            </Col>
            <Col
              xs={24}
              md={8}
              style={{ paddingLeft: '64px', paddingRight: '64px', borderRight: wh ? '' : '2px solid #f0f0f0' }}
            >
              <Title level={3}>
                <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {t('operationalStatus')}
                  {<ApiOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
                </span>
              </Title>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'grey', fontSize: '1rem' }}>
                  <strong>{t('managedNodes')}</strong>
                </span>
                <span style={{ color: 'grey', fontSize: '1rem' }}>
                  <strong>{remotesCount}</strong>
                </span>
              </div>
              <Space>
                <div>
                  <span style={{ color: 'grey', fontSize: '1rem' }}>
                    <strong>{t('activeLinks')}</strong>
                  </span>
                  {receiver.links?.map((link) => (
                    <div
                      key={link.id}
                      style={{
                        color: 'grey',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <span>{getIconForLinks(link.link)}</span>
                      {link.url}
                    </div>
                  ))}
                </div>
              </Space>
            </Col>
            <Col xs={24} md={8} style={{ paddingLeft: '64px', paddingRight: '64px' }}>
              <Title level={3}>
                <div style={{ display: 'flex', justifyContent: 'space-between', whiteSpace: 'nowrap' }}>
                  {t('statistics')}
                  {<MessageOutlined style={{ fontSize: '24px', color: '#faad14' }} />}
                </div>
              </Title>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'grey', fontSize: '1rem' }}>
                  <strong>{t('messagesExchanged')}</strong>
                </span>
                <span style={{ color: 'grey', fontSize: '1rem' }}>
                  <strong>0</strong>
                </span>
              </div>
            </Col>
          </Row>
        </Card>
      ))}
    </>
  );
}
