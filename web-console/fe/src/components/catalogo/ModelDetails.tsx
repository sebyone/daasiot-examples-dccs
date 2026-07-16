/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: ModelDetails.tsx
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
 * ModelDetails Component
 *
 * Questo componente visualizza i dettagli di un modello specifico, inclusi:
 * - Immagine di copertina
 * - Descrizione
 * - Documenti correlati
 * - Informazioni sul firmware
 * - Pulsanti per le azioni (ordine e caricamento firmware)
 *
 * @component
 */

import { ModelDetailsProps } from '@/types';
import { Button, Card, Divider, Typography } from 'antd';
import React from 'react';
import styles from './ModelDetails.module.css';

const { Title, Text } = Typography;

const ModelDetails = React.memo(
  ({
    model,
    isMobile,
    translations,
    onLoadFW,
    getCoverModelImage,
    getDatasheetModelDocuments,
    getFirmware,
  }: ModelDetailsProps) => {
    return (
      <Card
        title={
          <div className={styles.titleContainer} style={{ flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <span className={styles.template}>Template:</span>
            <span className={styles.modelName}>{model.name}</span>
          </div>
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            marginBottom: '20px',
            gap: isMobile ? '20px' : 0,
          }}
        >
          <div className={styles.imageSection} style={{ width: isMobile ? '100%' : '50%' }}>
            {getCoverModelImage(model) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getCoverModelImage(model)} alt={model.description || ''} className={styles.modelImage} />
            )}
          </div>
          <Button type="primary" className={styles.orderButton} style={{ width: isMobile ? '100%' : 'auto' }}>
            {translations.order}
          </Button>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '20px' : 0,
          }}
        >
          <section className={styles.descriptionSection}>
            <p>
              {translations.description} {model.description}
            </p>
            <p>
              {'Firmware:'} {getFirmware(model)}
            </p>
            {model.device_group && <p>{model.device_group.title}</p>}
          </section>

          <Divider type="vertical" className={styles.divider} />

          <section className={styles.documentsSection}>
            <Title level={5}>{translations.documents}</Title>
            <div className={styles.documentsList}>
              {getDatasheetModelDocuments(model).map((doc, index) => (
                <Text key={`datasheet-${model.id}-${index}`}>
                  <a href={doc.link} title={doc.name} target="_blank" rel="noopener noreferrer">
                    {doc.name}
                  </a>
                </Text>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.actionContainer}>
          <Button type="primary" onClick={onLoadFW} style={{ width: isMobile ? '100%' : 'auto' }}>
            {translations.loadFW}
          </Button>
        </div>
      </Card>
    );
  }
);

ModelDetails.displayName = 'ModelDetails';

export default ModelDetails;
