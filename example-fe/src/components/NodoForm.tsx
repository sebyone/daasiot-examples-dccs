import { NodoFormProps } from '@/types';
import { Checkbox, Col, Form, Input, Row } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const NodoForm = ({ form, onHideTestComponent }: NodoFormProps) => {
  const marginBottom = { marginBottom: -22 };
  const cursor = { cursor: 'default' };
  const t = useTranslations('NodoForm');
  const style = {
    minWidth: '550px',
    width: '100%',
    maxWidth: '680px',
    marginTop: -50,
    transform: 'scale(0.9)',
    marginLeft: -30,
  };

  //const [maps, setMaps] = useState<DinDataType[]>([]);

  /*useEffect(() => {
    ConfigService
      .getMaps()
      .then((data) => setMaps(data))
      .catch((error) => console.error('Errore nel caricamento dei maps:', error));
  }, []);*/

  const handleValuesChange = () => {
    if (form.isFieldsTouched()) {
      onHideTestComponent();
    }
  };

  return (
    <div
      style={{
        minWidth: '250px',
        width: '100%',
        display: 'flex',
        justifyItems: 'center',
        justifyContent: 'left',
        marginTop: '20px',
      }}
    >
      <Form form={form} layout="vertical" autoComplete="off" onValuesChange={handleValuesChange} style={style}>
        <Form.Item name="id" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Row gutter={32} style={marginBottom}>
          <Col span={16}>
            <Form.Item name="denominazione" label={t('name')}>
              <Input name="denominazione" placeholder={t('name')} readOnly style={cursor} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="enable" valuePropName="checked">
              <Checkbox style={{ marginTop: 26 }} disabled>
                {t('enabled')}
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20} style={marginBottom}>
          <Col span={16}>
            <Form.Item name="matricola" label={t('serialNumber')}>
              <Input name="matricola" placeholder={t('serialNumber')} readOnly style={cursor} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20} style={marginBottom}>
          <Col span={16}>
            <Form.Item label={t('model')} name="modello">
              <Input name="modello" placeholder={t('serialNumber')} readOnly style={cursor} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16} style={marginBottom}>
          <Col span={8}>
            <Form.Item name="sid" label="SID">
              <Input name="sid" placeholder="SID" readOnly style={cursor} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="din" label="DIN">
              <Input name="din" placeholder="DIN" readOnly style={cursor} />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16} style={marginBottom}>
          <Col span={8}>
            <Form.Item name="latitudine" label={t('latitude')}>
              <Input name="latitudine" placeholder={t('latitude')} readOnly style={cursor} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="longitudine" label={t('longitude')}>
              <Input name="longitudine" placeholder={t('longitude')} readOnly style={cursor} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default NodoForm;
