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
import configService from '@/services/configService';
import { ConfigFormData } from '@/types';
import { Button, Form, Modal, Tabs, TabsProps } from 'antd';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const DataPanel = dynamic(() => import('@/components/DataPanel'), { ssr: false });
const DinLocalForm = dynamic(() => import('@/components/DinLocalForm'), { ssr: false });
const Panel = dynamic(() => import('@/components/Panel'), { ssr: false });
const PanelView = dynamic(() => import('@/components/PanelView'), { ssr: false });

const Configurazione = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [isDataSaved, setIsDataSaved] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [title, setTitle] = useState('Domotica');
  const [disableTab, setDisableTab] = useState(true);
  const { notify, contextHolder } = useCustomNotification();

  const handleAddLink = () => {
    router.push(`/admin/configurazione/newLink`);
  };

  const handleAddMap = () => {
    router.push(`/admin/configurazione/newMap`);
  };

  const onFinish = async (values: ConfigFormData) => {
    try {
      await configService.update(values);
      setDisableTab(false);
      notify('success', 'Salvataggio riuscito', 'Operazione avvenuta con successo');
    } catch {
      notify('error', 'Qualcosa non ha funzionato', "Errore nell'aggiornamento del din local");
    }
  };

  useEffect(() => {
    configService
      .getDinLocal()
      .then((data) => {
        form.setFieldsValue({
          id: data.id,
          din_id: data.din_id,
          _id: data.din.id,
          title: data.title,
          sid: data.din.sid,
          din: data.din.din,
          profileR: data.din.p_res.charAt(0),
          profileE: data.din.p_res.charAt(1),
          profileS: data.din.p_res.charAt(2),
          skey: data.din.skey,
          enable: data.enable || false,
          acpt_all: data.acpt_all || false,
        });
      })
      .catch((error) => {
        console.error('Errore:', error);
      });
  }, [form]);

  const onStart = () => {
    configService
      .start()
      .then(() => {
        console.log('Nodo locale avviato.');
      })
      .catch((error) => {
        console.error('Errore:', error);
      });
  };

  const handleGoBack = () => {
    if (!isDataSaved) {
      notify('warning', 'Dati non salvati', 'Operazione non riuscita, salva prima di uscire');
      Modal.confirm({
        title: 'Sei sicuro?',
        content: 'I dati non salvati verranno persi. Vuoi continuare?',
        okText: 'Ok',
        cancelText: 'Annulla',
        onOk: () => {
          router.push('/admin/configurazione');
        },
      });
      return;
    }
    router.push('/admin/configurazione');
  };

  const handleSave = () => {
    form.submit();
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Domotica',
      children: (
        <DinLocalForm
          form={form}
          onFinish={onFinish}
          onStart={onStart}
          setIsDataSaved={setIsDataSaved}
          autoStart={autoStart}
          setAutoStart={setAutoStart}
          showEnabledCheckBox={true}
          showAcceptAllCheckBox={true}
          showPowerActions={true}
          showSaveButton={false}
          showStatus={false}
        />
      ),
    },
    {
      key: '2',
      label: 'Links',
      children: (
        <Button type="primary" onClick={handleAddLink}>
          Aggiungi link
        </Button>
      ),
      disabled: disableTab,
    },
    {
      key: '3',
      label: 'Map',
      children: (
        <Button type="primary" onClick={handleAddMap}>
          Aggiungi map
        </Button>
      ),
      disabled: disableTab,
    },
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case '1':
        setTitle('Domotica');
        break;
      case '2':
        setTitle('Links');
        break;
      case '3':
        setTitle('Map');
        break;
    }
  };

  return (
    <>
      {contextHolder}
      <DataPanel title={title} isEditing={isDataSaved} showSemaphore={true}>
        <Panel handleGoBack={handleGoBack} handleSave={handleSave} showSaveButtons={true} layoutStyle="singleTable">
          <PanelView layoutStyle="singleTable">
            <Tabs
              defaultActiveKey="1"
              items={items}
              type="card"
              onChange={handleTabChange}
              style={{ marginTop: -55, padding: 0 }}
            />
          </PanelView>
        </Panel>
      </DataPanel>
    </>
  );
};

export default Configurazione;
