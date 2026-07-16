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
import FirmwareUpdaterExplanation from '@/components/FirmwareUpdaterExplanation';
import ConfigService from '@/services/configService';
import { FlashStatus, LoaderOptions, TarFile } from '@/types';
import { InfoCircleOutlined, SyncOutlined, UsbOutlined } from '@ant-design/icons';
import { Alert, Button, Descriptions, Progress, Select, Space, Typography, message } from 'antd';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { ESPLoader, Transport, type FlashOptions } from 'esptool-js';
import { useLocale, useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { SerialPort } from 'web-serial-polyfill';
import styles from './ESP.module.css';

const { Title } = Typography;
declare global {
  interface Navigator {
    serial: {
      requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
      getPorts(): Promise<SerialPort[]>;
    };
  }
  interface SerialPortRequestOptions {
    filters?: SerialPortFilter[];
  }

  interface SerialPortFilter {
    usbVendorId?: number;
    usbProductId?: number;
  }
}

const DaaSUpdater = () => {
  const t = useTranslations('DaaSUpdater');
  const router = useRouter();
  const locale = useLocale();

  const [device, setDevice] = useState<SerialPort | null>(null);
  const [transport, setTransport] = useState<Transport | null>(null);
  const [chip, setChip] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [selectedFirmware, setSelectedFirmware] = useState<string>();
  const [updateComplete, setUpdateComplete] = useState<boolean>(false);
  const [updateFailed, setUpdateFailed] = useState<boolean>(false);
  const [portInfo, setPortInfo] = useState<string>('');
  const [firmwareName, setFirmwareName] = useState<string | undefined>('');
  const [image, setImage] = useState<string | undefined>('');
  const [flashStatus, setFlashStatus] = useState<FlashStatus>('');

  const params = useParams();
  const id = Number(params.id);
  const [availableFirmware, setAvailableFirmware] = useState<string | null>(null);

  const fetchFirmwareData = async () => {
    try {
      const response = await ConfigService.getDeviceModelById(id);
      const imageResource = response.resources?.find((resource) => resource.resource_type === 4)?.link;
      const firmwareResources = response.resources?.find(
        (resource) => resource.resource_type === 5 && resource.name === 'firmware'
      )?.link;
      if (firmwareResources) {
        setFirmwareName(firmwareResources.split('/').pop());
        setAvailableFirmware(firmwareResources);
      }
      if (imageResource) {
        setImage(imageResource);
      }
    } catch (error) {
      console.error('Error fetching firmware:', error);
      message.error('Errore nel caricamento del firmware');
    }
  };

  useEffect(() => {
    if (id) {
      fetchFirmwareData();
    }
  }, [id]);

  useEffect(() => {
    const loadPolyfill = async (): Promise<void> => {
      if (!navigator.serial && navigator.usb) {
        const serialPolyfill = await import('web-serial-polyfill');
        navigator.serial = serialPolyfill as any;
      }
    };
    loadPolyfill();
  }, []);

  const connectDevice = async () => {
    try {
      const port = await navigator.serial.requestPort({});
      const newTransport = new Transport(port, true);
      setDevice(port);
      setTransport(newTransport);

      setPortInfo(port.getInfo().usbProductId ? `USB (Product ID: ${port.getInfo().usbProductId})` : 'Serial Port');

      const flashOptions: LoaderOptions = {
        transport: newTransport,
        baudrate: 115200,
        debugLogging: false,
      };

      const esploader = new ESPLoader(flashOptions);
      const detectedChip = await esploader.main();
      setChip(detectedChip);
      setIsConnected(true);
      setUpdateFailed(false);
    } catch (e: any) {
      console.error(e);
      message.error(`Error: ${e.message}`);
    }
  };

  const disconnectDevice = async () => {
    if (transport) {
      await transport.disconnect();
    }
    setDevice(null);
    setTransport(null);
    setChip(null);
    setIsConnected(false);
    message.info('Dispositivo disconnesso');
  };

  const uploadFirmware = async () => {
    if (!selectedFirmware) {
      message.warning('Seleziona firmware');
      return;
    }

    try {
      // Gestione disconnessione precedente
      if (transport) {
        await transport.disconnect();
        setTransport(null);
        setDevice(null);
        setIsConnected(false);
      }

      setFlashStatus('downloading');
      const response = await axios.get(selectedFirmware, {
        responseType: 'blob',
      });

      const firmwareData = new Blob([response.data], { type: 'application/octet-stream' });
      const arrayBuffer = await firmwareData.arrayBuffer();

      setFlashStatus('extracting');
      const files = untar(arrayBuffer);

      if (files.length !== 3) {
        throw new Error(`File mancanti o non validi!`);
      }

      // Richiedi una nuova porta seriale
      setFlashStatus('connecting');
      let activeTransport = transport;
      if (!device) {
        const port = await navigator.serial.requestPort({});
        setDevice(port);
        const newTransport = new Transport(port);
        setTransport(newTransport);
        activeTransport = newTransport;
      }
      if (!activeTransport) throw new Error('Trasporto seriale non disponibile.');

      const esploader = new ESPLoader({
        transport: activeTransport,
        baudrate: 115200,
        debugLogging: false,
      });

      // Inizializzazione ESP
      await esploader.main();
      setIsConnected(true);

      // Prepara i file per il flash
      const flashFiles = files.map((file) => ({
        data: Uint8Array.from(file.data, (character) => character.charCodeAt(0)),
        address: file.offset,
      }));

      // Flash di tutti i file in una volta
      const flashOptions: FlashOptions = {
        fileArray: flashFiles,
        flashSize: '4MB',
        flashMode: 'dio',
        flashFreq: '40m',
        eraseAll: true,
        compress: true,
        reportProgress: (fileIndex: number, written: number, total: number) => {
          const progress = (fileIndex * 100) / files.length + (written / total) * (100 / files.length);
          setProgress(Math.round(progress));
        },
        calculateMD5Hash: (image: Uint8Array) => CryptoJS.MD5(CryptoJS.lib.WordArray.create(image)).toString(),
      };

      setFlashStatus('flashing');
      await esploader.writeFlash(flashOptions);

      setUpdateComplete(true);
    } catch (e: any) {
      console.error('Errore durante il flash:', e);
      message.error(`Errore nell'aggiornamento del firmware: ${e.message}`);
      setUpdateFailed(true);
      // Cleanup in caso di errore
      if (transport) {
        try {
          await transport.disconnect();
          setTransport(null);
          setDevice(null);
          setIsConnected(false);
        } catch (disconnectError) {
          console.error('Errore durante la disconnessione:', disconnectError);
        }
      }
    } finally {
      setProgress(0);
      setFlashStatus('');
    }
  };

  useEffect(() => {
    return () => {
      if (transport) {
        transport.disconnect().catch(console.error);
      }
    };
  }, [transport]);

  const untar = (arrayBuffer: ArrayBuffer): TarFile[] => {
    const TAR_BLOCK_SIZE = 512;
    let offset = 0;
    const files: TarFile[] = [];

    // Mappa per gli offset standard
    const fileOffsets: Record<string, number> = {
      'bootloader.bin': 0x1000,
      'partitions.bin': 0x8000,
      'firmware.bin': 0x10000,
    };

    while (offset < arrayBuffer.byteLength) {
      const nameBuffer = arrayBuffer.slice(offset, offset + 100);
      const name = new TextDecoder().decode(nameBuffer).replace(/\0/g, '');
      if (!name) break;

      const sizeBuffer = arrayBuffer.slice(offset + 124, offset + 136);
      const size = parseInt(new TextDecoder().decode(sizeBuffer).trim(), 8);
      if (size === 0) break;

      const content = arrayBuffer.slice(offset + TAR_BLOCK_SIZE, offset + TAR_BLOCK_SIZE + size);

      // Filtra solo i file principali
      if (!name.startsWith('PaxHeader/') && !name.startsWith('._') && !name.startsWith('_')) {
        const baseName = name.split('/').pop(); // Rimuove eventuali percorsi
        if (baseName && fileOffsets[baseName] !== undefined) {
          files.push({
            name: baseName,
            data: arrayBufferToBinaryString(content),
            size: size,
            offset: fileOffsets[baseName],
          });
        }
      }

      offset += TAR_BLOCK_SIZE + size;
      if (size % TAR_BLOCK_SIZE !== 0) {
        offset += TAR_BLOCK_SIZE - (size % TAR_BLOCK_SIZE);
      }
    }

    // Ordina i file per offset
    return files.sort((a, b) => a.offset - b.offset);
  };

  const getStatusMessage = () => {
    switch (flashStatus) {
      case 'downloading':
        return t('flashStatus.downloading');
      case 'validating':
        return t('flashStatus.validating');
      case 'flashing':
        return t('flashStatus.flashing');
      default:
        return '';
    }
  };

  const arrayBufferToBinaryString = (arrayBuffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(arrayBuffer);
    let binaryString = '';
    for (let i = 0; i < bytes.length; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    return binaryString;
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <Title
          level={2}
          style={{
            background: 'linear-gradient(to right, #0077e6, #003366, #001529)',
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: 'bold',
          }}
        >
          {t('titleESP32')}
        </Title>
      </div>

      <div>
        {/* Control Panel */}

        <div className={styles.controlPanel}>
          {!isConnected && !flashStatus && !progress && (
            <>
              <FirmwareUpdaterExplanation ota={false} />
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                <Button icon={<UsbOutlined />} onClick={isConnected ? disconnectDevice : connectDevice} type="primary">
                  {isConnected ? 'Disconnetti dispositivo' : t('start')}
                </Button>
              </div>
            </>
          )}

          {isConnected && !updateComplete && (
            <Space direction="vertical">
              <Descriptions column={1} size="small" bordered style={{ maxWidth: '100%' }}>
                <Descriptions.Item
                  label={
                    <>
                      <UsbOutlined /> {t('port')}
                    </>
                  }
                  labelStyle={{ fontWeight: 'bold', width: '150px' }}
                >
                  {portInfo}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <InfoCircleOutlined /> {t('device')}
                    </>
                  }
                  labelStyle={{ fontWeight: 'bold', width: '150px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span>{chip || 'Unknown'}</span>
                    {image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        style={{
                          width: '120px',
                          height: 'auto',
                          objectFit: 'contain',
                        }}
                        alt="Device"
                      />
                    )}
                  </div>
                </Descriptions.Item>
              </Descriptions>

              <div className={styles.selectGroup}>
                <Select
                  style={{ flex: 1, marginBottom: 10 }}
                  placeholder={!availableFirmware ? t('noFirmwareAvailable') : t('availableFirmware')}
                  onChange={(value) => setSelectedFirmware(value)}
                  value={selectedFirmware}
                  disabled={!availableFirmware || progress > 0}
                >
                  {availableFirmware && <Select.Option value={availableFirmware}>{firmwareName}</Select.Option>}
                </Select>
                {!flashStatus && !progress && (
                  <Button onClick={uploadFirmware} type="primary" icon={<SyncOutlined />} style={{ flex: 1 }}>
                    {t('startUpdate')}
                  </Button>
                )}
              </div>
            </Space>
          )}
        </div>

        <div className={styles.terminal}>
          {flashStatus && (
            <Alert message={getStatusMessage()} type="warning" showIcon style={{ marginBottom: '1rem' }} />
          )}

          {progress > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <Progress percent={Math.round(progress)} />
            </div>
          )}

          {updateComplete && (
            <Alert
              message={t('alertUpdateComplete.message')}
              description={t('alertUpdateComplete.description')}
              type="success"
              showIcon
              style={{ marginTop: '1rem' }}
            />
          )}
          {updateFailed && (
            <Alert
              message={t('alertUpdateFailed.message')}
              description={t('alertUpdateFailed.description')}
              type="error"
              showIcon
              style={{ marginTop: '1rem' }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DaaSUpdater;
