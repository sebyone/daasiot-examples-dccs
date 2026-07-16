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
import { LinkDataType } from '@/types';
import { Form, Modal } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const DataPanel = dynamic(() => import('@/components/DataPanel'), { ssr: false });
const LinkForm = dynamic(() => import('@/components/LinkForm'), { ssr: false });
const Panel = dynamic(() => import('@/components/Panel'), { ssr: false });
const PanelView = dynamic(() => import('@/components/PanelView'), { ssr: false });

const EditLink = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const { notify, contextHolder } = useCustomNotification();
  const [isDataSaved, setIsDataSaved] = useState(true);
  const [networkTech, setNetworkTech] = useState<number | null>(null);
  const [link, setLink] = useState<string>();
  const t = useTranslations('EditLink');
  const tBack = useTranslations('handleGoBack');
  const locale = useLocale();
  const params = useParams();
  const id = Number(params.id);

  useEffect(() => {
    ConfigService.getLinkById(id)
      .then((data) => {
        setNetworkTech(data.link);
        if (data.link === 2) {
          const [ipAddress, port] = data.url.split(':');

          form.setFieldsValue({
            ...data,
            ipAddress,
            port,
          });
        } else {
          form.setFieldsValue(data);
        }
        setLink(data.url);
      })
      .catch((error) => {
        notify('error', t('error'), t('errorGetLink'));
        console.error('Errore:', error);
      });
  }, []);

  const onFinish = async (values: LinkDataType) => {
    try {
      let updatedValues = { ...values };
      if (values.link === 2) {
        if (values.ipAddress && values.port) {
          updatedValues.url = `${values.ipAddress}:${values.port}`;
        }
        delete updatedValues.ipAddress;
        delete updatedValues.port;
      }
      await configService.updateLink(id, updatedValues);
      notify('success', t('success'), t('successSave'));
    } catch {
      notify('error', t('error'), t('errorUpdateLink'));
    }
  };

  const handleGoBack = () => {
    if (!isDataSaved) {
      Modal.confirm({
        title: tBack('title'),
        content: tBack('content'),
        okText: 'Ok',
        cancelText: tBack('cancelText'),
        onOk: () => {
          router.push(`/${locale}/admin/configurazione/editDinLocal/1`);
        },
      });
      return;
    }

    router.push(`/${locale}/admin/configurazione/editDinLocal/1`);
  };

  const handleSave = () => {
    form.submit();
  };

  return (
    <>
      {contextHolder}
      <DataPanel title={link} isEditing={isDataSaved} showSemaphore={true}>
        <Panel handleGoBack={handleGoBack} handleSave={handleSave} showSaveButtons={true} layoutStyle="singleTable">
          <PanelView layoutStyle="singleTable">
            <LinkForm
              form={form}
              onFinish={onFinish}
              setIsDataSaved={setIsDataSaved}
              networkTech={networkTech}
              setNetworkTech={setNetworkTech}
            />
          </PanelView>
        </Panel>
      </DataPanel>
    </>
  );
};

export default EditLink;
