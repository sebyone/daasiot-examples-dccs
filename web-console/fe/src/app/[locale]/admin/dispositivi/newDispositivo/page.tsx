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
import { ConfigData, CreateDevice, DataDevice, Dev, Device, DinDataType } from '@/types';
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
  const [dinValue, setDinValue] = useState<string>('');
  const [dins, setDins] = useState<DinDataType[]>([]);
  const [din, setDin] = useState<number>();

  const fetchDins = async () => {
    try {
      const dinsData = await ConfigService.getDin();
      setDins(dinsData);
    } catch (error) {
      console.error('Error fetching DINs:', error);
    }
  };

  const handleMapCreated = async (din: string) => {
    setDinValue(din);
    form.setFieldValue('din', din);
    await fetchDins();
    setOpenModal(false);
    notify('success', 'Successo', 'Map creato con successo');
  };

  const handleDinChange = (value: number) => {
    setDin(value);
  };

  const onFinish = async (values: CreateDevice) => {
    await fetchDins();

    const d = dins.find((din) => din.din === dinValue);
    console.log(d);
    try {
      const formattedValues = {
        device_model_id: values.modello,
        din_id: d?.id || din,
        din: din,
        serial: values.serial,
        name: values.denominazione,
        latitude: '39.256',
        longitude: '39.256',
      };
      {
        /*values.latitudine ? parseFloat(values.latitudine) : null*/
      }
      {
        /*values.longitudine ? parseFloat(values.longitudine) : null*/
      }
      await ConfigService.createDevice(formattedValues);
      notify('success', 'Successo', 'Dispositivo creato con successo');
      router.push(`/${locale}/admin/dispositivi`);
    } catch (error) {
      notify('error', 'Errore', 'Errore nella creazione del dispositivo');
    }
  };

  useEffect(() => {
    fetchDins();
  }, []);

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
            name: 'Device Model Default',
            description: '',
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

  const handleGoBack = () => {
    if (!isDataSaved) {
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
    if (!selectedReceiverSid) {
      notify('warning', 'Attenzione', 'Seleziona prima un Receiver');
      return;
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSave = () => {
    form.submit();
  };

  useEffect(() => {
    const fetchDins = async () => {
      try {
        const dins = await ConfigService.getDin();
        setDins(dins);
      } catch (error) {
        console.error('Error fetching DINs:', error);
      }
    };

    fetchDins();
  }, []);

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
              dins={dins}
              onDinChange={handleDinChange}
            />
            <ModalMap
              isVisible={openModal}
              onClose={handleCloseModal}
              sid={selectedReceiverSid}
              onMapCreated={handleMapCreated}
            />
          </PanelView>
        </Panel>
      </DataPanel>
    </>
  );
};

export default NewDispositivo;
