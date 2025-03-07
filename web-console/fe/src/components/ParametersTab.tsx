/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: ParametersTab.tsx
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import ConfigService from '@/services/configService';
import { DataDevice, DeviceFunction, Function, FunctionParameter } from '@/types';
import {
  BellOutlined,
  BulbOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  ControlOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  ExportOutlined,
  ImportOutlined,
  SettingOutlined,
  SlidersOutlined,
} from '@ant-design/icons';
import { Button, Checkbox, Col, Descriptions, Input, List, message, Modal, Row, Select, Space, Table } from 'antd';
import { on } from 'events';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import React, { useCallback, useState } from 'react';
import styles from './ParametersTab.module.css';

const CardDispositivoFactory = dynamic(() => import('@/components/CardDispositivoFactory'), { ssr: false });

interface ParametersTabProps {
  device: DataDevice | null;
  functions: Function[];
  selectedFunctions: DeviceFunction[];
  checkedFunctions: number[];
  status: boolean;
  value: number;
  showTestComponent: boolean;
  selectedDin: number | null;
  dinOptions: number[];
  onStatusChange: (status: boolean) => void;
  onValueChange: (value: number) => void;
  onSendCommand: () => Promise<void>;
  onFunctionSelect: (functionId: number) => void;
  onTestClick: () => void;
  onDinSelect: (din: number | null) => void;
  onAddFunction: (functionToAdd: Function) => Promise<void>;
  onDeleteFunctions: () => Promise<void>;
  onUpdateFunction: (
    functionId: number,
    updates: {
      parameters?: { property_id: number; value: any }[];
      inputs?: { property_id: number; value: any }[];
      outputs?: { property_id: number; value: any }[];
      notifications?: { property_id: number; value: any }[];
    }
  ) => Promise<void>;
  onAlignmentChange: (status: string) => void; // Callback per cambiare lo stato
}

