/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: NodoForm.tsx
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import { CreateDevice, DataDevice, NodoFormProps } from '@/types';
import { Button, Checkbox, Col, Form, Input, Row, Select } from 'antd';
import { useTranslations } from 'next-intl';

const NodoForm = ({
  form,
  onFinish,
  setIsDataSaved,
  deviceModels,
  receiversData,
  selectedReceiverSid,
  onReceiverChange,
  onOpenModal,
  dins,
  onDinChange,
  mode,
}: NodoFormProps) => {
  const t = useTranslations('NodoForm');
  const marginBottom = { marginBottom: '1rem' };
  const style = {
    width: '100%',
    maxWidth: '60rem',
    transform: 'scale(0.9)',
  };

  const handleFinish = (values: CreateDevice) => {
    onFinish(values);
    setIsDataSaved(true);
  };

  const handleValuesChange = () => {
    if (form.isFieldsTouched()) {
      setIsDataSaved(false);
    }
  };

  const handleOpenModal = () => {
    onOpenModal();
  };

  return (
    <div
      style={{
        width: '100%',

        marginTop: '1rem',
      }}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
        style={style}
      >
        <Form.Item name="id" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Row gutter={[16, 16]} style={marginBottom}>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item name="id" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="din_id" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <Form.Item name="denominazione" label={t('name')}>
              <Input name="denominazione" placeholder={t('name')} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item name="enable" valuePropName="checked">
              <Checkbox>{t('enabled')}</Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={marginBottom}>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item name="serial" label={t('serialNumber')}>
              <Input name="serial" placeholder={t('serialNumber')} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={marginBottom}>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item label={t('model')} name="modello">
              <Select
                placeholder="Modello"
                options={deviceModels.map((model) => ({
                  value: model.id,
                  label: model.name,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={marginBottom}>
          <Col xs={24} sm={24} md={4} lg={4}>
            <Form.Item name="receiver" label="Receivers">
              <Select
                placeholder="Receivers"
                options={receiversData.map((receiver) => ({
                  value: receiver.id,
                  label: receiver.title,
                }))}
                onChange={onReceiverChange}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4} lg={4}>
            <Form.Item name="sid" label="SID">
              <Input name="sid" placeholder="SID" readOnly style={{ cursor: 'default' }} value={selectedReceiverSid} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4} lg={4}>
            <Form.Item name="din" label="DIN">
              <Select
                placeholder="Seleziona DIN"
                onChange={onDinChange}
                options={dins?.map((din) => ({
                  value: din.id,
                  label: din.din,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={marginBottom}>
          <Col xs={24} sm={24} md={12} lg={12}>
            <Form.Item name="latitudine" label={t('latitude')} noStyle>
              <Input name="latitudine" placeholder={t('latitude')} type="hidden" />
            </Form.Item>
            <Form.Item name="longitudine" label={t('longitude')} noStyle>
              <Input name="longitudine" placeholder={t('longitude')} type="hidden" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={4} lg={4}>
            <Button type="primary" style={{ width: '100%' }} onClick={onOpenModal}>
              {mode === 'edit' ? 'Aggiorna Map' : 'Map'}
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default NodoForm;
