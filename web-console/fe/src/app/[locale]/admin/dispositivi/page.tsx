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
import { default as ConfigService, default as configService } from '@/services/configService';
import { DataDevice, DDOView } from '@/types';
import {
  DeploymentUnitOutlined,
  EditFilled,
  EnvironmentOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Empty,
  Form,
  Input,
  Layout,
  List,
  Modal,
  Pagination,
  Space,
  Table,
  Tabs,
  TabsProps,
} from 'antd';
import debounce from 'debounce';
import 'leaflet/dist/leaflet.css';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import styles from './Dispositivi.module.css';

const { Sider, Content } = Layout;

const DataPanel = dynamic(() => import('@/components/DataPanel'), { ssr: false });
const NodoFormGenerali = dynamic(() => import('@/components/NodoFormGenerali'), { ssr: false });
const NodoFormHeader = dynamic(() => import('@/components/NodoFormHeader'), { ssr: false });
const Panel = dynamic(() => import('@/components/Panel'), { ssr: false });
const PanelView = dynamic(() => import('@/components/PanelView'), { ssr: false });
const PayloadContentViewer = dynamic(() => import('@/components/PayloadContentView'), { ssr: false });
const CardDispositivoFactory = dynamic(() => import('@/components/CardDispositivoFactory'), { ssr: false });
const ParametersTab = dynamic(() => import('@/components/ParametersTab'), { ssr: false });