export default function ParametersTab({
  device,
  functions,
  selectedFunctions,
  checkedFunctions,
  status,
  value,
  showTestComponent,
  selectedDin,
  dinOptions,
  onStatusChange,
  onValueChange,
  onSendCommand,
  onFunctionSelect,
  onTestClick,
  onDinSelect,
  onAddFunction,
  onDeleteFunctions,
  onUpdateFunction,
  onAlignmentChange,
}: ParametersTabProps) {
  const t = useTranslations('ParametersTab');

  // Stati UI locali
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [currentFunction, setCurrentFunction] = useState<DeviceFunction | null>(null);
  const [tempParameters, setTempParameters] = useState<{ [key: number]: any }>({});
  const [tempInputs, setTempInputs] = useState<{ [key: number]: any }>({});
  const [tempOutputs, setTempOutputs] = useState<{ [key: number]: any }>({});
  const [tempNotifications, setTempNotifications] = useState<{ [key: number]: any }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTestControl] = useState(false);
  const [isProgrammingLoading, setIsProgrammingLoading] = useState<boolean>(false);
  const [isImportingLoading, setIsImportingLoading] = useState<boolean>(false);

  // Handlers UI locali
  const handleDeleteClick = useCallback(() => {
    if (checkedFunctions.length === 0) return;
    setIsDeleteConfirmVisible(true);
  }, [checkedFunctions.length]);

  const handleConfirmDelete = useCallback(() => {
    setIsDeleteConfirmVisible(false);
    onDeleteFunctions();
  }, [onDeleteFunctions]);

  const handleIconClick = useCallback((func: DeviceFunction, actionType: string) => {
    setCurrentFunction(func);
    setCurrentAction(actionType);
    setIsModalVisible(true);
  }, []);

  const handleParameterChange = useCallback((paramId: number, value: any) => {
    setTempParameters((prev) => ({ ...prev, [paramId]: value }));
  }, []);

  const handleInputChange = useCallback((inputId: number, field: 'options1' | 'options2', value: string) => {
    if (field === 'options2') {
      setTempInputs((prev) => ({
        ...prev,
        [inputId]: value,
      }));
    }
  }, []);

  const handleOutputChange = useCallback((outputId: number, field: 'options1' | 'options2', value: string) => {
    if (field === 'options2') {
      setTempOutputs((prev) => ({
        ...prev,
        [outputId]: value,
      }));
    }
  }, []);

  const handleNotificationChange = useCallback(
    (notificationId: number, field: 'options1' | 'options2', value: string) => {
      if (field === 'options2') {
        setTempNotifications((prev) => ({
          ...prev,
          [notificationId]: value,
        }));
      }
    },
    []
  );

  // funzione per programmare la funzione selezionata
  const handleProgram = useCallback(async () => {
    if (!device?.id) return;
    setIsProgrammingLoading(true);
    try {
      const functionToApply = selectedFunctions.find((f) => f.id === checkedFunctions[0]);

      if (!functionToApply) {
        throw new Error('Seleziona una funzione');
      }

      const functionData = {
        id: functionToApply.id,
        parameters: functionToApply.parameters,
        inputs: functionToApply.inputs,
        outputs: functionToApply.outputs,
        notifications: functionToApply.notifications,
      };

      await ConfigService.programFunction(device.id, functionData);
      onAlignmentChange('Allineato');
      message.success('Funzione inviata con successo');
    } catch (error: any) {
      message.error(error.message || "Errore durante l'invio della funzione");
      console.error('Send function error:', error);
    } finally {
      setIsProgrammingLoading(false);
    }
  }, [device?.id, selectedFunctions, checkedFunctions, onAlignmentChange]);

  // funzione per importare la programmazione
  const handleImportProgram = useCallback(async () => {
    if (!device?.id) return;
    setIsImportingLoading(true);
    try {
      //await ConfigService.importProgram(device.id);
      // simulazione importazione della programmazione
      const mockData = [...selectedFunctions];
      await new Promise((resolve) => setTimeout(resolve, 500));
      onAlignmentChange('Allineato');
      message.success('Programmazione importata con successo');
    } catch (error: any) {
      message.error(error.message || "Errore durante l'importazione della programmazione");
      console.error('Import program error:', error);
    } finally {
      setIsImportingLoading(false);
    }
  }, [device?.id, onAlignmentChange, selectedFunctions]);

  const handleModalOk = useCallback(async () => {
    if (!currentFunction) return;

    const updates: {
      parameters?: { property_id: number; value: any }[];
      inputs?: { property_id: number; value: any }[];
      outputs?: { property_id: number; value: any }[];
      notifications?: { property_id: number; value: any }[];
    } = {};

    let hasChanges = false;

    if (currentAction === 'parametro') {
      const changedParameters = Object.entries(tempParameters).filter(([id, value]) => {
        const originalParam = currentFunction.parameters.find((p) => p.property_id === Number(id));
        return originalParam?.value !== value;
      });

      if (changedParameters.length > 0) {
        hasChanges = true;
        updates.parameters = changedParameters.map(([id, value]) => ({
          property_id: Number(id),
          value,
        }));
      }
    } else if (currentAction === 'ingresso') {
      const changedInputs = Object.entries(tempInputs).filter(([id, value]) => {
        const originalInput = currentFunction.inputs.find((i) => i.property_id === Number(id));
        return originalInput?.value !== value;
      });

      if (changedInputs.length > 0) {
        hasChanges = true;
        updates.inputs = changedInputs.map(([id, value]) => ({
          property_id: Number(id),
          value,
        }));
      }
    } else if (currentAction === 'uscita') {
      const changedOutputs = Object.entries(tempOutputs).filter(([id, value]) => {
        const originalOutput = currentFunction.outputs.find((o) => o.property_id === Number(id));
        return originalOutput?.value !== value;
      });

      if (changedOutputs.length > 0) {
        hasChanges = true;
        updates.outputs = changedOutputs.map(([id, value]) => ({
          property_id: Number(id),
          value,
        }));
      }
    } else if (currentAction === 'notifica') {
      const changedNotifications = Object.entries(tempNotifications).filter(([id, value]) => {
        const originalNotification = currentFunction.notifications.find((n) => n.property_id === Number(id));
        return originalNotification?.value !== value;
      });

      if (changedNotifications.length > 0) {
        hasChanges = true;
        updates.notifications = changedNotifications.map(([id, value]) => ({
          property_id: Number(id),
          value,
        }));
      }
    }

    if (!hasChanges) {
      setIsModalVisible(false);
      return;
    }

    if (hasChanges) {
      // Imposta lo stato di allineamento su "Disallineato" quando ci sono modifiche
      onAlignmentChange('Disallineato');
    }

    await onUpdateFunction(currentFunction.id, updates);
    setIsModalVisible(false);
    setTempParameters({});
    setTempInputs({});
    setTempOutputs({});
    setTempNotifications({});
  }, [currentFunction, currentAction, tempParameters, tempInputs, tempOutputs, tempNotifications, onUpdateFunction]);

  const columns = [
    {
      title: '',
      dataIndex: 'select',
      render: (_: any, record: DeviceFunction) => (
        <Checkbox checked={checkedFunctions.includes(record.id)} onChange={() => onFunctionSelect(record.id)} />
      ),
    },
    {
      title: (
        <Space>
          <ControlOutlined style={{ fontSize: '1.2rem' }} /> {t('function')}
        </Space>
      ),
      dataIndex: ['function', 'name'],
      key: 'name',
    },
    {
      title: (
        <Space>
          <SlidersOutlined style={{ fontSize: '1.2rem' }} /> {t('parameters')}
        </Space>
      ),
      key: 'parameters',
      render: (_: any, record: DeviceFunction) =>
        record.function.parameters.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {record.function.parameters
              .map((param) => {
                const deviceParam = record.parameters.find((p) => p.property_id === param.id);
                if (param.name === 'delay' && (!deviceParam || !deviceParam.value)) {
                  return null;
                }
                return `${param.name}: ${deviceParam ? deviceParam.value : ''}`;
              })
              .filter(Boolean)
              .join(', ')}
            <SettingOutlined
              onClick={() => handleIconClick(record, 'parametro')}
              style={{ fontSize: '1rem', color: '#1890ff', cursor: 'pointer' }}
            />
          </div>
        ) : (
          <SettingOutlined disabled style={{ fontSize: '1rem', color: '#1890ff', cursor: 'not-allowed' }} />
        ),
    },
    {
      title: (
        <Space>
          <ImportOutlined style={{ fontSize: '1.2rem' }} /> {t('inputs')}
        </Space>
      ),
      key: 'inputs',
      render: (_: any, record: DeviceFunction) =>
        record?.function?.inputs.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {record.function.inputs
              .map((input) => {
                const deviceInput = record.inputs.find((i) => i.property_id === input.id);
                return `${input.name}: ${deviceInput ? deviceInput.value : ''}`;
              })
              .join(', ')}
            <SettingOutlined
              onClick={() => handleIconClick(record, 'ingresso')}
              style={{ fontSize: '1rem', color: '#1890ff', cursor: 'pointer' }}
            />
          </div>
        ) : (
          <SettingOutlined
            style={{ fontSize: '1rem', color: '#1890ff', cursor: 'pointer' }}
            onClick={() => handleIconClick(record, 'ingresso')}
          />
        ),
    },
    {
      title: (
        <Space>
          <ExportOutlined style={{ fontSize: '1.2rem' }} /> {t('outputs')}
        </Space>
      ),
      key: 'outputs',
      render: (_: any, record: DeviceFunction) =>
        record?.function?.outputs.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {record.function.outputs
              .map((output) => {
                const deviceOutput = record.outputs.find((o) => o.property_id === output.id);
                return `${output.name}: ${deviceOutput ? deviceOutput.value : ''}`;
              })
              .join(', ')}
            <SettingOutlined
              onClick={() => handleIconClick(record, 'uscita')}
              style={{ fontSize: '1rem', color: '#1890ff', cursor: 'pointer' }}
            />
          </div>
        ) : (
          <SettingOutlined
            style={{ fontSize: '1rem', color: '#1890ff', cursor: 'pointer' }}
            onClick={() => handleIconClick(record, 'uscita')}
          />
        ),
    },
    {
      title: (
        <Space>
          <BellOutlined style={{ fontSize: '1.2rem' }} /> {t('notifications')}
        </Space>
      ),
      key: 'notifications',
      render: (_: any, record: DeviceFunction) =>
        record?.function?.notifications.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {record.function.notifications
              .map((notification) => {
                const deviceNotification = record.notifications.find((n) => n.property_id === notification.id);
                return `${notification.name}: ${deviceNotification ? deviceNotification.value : ''}`;
              })
              .join(', ')}
            <SettingOutlined
              onClick={() => handleIconClick(record, 'notifica')}
              style={{ fontSize: '1rem', color: '#1890ff', cursor: 'pointer' }}
            />
          </div>
        ) : (
          <SettingOutlined
            style={{ fontSize: '1rem', color: '#1890ff', cursor: 'pointer' }}
            onClick={() => handleIconClick(record, 'notifica')}
          />
        ),
    },
  ];

  const renderModalContent = () => {
    if (currentAction === 'ingresso' && currentFunction) {
      const columns = [
        {
          title: t('name'),
          dataIndex: 'name',
          key: 'name',
          render: (text: string) => text,
        },
        {
          title: t('type'),
          dataIndex: 'type',
          key: 'type',
          render: (text: string) => (
            <Select value={text} style={{ width: '100%' }}>
              <Select.Option value="GPIO">GPIO</Select.Option>
              <Select.Option value="DIN">DIN</Select.Option>
            </Select>
          ),
        },
        {
          title: t('value'),
          dataIndex: 'value',
          key: 'value',
          render: (text: string, record: any) => {
            const deviceInput = currentFunction.inputs.find((i) => i.property_id === record.id);
            return (
              <Input
                value={tempInputs[record.id] ?? (deviceInput ? deviceInput.value : '')}
                onChange={(e) => handleInputChange(record.id, 'options2', e.target.value)}
                placeholder={t('insertValue')}
              />
            );
          },
        },
      ];

      const data = currentFunction.function.inputs.map((input) => {
        const deviceInput = currentFunction.inputs.find((i) => i.property_id === input.id);
        return {
          key: input.id,
          id: input.id,
          name: input.name,
          type: 'GPIO',
          value: deviceInput?.value || '',
        };
      });

      return <Table columns={columns} dataSource={data} pagination={false} />;
    } else if (currentAction === 'uscita' && currentFunction) {
      const columns = [
        {
          title: t('name'),
          dataIndex: 'name',
          key: 'name',
          render: (text: string) => text,
        },
        {
          title: t('type'),
          dataIndex: 'type',
          key: 'type',
          render: (text: string) => (
            <Select value={text} style={{ width: '100%' }}>
              <Select.Option value="GPIO">GPIO</Select.Option>
            </Select>
          ),
        },
        {
          title: t('value'),
          dataIndex: 'value',
          key: 'value',
          render: (text: string, record: any) => {
            const deviceOutput = currentFunction.outputs.find((o) => o.property_id === record.id);
            return (
              <Input
                value={tempOutputs[record.id] ?? (deviceOutput ? deviceOutput.value : '')}
                onChange={(e) => handleOutputChange(record.id, 'options2', e.target.value)}
                placeholder={t('insertValue')}
              />
            );
          },
        },
      ];

      const data = currentFunction.function.outputs.map((output) => {
        const deviceOutput = currentFunction.outputs.find((o) => o.property_id === output.id);
        return {
          key: output.id,
          id: output.id,
          name: output.name,
          type: 'GPIO',
          value: deviceOutput?.value || '',
        };
      });

      return <Table columns={columns} dataSource={data} pagination={false} />;
    } else if (currentAction === 'parametro' && currentFunction) {
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          {currentFunction.function.parameters.map((param: FunctionParameter) => {
            const deviceParam = currentFunction.parameters.find((p) => p.property_id === param.id);
            return (
              <Descriptions key={param.id} column={1} bordered>
                <Descriptions.Item label={param.name} labelStyle={{ fontWeight: 'bold', width: '200px' }}>
                  {param.name === 'mode' ? (
                    <Select
                      value={tempParameters[param.id] ?? (deviceParam ? deviceParam.value : undefined)}
                      onChange={(value) => handleParameterChange(param.id, value)}
                      placeholder={`Select ${param.name}`}
                      style={{ width: '100%' }}
                    >
                      <Select.Option value={1}>Mode 1</Select.Option>
                      <Select.Option value={2}>Mode 2</Select.Option>
                      <Select.Option value={3}>Mode 3</Select.Option>
                    </Select>
                  ) : (
                    <Input
                      value={tempParameters[param.id] ?? (deviceParam ? deviceParam.value : '')}
                      onChange={(e) => handleParameterChange(param.id, e.target.value)}
                      placeholder={`Enter ${param.name}`}
                    />
                  )}
                </Descriptions.Item>
              </Descriptions>
            );
          })}
        </Space>
      );
    } else if (currentAction === 'notifica' && currentFunction) {
      const columns = [
        {
          title: t('name'),
          dataIndex: 'name',
          key: 'name',
          render: (text: string) => text,
        },
        {
          title: t('type'),
          dataIndex: 'type',
          key: 'type',
          render: (text: string) => (
            <Select value={text} style={{ width: '100%' }}>
              <Select.Option value="GPIO">GPIO</Select.Option>
            </Select>
          ),
        },
        {
          title: t('value'),
          dataIndex: 'value',
          key: 'value',
          render: (text: string, record: any) => {
            const deviceNotification = currentFunction.notifications.find((n) => n.property_id === record.id);
            return (
              <Input
                value={tempNotifications[record.id] ?? (deviceNotification ? deviceNotification.value : '')}
                onChange={(e) => handleNotificationChange(record.id, 'options2', e.target.value)}
                placeholder={t('insertValue')}
              />
            );
          },
        },
      ];

      const data = currentFunction.function.notifications.map((notification) => {
        const deviceNotification = currentFunction.notifications.find((n) => n.property_id === notification.id);
        return {
          key: notification.id,
          id: notification.id,
          name: notification.name,
          type: 'GPIO',
          value: deviceNotification?.value || '',
        };
      });

      return <Table columns={columns} dataSource={data} pagination={false} />;
    }
    return null;
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Table columns={columns} dataSource={selectedFunctions} rowKey="id" pagination={false} scroll={{ y: 210 }} />
      <Row gutter={[16, 16]} justify="space-between">
        <Col xs={24} sm={24} md={12}>
          <Row gutter={[8, 8]}>
            <Col>
              <Button
                onClick={handleDeleteClick}
                type="primary"
                icon={<DeleteOutlined style={{ fontSize: '1.2rem' }} />}
              >
                {t('delete')}
              </Button>
            </Col>
            <Col>
              <Button
                onClick={() => setIsAddModalVisible(true)}
                type="primary"
                icon={<ControlOutlined style={{ fontSize: '1.2rem' }} />}
              >
                {t('addFunction')}
              </Button>
            </Col>
            <Col>
              <Button type="primary" onClick={onTestClick} icon={<BulbOutlined style={{ fontSize: '1.2rem' }} />}>
                Test
              </Button>
            </Col>
          </Row>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Row gutter={[8, 8]} className={styles.rightButtonGroup}>
            <Col>
              <Button
                type="primary"
                icon={<CloudDownloadOutlined style={{ fontSize: '1.2rem' }} />}
                onClick={handleImportProgram}
                loading={isImportingLoading}
              >
                {t('recall')}
              </Button>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<CloudUploadOutlined style={{ fontSize: '1.2rem' }} />}
                onClick={handleProgram}
                loading={isLoading}
              >
                {t('schedule')}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      <Modal
        title={`Modifica ${currentAction}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleModalOk}
        width={600}
      >
        {renderModalContent()}
      </Modal>

      <Modal
        title={t('addFunction')}
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={400}
      >
        <List
          dataSource={functions}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              onClick={() => {
                onAddFunction(item);
                setIsAddModalVisible(false);
              }}
              style={{ cursor: 'pointer' }}
            >
              {item.name}
            </List.Item>
          )}
        />
      </Modal>

      <Modal
        title={
          <span>
            <ExclamationCircleFilled style={{ color: '#faad14', marginRight: '8px' }} />
            Conferma eliminazione
          </span>
        }
        open={isDeleteConfirmVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmVisible(false)}
        okText="Elimina"
        cancelText="Annulla"
        okButtonProps={{
          danger: true,
        }}
      >
        <p>
          Sei sicuro di voler eliminare{' '}
          {checkedFunctions.length === 1
            ? 'la funzione selezionata'
            : `le ${checkedFunctions.length} funzioni selezionate`}
          ?
        </p>
      </Modal>

      <Modal open={showTestComponent} onCancel={onTestClick} width={370} footer={null}>
        <CardDispositivoFactory
          deviceType="UPL"
          deviceName="UPL Modello XX"
          dinOptions={dinOptions}
          selectedDin={selectedDin}
          setSelectedDin={onDinSelect}
          onTest={onTestClick}
          onSend={onSendCommand}
          status={status}
          setStatus={onStatusChange}
          value={value}
          setValue={onValueChange}
          showTestControl={showTestControl}
        />
      </Modal>
    </Space>
  );
}
