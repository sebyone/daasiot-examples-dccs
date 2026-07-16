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
import IPAddressIcon from '@/components/IPAddressIcon';
import LTEIcon from '@/components/LTEIcon';
import ModalMap from '@/components/ModalMap';
import { useCustomNotification } from '@/hooks/useNotificationHook';
import { default as ConfigService, default as configService } from '@/services/configService';
import {
  ConfigFormData,
  LinkDataType,
  LinkTableDataType,
  MapDataType,
  MapTableDataType,
  StatusDataType,
} from '@/types';
import { Form, Modal, Tabs, TabsProps } from 'antd';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect, useState } from 'react';

const DataPanel = dynamic(() => import('@/components/DataPanel'), { ssr: false });
const DinLocalForm = dynamic(() => import('@/components/DinLocalForm'), { ssr: false });
const Panel = dynamic(() => import('@/components/Panel'), { ssr: false });
const PanelView = dynamic(() => import('@/components/PanelView'), { ssr: false });
const LinkTable = dynamic(() => import('@/components/LinkTable'), { ssr: false });
const MapTable = dynamic(() => import('@/components/MapTable'), { ssr: false });
const ModalDispositivo = dynamic(() => import('@/components/ModalDispositivo'), { ssr: false });

const EditDinLocal = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [isDataSaved, setIsDataSaved] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [title, setTitle] = useState('');
  const [dinLocal, setDinLocal] = useState<string>();
  const [SID, setSID] = useState<string>('');
  const { notify, contextHolder } = useCustomNotification();
  const [linksData, setLinksData] = useState<LinkTableDataType[]>([]);
  const [mapsData, setMapsData] = useState<MapTableDataType[]>([]);
  const [statusData, setStatusData] = useState<StatusDataType | null>(null);
  const [status, setStatus] = useState(false);
  const [value, setValue] = useState<number | number[]>(0);
  const [ws, setSocket] = useState<WebSocket | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMap, setSelectedMap] = useState<MapTableDataType | null>(null);
  const t = useTranslations('EditDinLocal');
  const tBack = useTranslations('handleGoBack');
  const locale = useLocale();

  const handleOpenModal = (data: MapTableDataType) => {
    setSelectedMap(data);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedMap(null);
  };

  const handleEditLink = (data: LinkTableDataType) => {
    router.push(`/${locale}/admin/configurazione/editLink/${data.id}`);
  };

  const getIconForLinks = (tipologia: number): ReactNode => {
    switch (tipologia) {
      case 2:
        return <IPAddressIcon />;
      case 4:
        return <LTEIcon />;
    }
  };

  const fetchLinks = async () => {
    try {
      await ConfigService.getLinks().then((data) => {
        const links = data.map((link) => {
          const icon = getIconForLinks(link.link);
          return {
            id: link.id,
            link: <>{icon}</>,
            url: link.url,
            source: link,
          };
        });
        setLinksData(links);
      });
    } catch {
      notify('error', t('error'), t('errorGetLinks'));
    }
  };

  const fetchMaps = async () => {
    try {
      await ConfigService.getMaps().then((data) => {
        const maps = data.map((map) => ({
          id: map.cdin.id,
          din: map.cdin.din,
          tech: map.cdin.links?.[0]?.link ?? '-',
          source: map,
        }));
        setMapsData(maps);
      });
    } catch (error) {
      notify('error', t('error'), t('errorGetLinksMap'));
    }
  };

  const fetchStatus = async () => {
    try {
      const data = await ConfigService.getStatus();
      setStatusData(data);
    } catch (error) {
      notify('error', t('error'), t('errorGetStatus'));
      console.error('Errore nel caricamento dello stato:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAddLink = () => {
    router.push(`/${locale}/admin/configurazione/newLink`);
  };

  const [isAddMapModalVisible, setIsAddMapModalVisible] = useState(false);

  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [selectedMapId, setSelectedMapId] = useState<number | null>(null);

  const handleEditMap = (data: MapTableDataType) => {
    setSelectedMapId(data.id ?? null);
    setEditMode('edit');
    setIsAddMapModalVisible(true);
  };

  const handleAddMap = () => {
    setSelectedMapId(null);
    setEditMode('create');
    setIsAddMapModalVisible(true);
  };

  const handleCloseAddMapModal = () => {
    setIsAddMapModalVisible(false);
    setSelectedMapId(null);
    setEditMode('create');
  };

  const handleMapCreated = async (din: string) => {
    try {
      await fetchMaps();
      setIsAddMapModalVisible(false);
      notify('success', t('success'), t('successCreateMap'));
    } catch (error) {
      notify('error', t('error'), t('errorGetLinksMap'));
    }
  };

  const onFinish = async (values: ConfigFormData) => {
    try {
      await configService.update(values);

      notify('success', t('success'), t('succesSave'));
    } catch {
      notify('error', t('error'), t('errorUpdateDinLocal'));
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
        setDinLocal(data.title);
        setSID(data.din.sid);
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
      Modal.confirm({
        title: tBack('title'),
        content: tBack('content'),
        okText: 'Ok',
        cancelText: tBack('cancelText'),
        onOk: () => {
          router.push(`/${locale}/admin/configurazione`);
        },
      });
      return;
    }
    router.push(`/${locale}/admin/configurazione`);
  };

  const handleSave = () => {
    form.submit();
  };

  const handleDeleteLink = async (link: LinkDataType) => {
    if (!link?.id) return;
    try {
      await ConfigService.deleteLink(link.id);
      fetchLinks();
      notify('success', t('success'), t('successDeleteLink'));
    } catch (error) {
      notify('error', t('error'), t('errorDeleteLink'));
      console.error("Errore nell'eliminazione del link:", error);
    }
  };

  const handleDeleteMap = async (map: MapTableDataType) => {
    if (!map?.id) return;
    try {
      await ConfigService.deleteMap(map.id);
      fetchMaps();
      notify('success', t('success'), t('successDeleteMap'));
    } catch (error) {
      notify('error', t('error'), t('errorDeleteMap'));
      console.error("Errore nell'eliminazione del map:", error);
    }
  };

  useEffect(() => {
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_API_BASE_URL}`);

    socket.onmessage = (event) => {
      console.log('Ricevuto messaggio', event.data);
      const data = JSON.parse(event.data);

      if (data.event === 'ddo') {
        setStatus(data.status);
        setValue(data.value);
      }
    };

    socket.onopen = () => {
      console.log('Connesso al server');
    };

    socket.onclose = () => {
      console.log('Disconnesso dal server');
    };

    setSocket(socket);

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  const onChangeComplete = (value: number | number[]) => {
    setValue(value);
  };

  const onChange = (status: boolean) => {
    setStatus(status);
  };

  const onSend = async () => {
    try {
      if (selectedMap) {
        await configService.sendPayload(Number(selectedMap.din), status, value);
        notify('success', t('success'), t('successSend'));
      }
    } catch (error) {
      notify('error', t('error'), t('errorSend'));
      console.error("Errore nell'invio dei dati:", error);
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: 'Node',
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
          showPowerActionsProcessor={true}
          showSaveButton={false}
          showStatus={true}
          statusData={statusData}
        />
      ),
    },
    {
      key: '2',
      label: 'Links',
      children: (
        <LinkTable
          items={linksData}
          handleClick={handleAddLink}
          showButton={true}
          rowKey="id"
          route={router}
          confirm={handleDeleteLink}
          onRowClick={handleEditLink}
          onEditClick={handleEditLink}
        />
      ),
    },
    {
      key: '3',
      label: 'Map',
      children: (
        <>
          <MapTable
            items={mapsData}
            handleClick={handleAddMap}
            showButton={true}
            rowKey="din"
            route={router}
            confirm={handleDeleteMap}
            onRowClick={handleEditMap}
            onEditClick={handleEditMap}
            onOpenModal={handleOpenModal}
            showOpenModal={true}
          />
          {selectedMap && (
            <ModalDispositivo
              isVisible={isModalVisible}
              onClose={handleCloseModal}
              data={selectedMap}
              status={status}
              setStatus={setStatus}
              onChangeComplete={onChangeComplete}
              onChange={onChange}
              onSend={onSend}
            />
          )}
          <ModalMap
            isVisible={isAddMapModalVisible}
            onClose={handleCloseAddMapModal}
            sid={SID}
            onMapCreated={handleMapCreated}
            selectedMapId={selectedMapId}
            mode={editMode}
          />
        </>
      ),
    },
  ];

  const handleTabChange = (key: string) => {
    switch (key) {
      case '1':
        break;
      case '2':
        setTitle('Links');
        fetchLinks();
        break;
      case '3':
        setTitle('Map');
        fetchMaps();
        break;
    }
  };

  return (
    <>
      {contextHolder}
      <div style={{ marginTop: -35 }}>
        <DataPanel title={dinLocal} isEditing={isDataSaved} showSemaphore={true}>
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
      </div>
    </>
  );
};

export default EditDinLocal;
