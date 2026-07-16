/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: ModalMap.tsx
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import { useCustomNotification } from '@/hooks/useNotificationHook';
import configService from '@/services/configService';
import { DinFormData, DinFormValues, ModalMapProps } from '@/types';
import { Form, Modal } from 'antd';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import MapForm from './MapForm';

const ModalMap: React.FC<ModalMapProps> = ({ isVisible, onClose, sid, onMapCreated, mode, selectedMapId }) => {
  const [form] = Form.useForm();
  const { notify, contextHolder } = useCustomNotification();
  const [isDataSaved, setIsDataSaved] = useState(true);
  const [disableSid, setDisableSid] = useState(false);
  const t = useTranslations('EditMap');

  useEffect(() => {
    form.setFieldsValue({
      sid: sid,
    });
    setDisableSid(true);
  });
  useEffect(() => {
    if (!isVisible) {
      form.resetFields();
    }
  }, [isVisible, form]);

  useEffect(() => {
    if (isVisible) {
      if (mode === 'edit' && selectedMapId) {
        configService
          .getMapById(selectedMapId)
          .then((data) => {
            const firstLink = data.cdin.links?.[0];
            form.setFieldsValue({
              id: data.cdin.id,
              sid: data.cdin.sid,
              din: data.cdin.din,
              links: firstLink?.id || null,
              address: firstLink?.url || null,
              receiver: null,
              profileR: data.cdin.p_res.charAt(0),
              profileE: data.cdin.p_res.charAt(1),
              profileS: data.cdin.p_res.charAt(2),
              skey: data.cdin.skey,
            });
          })
          .catch((error) => {
            notify('error', t('error'), t('errorGetMap'));
            console.error('Errore:', error);
          });
      } else {
        form.resetFields();
        form.setFieldsValue({ sid });
      }
    }
  }, [selectedMapId, mode, isVisible, sid]);

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const onFinish = async (values: DinFormValues) => {
    try {
      const profileR = values.profileR || '';
      const profileE = values.profileE || '';
      const profileS = values.profileS || '';
      const formattedValues: DinFormData = {
        din: {
          id: selectedMapId ?? undefined,
          sid: values.sid,
          din: values.din,
          p_res: profileR || profileE || profileS ? `${profileR}${profileE}${profileS}` : '',
          skey: values.skey || '',
          links: values.links || [],
          receiver: values.receiver || null,
        },
      };

      if (mode === 'edit' && selectedMapId) {
        await configService.updateMap(formattedValues);
        notify('success', t('success'), t('successUpdate'));
      } else {
        await configService.createMap(formattedValues);
        notify('success', t('success'), t('successCreate'));
      }

      if (onMapCreated) {
        onMapCreated(values.din);
      }
    } catch (error) {
      notify('error', t('error'), mode === 'edit' ? t('errorUpdateMap') : t('errorCreateMap'));
    }
  };

  const handleSave = () => {
    form.submit();
  };
  return (
    <Modal
      open={isVisible}
      onOk={handleSave}
      onCancel={handleCancel}
      title={mode === 'edit' ? 'Modifica Map' : 'Nuovo Map'}
      maskClosable={true}
      destroyOnClose={true}
      width={900}
      afterClose={() => form.resetFields()}
    >
      <MapForm form={form} setIsDataSaved={setIsDataSaved} onFinish={onFinish} disableSid={disableSid} />
    </Modal>
  );
};

export default ModalMap;
