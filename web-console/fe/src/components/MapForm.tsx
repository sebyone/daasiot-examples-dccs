/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: MapForm.tsx
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
import { DinDataType, DinFormValues, MapFormProps } from '@/types';
import { Checkbox, Col, Divider, Form, Input, Row, Select } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';

const MapForm = ({ form, onFinish, setIsDataSaved }: MapFormProps) => {
  const t = useTranslations('MapForm');
  const tipologiaOptions = [{ value: '0' }, { value: '1' }];
  const [isCallableChecked, setIsCallableChecked] = useState(false);
  const [isCustomFeaturesChecked, setIsCustomFeaturesChecked] = useState(false);
  const [sidOptions, setSidOptions] = useState<{ value: string }[]>([]);

  const handleFinish = (values: DinFormValues) => {
    onFinish(values);
    setIsDataSaved(true);
  };

  const handleValuesChange = () => {
    if (form.isFieldsTouched()) {
      setIsDataSaved(false);
    }
  };

  useEffect(() => {
    const fetchDins = async () => {
      try {
        const dins = await ConfigService.getDin();
        const uniqueSids = new Set(dins.map((din: DinDataType) => din.sid));
        const options = Array.from(uniqueSids).map((sid) => ({
          value: sid,
        }));
        setSidOptions(options);
      } catch (error) {
        console.error('Error fetching DINs:', error);
      }
    };

    fetchDins();
  }, []);

  return (
    <div style={{ width: '40%' }}>
      <Row gutter={48}>
        <Col span={24}>
          <Form
            layout="vertical"
            form={form}
            autoComplete="off"
            onFinish={handleFinish}
            onValuesChange={handleValuesChange}
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  style={{ marginTop: -20 }}
                  label="SID"
                  name="sid"
                  rules={[{ required: true, message: t('enterSID') }]}
                >
                  <Select options={sidOptions} />
                </Form.Item>

                <Form.Item label="DIN" name="din" rules={[{ required: true, message: t('enterDIN') }]}>
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item style={{ marginBottom: -1 }}>
                  <Checkbox onChange={(e) => setIsCallableChecked(e.target.checked)}>Callable</Checkbox>
                  <Divider style={{ marginTop: '1px', marginBottom: '4px' }} />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item name="links" label="Link">
                      <Select disabled={!isCallableChecked} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="address" label="Address">
                      <Input disabled={!isCallableChecked} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="receiver" label="Receiver">
                      <Select disabled={!isCallableChecked} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ marginBottom: -1 }}>
                  <Checkbox onChange={(e) => setIsCustomFeaturesChecked(e.target.checked)}>Custom Features</Checkbox>
                  <Divider style={{ marginTop: '1px', marginBottom: '4px' }} />
                </Form.Item>

                <Form.Item label="Profile R (Realability)" name="profileR">
                  <Select options={tipologiaOptions} disabled={!isCustomFeaturesChecked} />
                </Form.Item>

                <Form.Item label="Profile E (Efficiency)" name="profileE">
                  <Select options={tipologiaOptions} disabled={!isCustomFeaturesChecked} />
                </Form.Item>

                <Form.Item label="Profile S (Privacy)" name="profileS">
                  <Select options={tipologiaOptions} disabled={!isCustomFeaturesChecked} />
                </Form.Item>

                <Form.Item label="SKey" name="skey">
                  <Input disabled={!isCustomFeaturesChecked} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default MapForm;
