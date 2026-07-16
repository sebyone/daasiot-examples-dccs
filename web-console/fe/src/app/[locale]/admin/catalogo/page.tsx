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

/**
 * Componente principale del Catalogo
 *
 * Questo componente gestisce la visualizzazione del catalogo completo, integrando:
 * - Lista dei gruppi di dispositivi
 * - Lista dei modelli
 * - Dettagli del modello selezionato
 * - Ricerca e filtri
 * - Layout responsive
 *
 * @component
 */
'use client';
import DeviceGroupList from '@/components/catalogo/DeviceGroupList';
import ModelDetails from '@/components/catalogo/ModelDetails';
import ModelList from '@/components/catalogo/ModelList';
import { useDeviceGroups } from '@/hooks/useDeviceGroups';
import { useDeviceModels } from '@/hooks/useDeviceModels';
import { useModelHelpers } from '@/hooks/useModelHelpers';
import { useCustomNotification } from '@/hooks/useNotificationHook';
import { useWindowSize } from '@/hooks/useWindowSize';
import { Dev, SelectedGroup } from '@/types';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import { Col, Input, Layout, Row } from 'antd';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Catalogo.module.css';

const { Content } = Layout;

export default function Catalogo() {
  // Hooks e stati di base
  const t = useTranslations('Catalogo');
  const [selectedGroup, setSelectedGroup] = useState<SelectedGroup | null>(null);
  const [selectedModel, setSelectedModel] = useState<Dev | null>(null);
  const { notify, contextHolder } = useCustomNotification();
  const locale = useLocale();
  const router = useRouter();

  // Gestione responsive
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isLaptop, setIsLaptop] = useState(false);

  useEffect(() => {
    setIsMobile(width < 768);
    setIsTablet(width >= 768 && width < 1200);
    setIsLaptop(width >= 992 && width < 1295);
  }, [width]);

  // Custom hooks
  const { groups, groupsPagination, handleGroupsPaginationChange } = useDeviceGroups(t);
  const {
    deviceModels,
    isLoading,
    modelsPagination,
    searchTerm,
    isSearchActive,
    handleSearchChange,
    handleModelsPaginationChange,
    fetchDeviceModels,
  } = useDeviceModels(t);
  const { getCoverModelImage, getDatasheetModelDocuments, getFirmware } = useModelHelpers();

  /**
   * Gestisce la selezione di un gruppo
   * @param groupId - ID del gruppo selezionato
   * @param groupTitle - Titolo del gruppo selezionato
   */
  const handleGroupSelect = (groupId: number | null, groupTitle: string | null) => {
    setSelectedGroup(groupId === null ? null : { id: groupId, title: groupTitle });
    setSelectedModel(null);
    fetchDeviceModels(groupId, 1, modelsPagination.pageSize, searchTerm);
  };

  /**
   * Gestisce la selezione di un modello
   * @param model - Modello selezionato
   */
  const handleModelSelect = (model: Dev) => {
    setSelectedModel(model);
  };

  /**
   * Gestisce la navigazione alla pagina di caricamento firmware
   */
  const handleLoadFW = (device_model: Dev) => {
    router.push(`/${locale}/admin/catalogo/ESPtool/${device_model.id}`);
  };

  return (
    <>
      {contextHolder}
      <div className={styles.container}>
        <Layout style={{ minHeight: '85vh' }}>
          <Content style={{ padding: isMobile ? '12px' : '24px', backgroundColor: 'white' }}>
            {/* Barra di ricerca */}
            <Row gutter={isMobile ? 12 : 24}>
              <Col xs={7} sm={24} md={24} lg={24} style={{ marginBottom: isMobile ? '20px' : '20px' }}>
                <Input
                  placeholder={t('searchDevice')}
                  prefix={isLoading ? <LoadingOutlined /> : <SearchOutlined />}
                  onChange={handleSearchChange}
                  value={searchTerm}
                />
              </Col>
            </Row>

            {/* Layout principale a tre colonne */}
            <Row gutter={[24, 24]}>
              {/* Colonna gruppi */}
              <Col xs={24} sm={24} md={24} lg={10} xl={10} style={{ marginBottom: '20px' }}>
                <DeviceGroupList
                  groups={groups}
                  selectedGroup={selectedGroup}
                  pagination={groupsPagination}
                  isMobile={isMobile}
                  onGroupSelect={handleGroupSelect}
                  onPaginationChange={handleGroupsPaginationChange}
                  translations={{
                    devicesGroup: t('devicesGroup'),
                    deselectGroup: t('deselectGroup'),
                    noGroupsAvailable: t('noGroupsAvailable'),
                  }}
                  isLaptop={isLaptop}
                />
              </Col>

              {/* Colonna modelli */}
              <Col xs={24} sm={24} md={24} lg={6} xl={6} style={{ marginBottom: '20px' }}>
                <ModelList
                  deviceModels={deviceModels}
                  isLoading={isLoading}
                  selectedModel={selectedModel}
                  isSearchActive={isSearchActive}
                  pagination={modelsPagination}
                  isMobile={isMobile}
                  onModelSelect={handleModelSelect}
                  onPaginationChange={handleModelsPaginationChange}
                  translations={{
                    modelsGroup: t('modelsGroup'),
                    noModelsAvailable: t('noModelsAvailable'),
                    selectGroupModel: t('selectGroupModel'),
                  }}
                  getCoverModelImage={getCoverModelImage}
                />
              </Col>

              {/* Colonna dettagli */}
              <Col xs={24} sm={24} md={24} lg={8} xl={8} style={{ marginBottom: '20px' }}>
                {selectedModel && (
                  <ModelDetails
                    model={selectedModel}
                    isMobile={isMobile}
                    translations={{
                      order: t('order'),
                      description: t('description'),
                      documents: t('documents'),
                      loadFW: t('loadFW'),
                    }}
                    onLoadFW={() => handleLoadFW(selectedModel)}
                    getCoverModelImage={getCoverModelImage}
                    getDatasheetModelDocuments={getDatasheetModelDocuments}
                    getFirmware={getFirmware}
                  />
                )}
              </Col>
            </Row>
          </Content>
        </Layout>
      </div>
    </>
  );
}
