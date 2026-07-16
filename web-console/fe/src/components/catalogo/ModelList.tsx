/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: ModelList.tsx
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
 * ModelList Component
 *
 * Questo componente visualizza una lista di modelli di dispositivi con supporto per:
 * - Selezione del modello corrente
 * - Stato di caricamento
 * - Paginazione
 * - Visualizzazione immagini dei modelli
 * - Responsive design
 *
 * @component
 */

import { ModelListProps } from '@/types';
import { UnorderedListOutlined } from '@ant-design/icons';
import { Card, Empty, List, Pagination, Spin } from 'antd';
import React from 'react';
import styles from './ModelList.module.css';

const ModelList = React.memo(
  ({
    deviceModels,
    isLoading,
    selectedModel,
    isSearchActive,
    pagination,
    isMobile,
    onModelSelect,
    onPaginationChange,
    translations,
    getCoverModelImage,
  }: ModelListProps) => {
    return (
      <Card title={translations.modelsGroup} className={styles.container}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spin size="large" />
          </div>
        ) : deviceModels?.data ? (
          <List
            dataSource={deviceModels.data}
            renderItem={(model) => (
              <List.Item onClick={() => onModelSelect(model)} className={styles.listItem}>
                <Card
                  hoverable
                  className={`${styles.modelCard} ${selectedModel?.id === model.id ? styles.selectedCard : ''}`}
                  size="small"
                >
                  <div className={styles.modelContent}>
                    {getCoverModelImage(model) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getCoverModelImage(model)}
                        alt={model.description || ''}
                        className={styles.modelImage}
                      />
                    )}
                    <span className={selectedModel?.id === model.id ? styles.selectedText : ''}>{model.name}</span>
                  </div>
                </Card>
              </List.Item>
            )}
            size="small"
          />
        ) : (
          <Empty
            image={<UnorderedListOutlined className={styles.emptyIcon} />}
            description={isSearchActive ? translations.noModelsAvailable : translations.selectGroupModel}
          />
        )}
        {deviceModels?.data && (
          <div className={styles.paginationWrapper} style={{ transform: 'scale(0.8)' }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              pageSizeOptions={['5', '10']}
              total={pagination.total}
              onChange={onPaginationChange}
              showSizeChanger={true}
              size="small"
              className={styles.pagination}
            />
          </div>
        )}
      </Card>
    );
  }
);

ModelList.displayName = 'ModelList';

export default ModelList;
