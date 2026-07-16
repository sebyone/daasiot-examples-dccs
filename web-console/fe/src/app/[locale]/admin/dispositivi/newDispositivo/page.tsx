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
import { DataDevice } from '@/types';
import { Form, Modal } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const DataPanel = dynamic(() => import('@/components/DataPanel'), { ssr: false });
const NodoForm = dynamic(() => import('@/components/NodoForm'), { ssr: false });
const Panel = dynamic(() => import('@/components/Panel'), { ssr: false });
const PanelView = dynamic(() => import('@/components/PanelView'), { ssr: false });

const NewDispositivo = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const { notify, contextHolder } = useCustomNotification();
  const [isDataSaved, setIsDataSaved] = useState(true);
  const t = useTranslations('NewDispositivo');
  const tBack = useTranslations('handleGoBack');
  const locale = useLocale();
  const [, updateState] = useState<object>();

  useEffect(() => {
    updateState({});
  }, [locale]);

  const onFinish = async (_values: DataDevice) => {
    /*try {
      await configService.createLink(values);
      notify('success', t('success'), t('successSave'));
    } catch {
      notify('error', t('error'), t('errorCreateLink'));
    }*/
  };

  const handleGoBack = () => {
    if (!isDataSaved) {
      notify('warning', tBack('warning'), tBack('warningContent'));
      Modal.confirm({
        title: tBack('title'),
        content: tBack('content'),
        okText: 'Ok',
        cancelText: tBack('cancelText'),
        onOk: () => {
          router.push(`/${locale}/admin/dispositivi`);
        },
      });
      return;
    }

    router.push(`/${locale}/admin/dispositivi`);
  };

  const handleSave = () => {
    form.submit();
  };

  return (
    <>
      {contextHolder}
      <DataPanel title={'New Dispositivo'} isEditing={isDataSaved} showSemaphore={true}>
        <Panel handleGoBack={handleGoBack} handleSave={handleSave} showSaveButtons={true} layoutStyle="singleTable">
          <PanelView layoutStyle="singleTable">
            <NodoForm form={form} onFinish={onFinish} setIsDataSaved={setIsDataSaved} />
          </PanelView>
        </Panel>
      </DataPanel>
    </>
  );
};

export default NewDispositivo;
