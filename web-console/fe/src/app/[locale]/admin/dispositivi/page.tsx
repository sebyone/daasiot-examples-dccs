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
import { useWindowSize } from '@/hooks/useWindowSize';
import { default as ConfigService, default as configService } from '@/services/configService';
import { DataDevice, DDO, DeviceFunction, Event, Function } from '@/types';
import {
  DeploymentUnitOutlined,
  DownloadOutlined,
  DownOutlined,
  EditFilled,
  EnvironmentOutlined,
  FileOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import {
  Button,
  Descriptions,
  Dropdown,
  Empty,
  Form,
  Input,
  Layout,
  List,
  Menu,
  message,
  Modal,
  Pagination,
  Space,
  Switch,
  Table,
  Tabs,
  TabsProps,
} from 'antd';
import dayjs from 'dayjs';
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

const ParametersTab = dynamic(() => import('@/components/ParametersTab'), { ssr: false });

export default function Dispositivi() {
  const router = useRouter();
  const t = useTranslations('Dispositivi');
  const [formGenerali] = Form.useForm();
  const [formHeader] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState('');
  const [devicesData, setDevicesData] = useState<DataDevice[]>([]);
  const { notify, contextHolder } = useCustomNotification();
  const [selectedDevice, setSelectedDevice] = useState<DataDevice | null>(null);
  const [isDeviceSelected, setIsDeviceSelected] = useState(false);
  const [isModalInfoEventVisible, setIsModalInfoEventVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState<DDO>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const locale = useLocale();
  const [activeTabKey, setActiveTabKey] = useState('1');
  const [ddos, setDdos] = useState<DDO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterEnabled, setFilterEnabled] = useState(false);
  const [functions, setFunctions] = useState<Function[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<DeviceFunction[]>([]);
  const [checkedFunctions, setCheckedFunctions] = useState<number[]>([]);
  const [status, setStatus] = useState<boolean>(false);
  const [value, setValue] = useState<number>(0);
  const [showTestComponent, setShowTestComponent] = useState(false);
  const [selectedDin, setSelectedDin] = useState<number | null>(null);
  const [dinOptions, setDinOptions] = useState<number[]>([]);
  const [ws, setSocket] = useState<WebSocket | null>(null);
  const [alignment, setAlignment] = useState<string>('Sconosciuto');
  const [linkStatus, setLinkStatus] = useState<boolean>(true);
  const { width } = useWindowSize();
  const wh = width <= 1920;

  const MapComponent = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => <p style={{ marginTop: 30 }}>{t('loading')}</p>,
  });

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleViewClick = (record: DDO) => {
    setSelectedRow(record);
    setIsModalInfoEventVisible(true);
  };

  const handleModalClose = () => {
    setIsModalInfoEventVisible(false);
    setSelectedRow(undefined);
  };

  const columnsEvents = [
    {
      title: <span style={{ display: 'flex', justifyContent: 'center' }}>Timestamp</span>,
      width: wh ? '12%' : '10%',
      dataIndex: 'timestamp',
      key: 'timestamp',
    },
    {
      title: <span style={{ display: 'flex', justifyContent: 'center' }}>Typeset</span>,
      width: wh ? '10%' : '5%',
      dataIndex: 'typeset_id',
      key: 'typeset_id',
    },
    {
      title: <span style={{ display: 'flex', justifyContent: 'center' }}>Payload Size [Byte]</span>,
      width: wh ? '14%' : '9%',
      dataIndex: 'payload_size',
      key: 'payload_size',
    },
    {
      title: <span style={{ display: 'flex', justifyContent: 'center' }}>Payload</span>,
      width: wh ? '35%' : '40%',
      dataIndex: 'payload',
      key: 'payload',
      render: (text: string) => {
        const base64Content = convertToBase64(text);
        return <span>{base64Content}</span>;
      },
    },
    {
      title: '',
      key: 'action',
      render: (record: DDO) => <SearchOutlined style={{ cursor: 'pointer' }} onClick={() => handleViewClick(record)} />,
    },
  ];

  const fetchDdo = async () => {
    if (!selectedDevice) return;
    try {
      const offset = (currentPage - 1) * pageSize;
      const response = await ConfigService.getDDOByDeviceId(selectedDevice.id, offset, pageSize, filterEnabled);
      const ddos = response.data.map((ddo) => ({
        timestamp: dayjs(ddo.timestamp).format('DD/MM/YYYY HH:mm:ss'),
        typeset_id: ddo.typeset_id,
        payload: ddo.payload,
        payload_size: ddo.payload_size,
      }));
      setDdos(ddos);
      setTotalItems(response.pagination.total);
    } catch (error) {
      notify('error', t('error'), 'Errore ddo');
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFilterEnabled(checked);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchDdo();
  }, [filterEnabled, currentPage, pageSize, selectedDevice]);

  const handleDeviceClick = useCallback(
    async (device: DataDevice) => {
      setSelectedDevice(device);
      setIsDeviceSelected(true);
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
          modello: data.device_model.name,
          serial: data.serial,
        });
      } catch (error) {
        console.error('Error fetching device details:', error);
      }
    },
    [formGenerali, formHeader]
  );

  useEffect(() => {
    if (selectedDevice) {
      handleDeviceClick(selectedDevice);
    }
  }, [selectedDevice, handleDeviceClick]);

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

  useEffect(() => {
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_API_BASE_URL}`);

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

  const fetchFunctions = useCallback(async () => {
    if (!selectedDevice?.id) return;
    try {
      const response = await ConfigService.getFunctions(selectedDevice.device_model_id);
      setFunctions(response);
    } catch (error) {
      console.error('Error fetching functions:', error);
    }
  }, [selectedDevice?.id, selectedDevice?.device_model_id]);

  useEffect(() => {
    fetchFunctions();
  }, [fetchFunctions]);

  const fetchProgram = useCallback(async () => {
    if (!selectedDevice?.id) return;
    try {
      const response = await ConfigService.getProgram(selectedDevice.id);
      setSelectedFunctions(response);
      setCheckedFunctions(response.filter((func) => func.enabled).map((func) => func.id));
    } catch (error) {
      console.error('Error fetching program:', error);
    }
  }, [selectedDevice?.id]);

  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);

  const handleAddFunction = useCallback(
    async (functionToAdd: Function) => {
      if (!selectedDevice?.id) return;
      try {
        const response = await ConfigService.addFunction(selectedDevice.id, functionToAdd.id);
        setSelectedFunctions((prev) => [...prev, response]);
        setAlignment('Disallineato');
        message.success('Funzione aggiunta con successo');
      } catch (error) {
        message.error("Errore nell'aggiunta della funzione");
      }
      fetchProgram();
    },
    [selectedDevice?.id, fetchProgram]
  );

  const handleDeleteFunctions = useCallback(async () => {
    if (!selectedDevice?.id || checkedFunctions.length === 0) return;

    const loadingMessage = message.loading('Eliminazione in corso...', 0);
    const results: { success: boolean; functionId: number; error?: any }[] = [];

    try {
      for (const functionId of checkedFunctions) {
        try {
          if (results.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          await ConfigService.deleteFunction(selectedDevice.id, functionId);
          results.push({ success: true, functionId });
          setAlignment('Disallineato');
        } catch (error: any) {
          if (error?.error_name === 'SequelizeTimeoutError' && error?.message?.includes('database is locked')) {
            try {
              await new Promise((resolve) => setTimeout(resolve, 1500));
              await ConfigService.deleteFunction(selectedDevice.id, functionId);
              results.push({ success: true, functionId });
            } catch (retryError) {
              results.push({ success: false, functionId, error: retryError });
            }
          } else {
            results.push({ success: false, functionId, error });
          }
        }
      }

      const successfulDeletes = results.filter((result) => result.success).map((result) => result.functionId);
      const failedDeletes = results.filter((result) => !result.success).map((result) => result.functionId);

      if (successfulDeletes.length > 0) {
        setSelectedFunctions((prev) => prev.filter((f) => !successfulDeletes.includes(f.id)));
        setCheckedFunctions((prev) => prev.filter((id) => !successfulDeletes.includes(id)));
        message.success(
          successfulDeletes.length === 1
            ? 'Funzione eliminata con successo'
            : `${successfulDeletes.length} funzioni eliminate con successo`
        );
      }

      if (failedDeletes.length > 0) {
        message.error(
          failedDeletes.length === 1
            ? "Errore nell'eliminazione della funzione"
            : `Errore nell'eliminazione di ${failedDeletes.length} funzioni`
        );
      }
    } catch (error) {
      message.error("Si è verificato un errore durante l'eliminazione delle funzioni");
    } finally {
      loadingMessage();
    }
  }, [selectedDevice?.id, checkedFunctions]);

  const handleUpdateFunction = useCallback(
    async (
      functionId: number,
      updates: {
        parameters?: { property_id: number; value: any }[];
        inputs?: { property_id: number; value: any }[];
        outputs?: { property_id: number; value: any }[];
        notifications?: { property_id: number; value: any }[];
      }
    ) => {
      if (!selectedDevice?.id) return;

      try {
        const functionToUpdate = selectedFunctions.find((f) => f.id === functionId);
        if (!functionToUpdate) return;

        const updatedFunction = { ...functionToUpdate };

        let hasUpdates = false;

        if (updates.parameters) {
          hasUpdates = true;
          updatedFunction.parameters = updatedFunction.parameters.map((param) => {
            const update = updates.parameters?.find((u) => u.property_id === param.property_id);
            return update ? { ...param, value: update.value } : param;
          });
        }

        if (updates.inputs) {
          hasUpdates = true;
          updatedFunction.inputs = updatedFunction.inputs.map((input) => {
            const update = updates.inputs?.find((u) => u.property_id === input.property_id);
            return update ? { ...input, value: update.value } : input;
          });
        }

        if (updates.outputs) {
          hasUpdates = true;
          updatedFunction.outputs = updatedFunction.outputs.map((output) => {
            const update = updates.outputs?.find((u) => u.property_id === output.property_id);
            return update ? { ...output, value: update.value } : output;
          });
        }

        if (updates.notifications) {
          hasUpdates = true;
          updatedFunction.notifications = updatedFunction.notifications.map((notification) => {
            const update = updates.notifications?.find((u) => u.property_id === notification.property_id);
            return update ? { ...notification, value: update.value } : notification;
          });
        }

        if (!hasUpdates) return;

        await ConfigService.updateFunction(selectedDevice.id, functionId, updatedFunction);
        setSelectedFunctions((prev) => prev.map((func) => (func.id === functionId ? updatedFunction : func)));
        setAlignment('Disallineato');
        message.success('Funzione aggiornata con successo');
      } catch (error) {
        console.error('Error updating function:', error);
        message.error("Errore nell'aggiornamento della funzione");
      }
    },
    [selectedDevice?.id, selectedFunctions]
  );

  const handleStatusChange = useCallback((newStatus: boolean) => {
    setStatus(newStatus);
  }, []);

  const handleValueChange = useCallback((newValue: number) => {
    setValue(newValue);
  }, []);

  const handleFunctionSelect = useCallback((functionId: number) => {
    setCheckedFunctions((prev) =>
      prev.includes(functionId) ? prev.filter((id) => id !== functionId) : [...prev, functionId]
    );
  }, []);

  const handleTestClick = useCallback(() => {
    setShowTestComponent((prev) => !prev);
  }, []);

  const handleDinSelect = useCallback((din: number | null) => {
    setSelectedDin(din);
  }, []);

  const handleSendCommand = useCallback(async () => {
    if (selectedDevice) {
      try {
        const dev = await ConfigService.getDeviceById(selectedDevice.id);
        const response = await ConfigService.sendPayload(Number(dev.din.din), status, value);
        console.log(response);
      } catch (error) {
        console.error('Errore:', error);
      }
    }
  }, [selectedDevice, status, value]);

  const [isReportLoading, setIsReportLoading] = useState<boolean>(false);

  const handleReportClick = async (extension: 'pdf' | 'xlsx') => {
    if (!selectedDevice) {
      return;
    }

    try {
      setIsLoading(true);
      const blob = await ConfigService.getDeviceReport(selectedDevice.id, extension);

      // Determina il tipo MIME e l'estensione del file
      const mimeType =
        extension === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileExtension = extension;

      // Crea URL per il download
      const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));

      // Crea un elemento anchor temporaneo
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ddo-report-${selectedDevice.id}.${fileExtension}`);

      // Aggiungi al DOM, clicca e rimuovi
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Pulisci l'URL creato
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notify('error', t('error'), t('errorGeneratingReport'));
    } finally {
      setIsLoading(false);
    }
  };

  const convertToBase64 = (content: string) => {
    try {
      return atob(content);
    } catch (error) {
      return content;
    }
  };

  const reportMenu = {
    items: [
      { key: 'pdf', label: 'PDF' },
      { key: 'xlsx', label: 'Excel' },
    ],
    onClick: ({ key }: { key: string }) => handleReportClick(key as 'pdf' | 'xlsx'),
  };

  const switchContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    width: 'fit-content',
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
      children: (
        <ParametersTab
          key={selectedDevice?.id}
          device={selectedDevice}
          functions={functions}
          selectedFunctions={selectedFunctions}
          checkedFunctions={checkedFunctions}
          status={status}
          value={value}
          showTestComponent={showTestComponent}
          selectedDin={selectedDin}
          dinOptions={dinOptions}
          onStatusChange={handleStatusChange}
          onValueChange={handleValueChange}
          onSendCommand={handleSendCommand}
          onFunctionSelect={handleFunctionSelect}
          onTestClick={handleTestClick}
          onDinSelect={handleDinSelect}
          onAddFunction={handleAddFunction}
          onDeleteFunctions={handleDeleteFunctions}
          onUpdateFunction={handleUpdateFunction}
          onAlignmentChange={setAlignment}
        />
      ),
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
          <div style={switchContainerStyle}>
            <Switch
              checked={filterEnabled}
              onChange={handleSwitchChange}
              unCheckedChildren={<DownloadOutlined />}
              checkedChildren={<SendOutlined />}
              style={{ backgroundColor: filterEnabled ? '#1890ff' : '#52c41a' }}
            />
            <span
              style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#262626',
              }}
            >
              {filterEnabled ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <SendOutlined /> Messaggi inviati
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DownloadOutlined /> Messaggi ricevuti
                </span>
              )}
            </span>
          </div>
          <Table
            columns={columnsEvents}
            dataSource={ddos}
            scroll={{ y: wh ? 120 : 700 }}
            size="small"
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
              responsive: true,
              style: { marginBottom: 16 },
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '8px' }}>
            <Button type="primary">{t('clearLog')}</Button>
            <Dropdown menu={reportMenu} disabled={isReportLoading || !selectedDevice}>
              <Button type="primary" loading={isReportLoading}>
                <Space>
                  <FileOutlined />
                  Report
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
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
                    {selectedRow.typeset_id}
                  </Descriptions.Item>
                  <Descriptions.Item label={'Payload Size [Byte]'} labelStyle={{ fontWeight: 'bold' }}>
                    {selectedRow.payload_size}
                  </Descriptions.Item>
                </Descriptions>
                <p style={{ marginTop: 10, fontSize: '1rem' }}>
                  <strong>Payload Content</strong>
                  <PayloadContentViewer key={selectedRow.id} payloadContent={selectedRow.payload} />
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
          {selectedDevice && <MapComponent key={selectedDevice?.id} device={selectedDevice} form={formGenerali} />}
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
        <Layout style={{ minHeight: '92vh' }}>
          <Sider
            breakpoint="lg"
            collapsedWidth="0"
            width={250}
            theme="dark"
            className={styles.siderCustom}
            style={{
              marginLeft: '-22px',
              marginTop: 2,
              maxHeight: '101%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '4px',
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
          </Sider>
          <Layout>
            <Content style={{ padding: 0, background: '#fff', maxHeight: '100%' }}>
              {isDeviceSelected ? (
                <DataPanel
                  title={selectedDevice?.name}
                  showSemaphore={false}
                  showLinkStatus
                  showAlignmentStatus
                  alignment={alignment}
                  linkStatus={linkStatus}
                >
                  <Panel showSaveButtons={false} layoutStyle="devices">
                    <PanelView layoutStyle="devices">
                      <NodoFormHeader form={formHeader} />
                      <Tabs
                        type="card"
                        items={items}
                        style={{ padding: 10 }}
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
    </>
  );
}
