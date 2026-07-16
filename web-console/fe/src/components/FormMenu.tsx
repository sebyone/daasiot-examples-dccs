/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: FormMenu.tsx
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import { FormMenuProps } from '@/types';
import { Button } from 'antd';

import { CheckOutlined, LeftOutlined } from '@ant-design/icons';

import { useTranslations } from 'next-intl';
import './components.css';

export default function FormMenu({
  onGoBack,
  onSave,
  onDelete,
  onEdit,
  onAdd,
  showAddButton,
  showDetailButtons,
  showSaveButton,
}: FormMenuProps) {
  const style = {
    display: 'flex',
    gap: '7px',
  };

  const t = useTranslations('FormMenu');

  const handleGoBack = () => {
    onGoBack?.();
  };

  const handleEdit = () => {
    onEdit?.();
  };

  const handleAdd = () => {
    onAdd?.();
  };

  const handleSave = () => {
    onSave?.();
  };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <div style={style}>
      {showAddButton && (
        <Button type="primary" onClick={handleAdd}>
          {t('add')}
        </Button>
      )}
      {showDetailButtons && (
        <>
          <Button type="primary" onClick={handleGoBack}>
            {t('back')}
          </Button>
          <Button type="primary" onClick={handleEdit}>
            {t('edit')}
          </Button>
          <Button type="primary" onClick={handleDelete}>
            {t('delete')}
          </Button>
        </>
      )}
      {showSaveButton && (
        <>
          <Button
            type="primary"
            style={{
              borderRadius: '100%',
            }}
            icon={<LeftOutlined />}
            onClick={handleGoBack}
          ></Button>
          <Button type="primary" style={{ borderRadius: '12px' }} icon={<CheckOutlined />} onClick={handleSave}>
            {t('save')}
          </Button>
        </>
      )}
    </div>
  );
}
