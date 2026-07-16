/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: DinLocalForm.tsx
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import { useWindowSize } from '@/hooks/useWindowSize';
import { ConfigFormData, DinLocalFormProps } from '@/types';
import { Button, Card, Checkbox, Col, Form, Input, List, Row, Select, Switch } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

const DinLocalForm = ({
  form,
  onFinish,
  onStart,
  setIsDataSaved,
  autoStart,
  setAutoStart,
  showEnabledCheckBox,
  showAcceptAllCheckBox,
  showPowerActions,
  showPowerActionsProcessor,
  showSaveButton,
  showStatus,
  statusData,
}: DinLocalFormProps) => {
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const is4K = width >= 2560;

  const marginBottom = { marginBottom: isMobile ? 10 : -8 };

  const optionsReliability = [
    { value: '0', label: 'Asynchronous' },
    { value: '1', label: 'Synchronous' },
  ];

  const optionsEfficiency = [
    { value: '0', label: 'Rate' },
    { value: '1', label: 'Power' },
    { value: '2', label: 'Dynamic' },
  ];

  const optionsPrivacy = [
    { value: '0', label: 'Unsafe' },
    { value: '1', label: 'Identity' },
    { value: '2', label: 'Crypto' },
    { value: '3', label: 'Identity+Crypto' },
    { value: '4', label: 'Identity+Crypto+Timed' },
  ];

  const [processorAutoStart, setProcessorAutoStart] = useState(false);

  const t = useTranslations('DinLocalForm');

  const handleProcessorAutoStartChange = (checked: boolean) => {
    setProcessorAutoStart(checked);
  };

  const handleReceiverAutoStartChange = (checked: boolean) => {
    if (setAutoStart) {
      setAutoStart(checked);
    }
  };

  const handleFinish = (values: ConfigFormData) => {
    if (onFinish) {
      onFinish(values);
    }
    setIsDataSaved(true);
  };

  const handleValuesChange = () => {
    if (form.isFieldsTouched()) {
      setIsDataSaved(false);
    }
  };

  const handleStart = () => {
    if (onStart) {
      onStart();
    }
  };

  return (
    <div
      style={{
        width: is4K ? '70%' : '100%',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '10px',
        padding: isMobile ? '10px' : '20px',
        paddingBottom: '50px',
      }}
    >
      <Form
        layout="vertical"
        form={form}
        autoComplete="off"
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '700px',
          marginTop: isMobile ? 10 : -35,
          transform: isMobile ? 'none' : 'scale(0.9)',
          marginBottom: '30px',
        }}
      >
        <Row gutter={[16, isMobile ? 16 : 8]} style={marginBottom}>
          <Col span={24}>
            <Form.Item name="id" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="din_id" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="_id" noStyle>
              <Input type="hidden" />
            </Form.Item>

            <Form.Item label="Title" name="title">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, isMobile ? 16 : 8]} style={marginBottom}>
          <Col xs={24} sm={24} md={24} lg={12}>
            <Form.Item label="Network Identifier (SID)" name="sid">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12}>
            <Form.Item label="Node Identifier (DIN)" name="din">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, isMobile ? 16 : 8]} style={marginBottom}>
          <Col xs={24} lg={15}>
            <Form.Item label="Profile R (Realability)" name="profileR">
              <Select options={optionsReliability} />
            </Form.Item>
          </Col>
          <Col xs={24} lg={9}>
            <Form.Item label="Packets/Errors" name="packetsErrors">
              <Input placeholder="(%)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, isMobile ? 16 : 8]} style={marginBottom}>
          <Col xs={24} lg={15}>
            <Form.Item label="Profile E (Efficiency)" name="profileE">
              <Select options={optionsEfficiency} />
            </Form.Item>
          </Col>
          <Col xs={24} lg={9}>
            <Form.Item label="Traffic/Energy" name="trafficEnergy">
              <Input placeholder="(Byte/W)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, isMobile ? 16 : 8]} style={marginBottom}>
          <Col xs={24} lg={15}>
            <Form.Item label="Profile S (Privacy)" name="profileS">
              <Select options={optionsPrivacy} />
            </Form.Item>
          </Col>
          <Col xs={24} lg={9}>
            <Form.Item label="Requests/Faults" name="requestsFault">
              <Input placeholder="(%)" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, isMobile ? 16 : 8]} style={marginBottom}>
          <Col xs={24} lg={16}>
            <Form.Item label="SKey" name="skey">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} lg={8}>
            <Button style={{ marginTop: isMobile ? 0 : 20, width: isMobile ? '100%' : 'auto' }} type="primary">
              Generate
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, isMobile ? 16 : 8]} style={marginBottom}>
          {showEnabledCheckBox && (
            <Col>
              <Form.Item name="enable" valuePropName="checked">
                <Checkbox>Enabled</Checkbox>
              </Form.Item>
            </Col>
          )}
          {showAcceptAllCheckBox && (
            <Col>
              <Form.Item name="acpt_all" valuePropName="checked">
                <Checkbox>Accept all</Checkbox>
              </Form.Item>
            </Col>
          )}
        </Row>
      </Form>

      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '20px',
          width: '100%',
          marginTop: isMobile ? '20px' : '-15px',
        }}
      >
        <div style={{ width: '100%' }}>
          {showPowerActions && (
            <Card
              title="Receiver"
              bordered={false}
              style={{
                width: '100%',
                backgroundColor: '#f0f0f0',
              }}
              size="small"
            >
              <span style={{ marginRight: 10, whiteSpace: 'nowrap' }}>Avvio Automatico:</span>
              <Switch checked={autoStart} onChange={handleReceiverAutoStartChange} />
            </Card>
          )}
          {showStatus && (
            <>
              <Card
                title="Status"
                bordered={false}
                style={{
                  width: '100%',
                  backgroundColor: '#f0f0f0',
                  marginTop: '20px',
                }}
              >
                {statusData ? (
                  <List
                    size="small"
                    dataSource={[
                      { key: 'lasttime', label: 'Start Time', value: statusData.lasttime },
                      { key: 'hwver', label: 'DaaS Version', value: statusData.hwver },
                      { key: 'linked', label: 'Links', value: statusData.linked },
                      { key: 'sync', label: 'Map Size', value: statusData.sync },
                      { key: 'lock', label: 'Lock', value: statusData.lock },
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span>{item.label}:</span>
                          <span>{item.value}</span>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : null}
              </Card>
              <Button
                style={{
                  width: isMobile ? '100%' : '120px',
                  marginTop: '10px',
                  marginLeft: isMobile ? '0' : 'auto',
                  display: 'block',
                }}
                type="primary"
              >
                Restart
              </Button>
            </>
          )}
        </div>

        <div style={{ width: '100%' }}>
          {showPowerActionsProcessor && (
            <Card
              title="Processor"
              bordered={false}
              style={{
                width: '100%',
                backgroundColor: '#f0f0f0',
              }}
              size="small"
            >
              <span style={{ marginRight: 10 }}>Avvio Automatico:</span>
              <Switch checked={processorAutoStart} onChange={handleProcessorAutoStartChange} />
            </Card>
          )}
          {showStatus && (
            <>
              <Card
                title="Statistics"
                bordered={false}
                style={{
                  width: '100%',
                  backgroundColor: '#f0f0f0',
                  marginTop: '20px',
                }}
              >
                {statusData ? (
                  <List
                    size="small"
                    dataSource={[
                      { key: 'lasttime', label: 'Zero Time', value: statusData.lasttime },
                      { key: 'hwver', label: 'Received (DDO)', value: statusData.hwver },
                      { key: 'linked', label: 'Processed', value: statusData.linked },
                      { key: 'sync', label: 'Rate', value: statusData.sync },
                      { key: 'lock', label: 'Free mem', value: statusData.lock },
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <span>{item.label}:</span>
                          <span>{item.value}</span>
                        </div>
                      </List.Item>
                    )}
                  />
                ) : null}
              </Card>
              <Button
                style={{
                  width: isMobile ? '100%' : '150px',
                  marginTop: '10px',
                  marginLeft: isMobile ? '0' : 'auto',
                  display: 'block',
                  marginBottom: '20px',
                }}
                type="primary"
              >
                Reset statistics
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DinLocalForm;
