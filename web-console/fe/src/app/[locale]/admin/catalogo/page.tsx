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
import { useCustomNotification } from '@/hooks/useNotificationHook';
import ConfigService from '@/services/configService';
import { Dev, DeviceGroup, DeviceModel, DeviceModelGroup, Resource } from '@/types';
import { SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { Button, Card, Col, Divider, Empty, Input, Layout, List, Menu, Pagination, Row, Spin, Typography } from 'antd';
import debounce from 'debounce';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Catalogo.module.css';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

interface DeviceGroupData {
  id: number;
  title: string;
}

export default function Catalogo() {
  const t = useTranslations('Catalogo');
  const [selectedGroup, setSelectedGroup] = useState<DeviceGroupData | null>(null);
  const [selectedModel, setSelectedModel] = useState<Dev | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { notify, contextHolder } = useCustomNotification();
  const locale = useLocale();
  const router = useRouter();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [groups, setGroups] = useState<DeviceGroup | null>(null);
  const [deviceModels, setDeviceModels] = useState<DeviceModel | null>(null);
  const [groupsPagination, setGroupsPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modelsPagination, setModelsPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const fetchDeviceModelGroups = async (page: number, pageSize: number, search: string = '') => {
    try {
      const offset = (page - 1) * pageSize;
      const response = await ConfigService.getDeviceModelGroups(offset, pageSize, search);
      setGroups(response);
      setGroupsPagination((prev) => ({ ...prev, total: response.pagination.total }));
    } catch (error) {
      notify('error', t('error'), t('errorGetDevices'));
    }
  };

  useEffect(() => {
    fetchDeviceModelGroups(groupsPagination.current, groupsPagination.pageSize);
  }, [groupsPagination.current, groupsPagination.pageSize]);

  const fetchDeviceModels = async (groupId: number | null, page: number, pageSize: number, search: string = '') => {
    setIsLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      let response;
      if (groupId) {
        response = await ConfigService.getDeviceModelByModelGroupId(groupId, offset, pageSize, search);
      } else {
        response = await ConfigService.getDeviceModel(offset, pageSize, search);
      }
      setDeviceModels(response);
      setModelsPagination((prev) => ({ ...prev, total: response.pagination.total }));
    } catch (error) {
      notify('error', t('error'), t('errorGetModels'));
    } finally {
      setIsLoading(false);
    }
  };
  const debouncedSearch = debounce((searchTerm: string) => {
    setIsSearchActive(searchTerm.length > 0);
    fetchDeviceModels(selectedGroup?.id || null, 1, modelsPagination.pageSize, searchTerm);
  }, 300);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    debouncedSearch(searchTerm);
  };
  const handleGroupSelect = (groupId: number | null, groupTitle: string | null) => {
    if (groupId === null) {
      setSelectedGroup(null);
    } else {
      setSelectedGroup({ id: groupId, title: groupTitle ?? '' });
    }
    setSelectedModel(null);
    fetchDeviceModels(groupId, 1, modelsPagination.pageSize, searchTerm);
  };
  const handleModelsPaginationChange = (page: number, pageSize?: number) => {
    setModelsPagination((prev) => ({ ...prev, current: page, pageSize: pageSize || prev.pageSize }));
    fetchDeviceModels(selectedGroup?.id || null, page, pageSize || modelsPagination.pageSize, searchTerm);
  };

  const handleGroupsPaginationChange = (page: number, pageSize?: number) => {
    setGroupsPagination((prev) => ({ ...prev, current: page, pageSize: pageSize || prev.pageSize }));
  };

  const handleModelSelect = (model: Dev) => {
    setSelectedModel(model);
  };

  const handleLoadFW = () => {
    router.push(`/${locale}/admin/catalogo/ESPtool`);
  };

  const getCoverModelImage = (model: Dev): string | undefined => {
    return model.resources?.find((resource) => resource.resource_type === 4 && resource.name == 'copertina')?.link;
  };

  const getPinoutModelImage = (model: Dev): string | undefined => {
    return model.resources?.find(
      (resource) => resource.resource_type === 4 && resource.name == 'ESP32 pinout reference'
    )?.link;
  };

  const getDatasheetModelDocuments = (model: Dev): string | undefined => {
    return model.resources?.find((resource) => resource.resource_type === 2 && resource.name == 'datasheet')?.link;
  };

  const getHardwareDesignGuideLinesModelDocuments = (model: Dev): string | undefined => {
    return model.resources?.find(
      (resource) => resource.resource_type === 2 && resource.name == 'hardware design guidelines'
    )?.link;
  };

  const getProgrammingGuideModelDocuments = (model: Dev): string | undefined => {
    return model.resources?.find((resource) => resource.resource_type === 1 && resource.name == 'programming guide')
      ?.link;
  };

  return (
    <>
      {contextHolder}
      <div className={styles.container}>
        <Layout style={{ minHeight: '85vh' }}>
          <Content style={{ padding: '24px', backgroundColor: 'white' }}>
            <Row gutter={24}>
              <Col span={24} style={{ marginBottom: '20px' }}>
                <Input
                  placeholder={t('searchDevice')}
                  prefix={<SearchOutlined />}
                  onChange={handleSearchChange}
                  value={searchTerm}
                />
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <Card
                  title={t('devicesGroup')}
                  style={{ marginBottom: '20px' }}
                  extra={
                    selectedGroup && (
                      <Button type="link" onClick={() => handleGroupSelect(null, null)}>
                        {t('deselectGroup')}
                      </Button>
                    )
                  }
                >
                  {groups?.data ? (
                    <Menu
                      mode="vertical"
                      selectedKeys={selectedGroup?.title ? [selectedGroup.title] : []}
                      onClick={({ key }) => {
                        const group = groups.data.find((g) => g.title === key);
                        if (group) {
                          handleGroupSelect(group.id, group.title);
                        }
                      }}
                    >
                      {groups.data.map((group) => (
                        <Menu.Item key={group.title}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div>
                              {group.link_image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={group.link_image}
                                  alt={group.description}
                                  style={{ width: '40px', height: '40px', marginRight: '30px', objectFit: 'cover' }}
                                />
                              )}
                            </div>
                            <span style={{ marginTop: -13 }}>{group.title}</span>
                          </div>
                        </Menu.Item>
                      ))}
                    </Menu>
                  ) : (
                    <Empty description={t('noGroupsAvailable')} />
                  )}
                  <Pagination
                    current={groupsPagination.current}
                    pageSize={groupsPagination.pageSize}
                    pageSizeOptions={['10', '20', '50', '100']}
                    total={groupsPagination.total}
                    onChange={handleGroupsPaginationChange}
                    showSizeChanger
                    showQuickJumper
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  title={isSearchActive ? searchTerm : selectedGroup?.title || t('modelsGroup')}
                  style={{ height: '100%' }}
                >
                  {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <Spin size="large" />
                    </div>
                  ) : deviceModels?.data ? (
                    <List
                      dataSource={deviceModels.data}
                      renderItem={(model) => (
                        <List.Item
                          onClick={() => handleModelSelect(model)}
                          style={{
                            cursor: 'pointer',
                          }}
                        >
                          <Card
                            hoverable
                            style={{
                              width: '100%',
                              backgroundColor: selectedModel?.id === model.id ? '#e6f7ff' : undefined,
                              color: selectedModel?.id === model.id ? '#1890ff' : undefined,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
                              {getCoverModelImage(model) && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  key={getCoverModelImage(model)}
                                  src={getCoverModelImage(model)}
                                  alt={model.description}
                                  style={{ width: '20%', height: '20%' }}
                                />
                              )}
                              <span>{model.description}</span>
                            </div>
                          </Card>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      image={<UnorderedListOutlined style={{ fontSize: 60, color: '#1890ff' }} />}
                      description={isSearchActive ? t('noModelsAvailable') : t('selectGroupModel')}
                    />
                  )}
                  {deviceModels?.data && (
                    <Pagination
                      current={modelsPagination.current}
                      pageSize={modelsPagination.pageSize}
                      pageSizeOptions={['10', '20', '50', '100']}
                      total={modelsPagination.total}
                      onChange={handleModelsPaginationChange}
                      showSizeChanger
                      showQuickJumper
                    />
                  )}
                </Card>
              </Col>
              <Col span={8}>
                {selectedModel && (
                  <Card title={selectedModel.description}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: '20px',
                      }}
                    >
                      <div style={{ width: '50%', height: '150px', backgroundColor: '#f0f0f0' }}>
                        {getPinoutModelImage(selectedModel) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={getPinoutModelImage(selectedModel)}
                            src={getPinoutModelImage(selectedModel)}
                            alt={selectedModel.description}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                      <Button type="primary" style={{ marginRight: '8px' }}>
                        {t('order')}
                      </Button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                      <section style={{ width: '50%' }}>
                        <p>
                          {t('serialNumber')} {selectedModel.serial}
                        </p>
                        <p>
                          {t('ModelGroupID')} {selectedModel.device_group_id}
                        </p>
                        {selectedModel.device_group && <p>{selectedModel.device_group.title}</p>}
                      </section>
                      <Divider type="vertical" style={{ height: 'auto' }} />

                      <section style={{ marginLeft: 10 }}>
                        <Title level={5}>{t('documents')}</Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {getDatasheetModelDocuments(selectedModel) && (
                            <Text key={`datasheet-${selectedModel.id}`}>
                              <a
                                href={getDatasheetModelDocuments(selectedModel)}
                                title={getDatasheetModelDocuments(selectedModel)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Datasheet
                              </a>
                            </Text>
                          )}
                          {getHardwareDesignGuideLinesModelDocuments(selectedModel) && (
                            <Text key={`hardware-${selectedModel.id}`}>
                              <a
                                href={getHardwareDesignGuideLinesModelDocuments(selectedModel)}
                                title={getHardwareDesignGuideLinesModelDocuments(selectedModel)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Hardware Design Guide Lines
                              </a>
                            </Text>
                          )}
                          {getProgrammingGuideModelDocuments(selectedModel) && (
                            <Text key={`programming-${selectedModel.id}`}>
                              <a
                                href={getProgrammingGuideModelDocuments(selectedModel)}
                                title={getProgrammingGuideModelDocuments(selectedModel)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Programming Guide
                              </a>
                            </Text>
                          )}
                        </div>
                      </section>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'right',
                        marginTop: '20px',
                      }}
                    >
                      <Button type="primary" onClick={handleLoadFW}>
                        {t('loadFW')}
                      </Button>
                    </div>
                  </Card>
                )}
              </Col>
            </Row>
          </Content>
        </Layout>
      </div>
      <div className={styles.mobileMessage}>{t('mobileMessage')}</div>
    </>
  );
}
