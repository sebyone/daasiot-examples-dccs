import {
  CheckCircleOutlined,
  OrderedListOutlined,
  PlayCircleOutlined,
  SyncOutlined,
  UsbOutlined,
} from '@ant-design/icons';
import { Alert, Card, Space, Steps, Typography } from 'antd';
import { useTranslations } from 'next-intl';
import React from 'react';

const { Title } = Typography;

export default function FirmwareUpdaterExplanation({ ota }: { ota: boolean }) {
  const t = useTranslations('FirmwareUpdaterExplanation');
  return (
    <Card style={{ maxWidth: '800px' }}>
      <Space direction="vertical">
        {ota && <Alert message={t('alert.warning')} description={t('alert.description')} type="warning" showIcon />}
        <Typography>
          <Title level={3}>{t('typography.title')}</Title>
        </Typography>

        <Steps
          direction="vertical"
          current={-1}
          items={[
            { title: t('steps.step1.title'), description: t('steps.step1.description'), icon: <UsbOutlined /> },
            { title: t('steps.step2.title'), description: t('steps.step2.description'), icon: <OrderedListOutlined /> },
            { title: t('steps.step3.title'), description: t('steps.step3.description'), icon: <PlayCircleOutlined /> },
            { title: t('steps.step4.title'), description: t('steps.step4.description'), icon: <SyncOutlined /> },
            { title: t('steps.step5.title'), description: t('steps.step5.description'), icon: <CheckCircleOutlined /> },
          ]}
        />
      </Space>
    </Card>
  );
}
