/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: NodoFormGenerali.tsx
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import { Badge, Card, Col, Divider, Form, FormInstance, Row, Statistic } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';
const NodoFormGenerali = ({ form }: { form: FormInstance }) => {
  const t = useTranslations('NodoForm');

  const style = {
    width: '100%',
    maxWidth: '680px',
    margin: '0 auto',
    padding: '0 15px',
  };

  const containerStyle = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1.5rem',
  };

  const renderField = (value: string | number | boolean | undefined) => (value !== undefined ? String(value) : '-');

  const renderEnableField = (value: boolean | undefined) => {
    const isEnabled = value === true;
    return (
      <Card
        size="small"
        bordered={false}
        bodyStyle={{
          padding: '4px',
          minHeight: '20px',
        }}
        style={{ boxShadow: '5px 8px 24px 5px rgba(208, 216, 243, 0.6)', cursor: 'default' }}
      >
        <Statistic
          title={
            <span
              style={{
                fontSize: '0.75rem',
                marginBottom: '2px',
              }}
            >
              {isEnabled ? t('enabled') : t('disabled')}
            </span>
          }
          value={''}
          formatter={() => ''}
          valueStyle={{
            color: 'white',
            fontSize: '0.85rem',
          }}
          prefix={<Badge status={isEnabled ? 'success' : 'error'} />}
        />
      </Card>
    );
  };

  return (
    <div style={containerStyle}>
      <Form form={form} layout="vertical" style={style}>
        <Form.Item name="id" noStyle>
          <input type="hidden" />
        </Form.Item>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={12}>
            <Card
              size="small"
              bordered={false}
              bodyStyle={{
                padding: '4px',
                minHeight: '20px',
              }}
              style={{ boxShadow: '5px 8px 24px 5px rgba(208, 216, 243, 0.6)', cursor: 'default' }}
            >
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: '0.75rem',
                      marginBottom: '2px',
                    }}
                  >
                    SID
                  </span>
                }
                value={renderField(form.getFieldValue('sid'))}
                valueStyle={{
                  color: 'black',
                  fontSize: '0.85rem',
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Card
              size="small"
              bordered={false}
              bodyStyle={{
                padding: '4px',
                minHeight: '20px',
              }}
              style={{ boxShadow: '5px 8px 24px 5px rgba(208, 216, 243, 0.6)', cursor: 'default' }}
            >
              <Statistic
                title={
                  <span
                    style={{
                      fontSize: '0.75rem',
                      marginBottom: '2px',
                    }}
                  >
                    DIN
                  </span>
                }
                value={renderField(form.getFieldValue('din'))}
                valueStyle={{
                  color: 'black',
                  fontSize: '0.85rem',
                }}
              />
            </Card>
          </Col>
        </Row>
        <Divider style={{ margin: '0.75rem 0' }} />

        <Row gutter={[8, 8]}>
          <Col xs={24} sm={24} md={12}>
            <Form.Item name="enable">{renderEnableField(form.getFieldValue('enable'))}</Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};
export default NodoFormGenerali;
