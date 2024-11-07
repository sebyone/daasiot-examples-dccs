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
import ModalMap from '@/components/ModalMap';
import { useCustomNotification } from '@/hooks/useNotificationHook';
import ConfigService from '@/services/configService';
import { ConfigData, CreateDevice, DataDevice, Dev, Device } from '@/types';
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
  //const t = useTranslations('NewDispositivo');
  const tBack = useTranslations('handleGoBack');
  const locale = useLocale();
  const [, updateState] = useState<object>();
  const [deviceModels, setDeviceModels] = useState<Dev[]>([]);
  const [receiversData, setReceiversData] = useState<ConfigData[]>([]);
  const [selectedReceiverSid, setSelectedReceiverSid] = useState<string>('');
  const [selectedReceiver, setSelectedReceiver] = useState<ConfigData>();
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    updateState({});
  }, [locale]);

  useEffect(() => {
    const fetchDeviceModels = async () => {
      try {
        const response = await ConfigService.getDeviceModel(0, 100);
        setDeviceModels([
          {
            id: 0,
            device_group_id: 0,
            description: 'Device Model Default',
            serial: '',
          },
          ...response.data,
        ]);
      } catch (err) {
        console.error('Errore nel caricamento dei modelli:', err);
      }
    };
    fetchDeviceModels();
  }, []);

  useEffect(() => {
    const fetchReceivers = async () => {
      try {
        const data = await ConfigService.getReceivers();

        setReceiversData(data);
      } catch (error) {}
    };
    fetchReceivers();
  }, []);

  const handleReceiverChange = (receiverId: number) => {
    const selectedReceiver = receiversData.find((receiver) => receiver.id === receiverId);
    setSelectedReceiver(selectedReceiver);
    if (selectedReceiver?.din?.sid) {
      setSelectedReceiverSid(selectedReceiver.din.sid);
      form.setFieldsValue({ sid: selectedReceiver.din.sid });
    } else {
      setSelectedReceiverSid('');
      form.setFieldsValue({ sid: '' });
    }
  };

  const onFinish = async (values: CreateDevice) => {
    console.log(values);
    try {
      const formattedValues = {
        device_model_id: values.modello,
        din_id: selectedReceiver?.din?.id,
        name: values.denominazione,
        latitude: values.latitudine ? parseFloat(values.latitudine) : null,
        longitude: values.longitudine ? parseFloat(values.longitudine) : null,
      };
      await ConfigService.createDevice(formattedValues);
    } catch {}
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

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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
            <NodoForm
              form={form}
              onFinish={onFinish}
              setIsDataSaved={setIsDataSaved}
              deviceModels={deviceModels}
              receiversData={receiversData}
              selectedReceiverSid={selectedReceiverSid}
              onReceiverChange={handleReceiverChange}
              onOpenModal={handleOpenModal}
            />
            <ModalMap isVisible={openModal} onClose={handleCloseModal} sid={selectedReceiverSid} />
          </PanelView>
        </Panel>
      </DataPanel>
    </>
  );
};

export default NewDispositivo;
