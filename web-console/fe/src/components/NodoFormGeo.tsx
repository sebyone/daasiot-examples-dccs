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
import { Card, Col, Descriptions, Divider, Form, FormInstance, Row, Statistic, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';
import './NodoFormGeo.css';
const { Text } = Typography;
const NodoFormGeo = ({ form }: { form: FormInstance }) => {
  const t = useTranslations('NodoForm');
  const style = {
    width: '100%',
    marginTop: '28px',
    padding: '0 15px',
  };
  const renderField = (value: string | number | boolean | undefined) => (value !== undefined ? String(value) : '-');
  return (
    <div className="form-geo-container">
      <Form form={form} layout="vertical" style={style}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={11}>
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
                    Latituidine
                  </span>
                }
                value={renderField(form.getFieldValue('latitudine'))}
                valueStyle={{
                  color: 'black',
                  fontSize: '0.85rem',
                }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={11}>
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
                    Longitudine
                  </span>
                }
                value={renderField(form.getFieldValue('longitudine'))}
                valueStyle={{
                  color: 'black',
                  fontSize: '0.85rem',
                }}
              />
            </Card>
          </Col>
        </Row>
        <Divider className="geo-divider" />
      </Form>
    </div>
  );
};
export default NodoFormGeo;