export default function Dispositivi() {
  const router = useRouter();
  const t = useTranslations('Dispositivi');
  const [title, setTitle] = useState('');
  const [formGenerali] = Form.useForm();
  const [formHeader] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [devicesData, setDevicesData] = useState<DataDevice[]>([]);
  const { notify, contextHolder } = useCustomNotification();
  const [selectedDevice, setSelectedDevice] = useState<DataDevice | null>(null);
  const [showTestComponent, setShowTestComponent] = useState(false);
  const [status, setStatus] = useState<boolean>(false);
  const [value, setValue] = useState<number>(0);
  const [ws, setSocket] = useState<WebSocket | null>(null);
  const [dinOptions, setDinOptions] = useState<number[]>([]);
  const [selectedDin, setSelectedDin] = useState<number | null>(null);
  const [showTestControl, setShowTestControl] = useState<boolean>(false);
  const [isDeviceSelected, setIsDeviceSelected] = useState(false);
  const [isModalInfoEventVisible, setIsModalInfoEventVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DDOView | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const locale = useLocale();
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [ddos, setDdos] = useState<DDOView[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const MapComponent = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <p style={{ marginTop: 30 }}>{t('loading')}</p>,
  });

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleViewClick = (record: DDOView) => {
    setSelectedRow(record);
    setIsModalInfoEventVisible(true);
  };

  const handleModalClose = () => {
    setIsModalInfoEventVisible(false);
    setSelectedRow(null);
  };

  const columnsEvents = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: 'Typeset',
      dataIndex: 'typeset',
      key: 'typeset',
    },
    {
      title: 'Payload Size [Byte]',
      dataIndex: 'payloadSize',
      key: 'payloadSize',
    },
    {
      title: '',
      key: 'action',
      render: (_text: unknown, record: DDOView) => (
        <SearchOutlined style={{ cursor: 'pointer' }} onClick={() => handleViewClick(record)} />
      ),
    },
  ];

  /*useEffect(() => {
    if (selectedDevice) {
      const fetchDdo = async () => {
        try {
          const offset = (currentPage - 1) * pageSize;
          console.log(selectedDevice.id);
          const response = await ConfigService.getDDOByDeviceId(selectedDevice.id, offset, pageSize, false);
          const ddos = response.data.map((ddo) => ({
            timestamp: ddo.timestamp,
            typeset: ddo.typeset_id,
            payload: ddo.payload,
            payloadSize: ddo.payload_size,
          }));
          setDdos(ddos);
          setTotalItems(response.pagination.total);
        } catch (error) {
          notify('error', t('error'), 'Errore ddo');
        }
      };
      fetchDdo();
    }
  }, [selectedDevice, currentPage, pageSize]);*/

  const fetchDdo = async () => {
    if (!selectedDevice) return;
    setIsLoading(true);
    try {
      const offset = (currentPage - 1) * pageSize;
      const response = await ConfigService.getDDOByDeviceId(selectedDevice.id, offset, pageSize, false);
      const ddos = response.data.map((ddo) => ({
        timestamp: ddo.timestamp,
        typeset: ddo.typeset_id,
        payload: ddo.payload,
        payloadSize: ddo.payload_size,
      }));
      setDdos(ddos);
      setTotalItems(response.pagination.total);
    } catch (error) {
      notify('error', t('error'), 'Errore ddo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceClick = useCallback(
    async (device: DataDevice) => {
      setSelectedDevice(device);
      setIsDeviceSelected(true);
      setIsLoading(true);
      setActiveTabKey('1');
      try {
        const data = await ConfigService.getDeviceById(device.id);

        formGenerali.setFieldsValue({
          id: data.id,
          sid: data.din.sid,
          din: data.din.din,
          latitudine: data.latitude,
          longitudine: data.longitude,
        });

        formHeader.setFieldsValue({
          id: data.id,
          modello: data.device_model.description,
          matricola: data.device_model.serial,
        });
      } catch (error) {
        console.error('Error fetching device details:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [formGenerali, formHeader]
  );

  useEffect(() => {
    if (selectedDevice) {
      handleDeviceClick(selectedDevice);
    }
  }, [selectedDevice, handleDeviceClick]);

  /*const handleDeviceClick = (device: DataDevice) => {
    setSelectedDevice(device);
    setIsDeviceSelected(true);
    setActiveTabKey('1');
    configService.getDeviceById(device.id).then((data) => {
      formGenerali.setFieldsValue({
        id: data.id,
        sid: data.din.sid,
        din: data.din.din,
        latitudine: data.latitude,
        longitudine: data.longitude,
      });
      formHeader.setFieldsValue({
        id: data.id,
        modello: data.device_model.description,
        matricola: data.device_model.serial,
      });
    });
  };*/

  const fetchDevices = useCallback(async () => {
    setIsLoading(true);
    try {
      const offset = 0;
      const response = await ConfigService.getDevices(offset, pageSize, searchTerm);
      setDevicesData(response.data);
      setTotalItems(response.pagination.total);
    } catch (error) {
      notify('error', t('error'), t('errorGetDevices'));
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  const handleTest = () => {
    setShowTestComponent((prevState) => !prevState);
  };

  useEffect(() => {
    const socket = new WebSocket(
      process.env.NEXT_PUBLIC_WS_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'ws://localhost:3000'
    );

    socket.onmessage = (event) => {
      console.log('Ricevuto messaggio', event.data);
      const data = JSON.parse(event.data);

      if (data.event === 'ddo') {
        setStatus(data.status);
        setValue(data.value);
      }
    };

    socket.onopen = () => {
      console.log('Connesso al server');
    };

    socket.onclose = () => {
      console.log('Disconnesso dal server');
    };

    setSocket(socket);

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  const onChangeComplete = (value: number) => {
    setValue(value);
  };

  const onChange = (status: boolean) => {
    setStatus(status);
  };

  const onSend = async () => {
    if (selectedDevice) {
      try {
        const device = await configService.getDeviceById(selectedDevice.id);
        const response = await configService.sendPayload(Number(device.din.din), status, value);
        console.log(response);
      } catch (error) {
        console.error('Errore:', error);
      }
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {<InfoCircleOutlined style={{ fontSize: '1.1rem' }} />} {t('general')}
        </span>
      ),
      children: (
        <div>
          <NodoFormGenerali form={formGenerali} />
          <Button type="primary" onClick={handleTest} style={{ marginLeft: 20, marginBottom: 20 }}>
            Test
          </Button>
          {showTestComponent && (
            <div style={{ marginTop: -53, marginLeft: 90 }}>
              <CardDispositivoFactory
                deviceType="UPL"
                deviceName="UPL Modello XX"
                dinOptions={dinOptions}
                selectedDin={selectedDin}
                setSelectedDin={setSelectedDin}
                onTest={handleTest}
                onSend={onSend}
                status={status}
                setStatus={onChange}
                value={value}
                setValue={onChangeComplete}
                showTestControl={showTestControl}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {<SettingOutlined style={{ fontSize: '1.1rem' }} />} {t('config')}
        </span>
      ),
      children: <ParametersTab key={selectedDevice?.id} device={selectedDevice} />,
    },
    {
      key: '3',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {<UnorderedListOutlined style={{ fontSize: '1.1rem' }} />} {t('events')}
        </span>
      ),
      children: (
        <>
          <Table
            columns={columnsEvents}
            dataSource={ddos}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (page, pageSize) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              },
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <Button type="primary">{t('clearLog')}</Button>
          </div>
          <Modal
            title={<span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{t('details')}</span>}
            open={isModalInfoEventVisible}
            onCancel={handleModalClose}
            footer={null}
          >
            {selectedRow ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Descriptions key={selectedRow.id} column={1} bordered>
                  <Descriptions.Item label={'Timestamp'} labelStyle={{ fontWeight: 'bold' }}>
                    {selectedRow.timestamp}
                  </Descriptions.Item>
                  <Descriptions.Item label={'Typeset'} labelStyle={{ fontWeight: 'bold' }}>
                    {selectedRow.typeset}
                  </Descriptions.Item>
                  <Descriptions.Item label={'Payload Size [Byte]'} labelStyle={{ fontWeight: 'bold' }}>
                    {selectedRow.payloadSize}
                  </Descriptions.Item>
                </Descriptions>
                <p style={{ marginTop: 10, fontSize: '1rem' }}>
                  <strong>Payload Content</strong>
                  <PayloadContentViewer payloadContent={selectedRow.payload} />
                </p>
              </Space>
            ) : null}
          </Modal>
        </>
      ),
    },
    {
      key: '4',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {<EnvironmentOutlined style={{ fontSize: '1.1rem' }} />} {t('geolocation')}
        </span>
      ),
      children: (
        <div style={{ height: '55vh', marginTop: -40 }}>
          {selectedDevice ? <MapComponent device={selectedDevice} /> : null}
        </div>
      ),
    },
  ];

  const handleAddDevice = () => {
    router.push(`/${locale}/admin/dispositivi/newDispositivo`);
  };

  const handleEditDispositivo = (e: React.MouseEvent, deviceId: number) => {
    e.stopPropagation();
    router.push(`/${locale}/admin/dispositivi/editDispositivo/${deviceId}`);
  };

  /*const itemRender = (_, type, originalElement) => {
    console.log(type, 'a');
    if (type === 'prev') {
      return <a style={{ color: 'white' }}>{'<'}</a>;
    }
    if (type === 'next') {
      return <a style={{ color: 'white', cursor: 'pointer' }}>{'>'}</a>;
    }
    return originalElement;
  };*/

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
    if (key === '3') {
      fetchDdo();
    }
  };

  return (
    <>
      {contextHolder}
      <div className={styles.container}>
        <Layout style={{ height: '100%' }}>
          <Sider
            width={250}
            theme="dark"
            style={{
              marginLeft: '-22px',
              marginTop: -2,
              maxHeight: '101%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '12px', borderBottom: '1px solid #303030' }}>
              <Button
                type="primary"
                onClick={handleAddDevice}
                style={{
                  width: '100%',
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <PlusCircleOutlined style={{ fontSize: '1.1rem' }} />
                  {t('addDevice')}
                </span>
              </Button>
              <br />
            </div>
            <div style={{ padding: '16px' }}>
              <Input
                placeholder={t('search')}
                onChange={(e) => debouncedSearch(e.target.value)}
                suffix={isLoading ? <LoadingOutlined /> : <SearchOutlined />}
                style={{ height: 25 }}
              />
            </div>
            <List
              loading={isLoading}
              dataSource={devicesData}
              renderItem={(item) => (
                <List.Item
                  style={{
                    borderRadius: 7,
                    borderBottom: selectedDevice === item ? '1px solid #303030' : 'none',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    backgroundColor: selectedDevice === item ? '#1677ff' : undefined,
                  }}
                  onClick={() => handleDeviceClick(item)}
                >
                  <div
                    style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
                  >
                    <span style={{ color: selectedDevice === item ? 'white' : '#ffffffa6' }}>{item.name}</span>
                    <EditFilled
                      style={{ color: '#8c8c8c', fontSize: 16, transition: 'color 0.3s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#1890ff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffffa6')}
                      onClick={(e) => handleEditDispositivo(e, item.id)}
                    />
                  </div>
                </List.Item>
              )}
              style={{ height: 'calc(100% - 120px)', overflowY: 'auto', padding: '8px 16px' }}
            />
            {/*<Pagination
              current={1}
              pageSize={pageSize}
              pageSizeOptions={['10', '20', '50', '100']}
              total={1}
              onChange={() => {}}
              showSizeChanger
              showQuickJumper
              itemRender={itemRender}
              className={`${styles['ant-pagination-prev']} ${styles['ant-pagination-next']}`}
              style={{ marginTop: -50 }}
            />*/}
          </Sider>
          <Layout>
            <Content style={{ padding: 0, background: '#fff', maxHeight: '100%' }}>
              {isDeviceSelected ? (
                <DataPanel title={selectedDevice?.name} showSemaphore={false} showLinkStatus showAlignmentStatus>
                  <Panel showSaveButtons={false} layoutStyle="devices">
                    <PanelView layoutStyle="devices">
                      <NodoFormHeader form={formHeader} />
                      <Tabs
                        type="card"
                        items={items}
                        style={{ padding: 10, marginTop: -30 }}
                        activeKey={activeTabKey}
                        onChange={handleTabChange}
                      />
                    </PanelView>
                  </Panel>
                </DataPanel>
              ) : (
                <Empty
                  image={<DeploymentUnitOutlined style={{ fontSize: 60, color: '#1890ff' }} />}
                  imageStyle={{
                    height: 60,
                  }}
                  description={<span style={{ color: '#595959', fontSize: '16px' }}>{t('selectDevice')}</span>}
                ></Empty>
              )}
            </Content>
          </Layout>
        </Layout>
      </div>
      <div className={styles.mobileMessage}>{t('mobileMessage')}</div>
    </>
  );
}
