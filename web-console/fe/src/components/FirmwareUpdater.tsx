'use client';

import { InfoCircleOutlined, SyncOutlined, UploadOutlined, UsbOutlined } from '@ant-design/icons';
import { Alert, Button, Descriptions, Progress, Space, Typography, Upload, message } from 'antd';
import { ESPLoader, Transport } from 'esptool-js';
import { useState } from 'react';
import { serial as serialPolyfill } from 'web-serial-polyfill';

const FLASH_OFFSETS = [0x10000, 0x8000, 0x1000];
const TAR_BLOCK_SIZE = 512;

type FlashFile = {
  data: Uint8Array;
  address: number;
};

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function extractTarFiles(buffer: ArrayBuffer): FlashFile[] {
  const files: FlashFile[] = [];
  let offset = 0;
  let index = 0;

  while (offset < buffer.byteLength && index < FLASH_OFFSETS.length) {
    const name = new TextDecoder().decode(buffer.slice(offset, offset + 100)).replace(/\0/g, '');
    if (!name) break;

    const sizeText = new TextDecoder().decode(buffer.slice(offset + 124, offset + 136)).trim();
    const size = Number.parseInt(sizeText, 8);
    if (!Number.isFinite(size) || size < 0) {
      throw new Error(`Archivio firmware non valido: dimensione errata per ${name}.`);
    }

    const content = buffer.slice(offset + TAR_BLOCK_SIZE, offset + TAR_BLOCK_SIZE + size);
    files.push({ data: new Uint8Array(content), address: FLASH_OFFSETS[index] });
    index += 1;

    offset += TAR_BLOCK_SIZE + size;
    if (size % TAR_BLOCK_SIZE !== 0) {
      offset += TAR_BLOCK_SIZE - (size % TAR_BLOCK_SIZE);
    }
  }

  if (files.length === 0) {
    throw new Error('L’archivio firmware non contiene immagini flashabili.');
  }

  return files;
}

export default function FirmwareUpdater() {
  const [transport, setTransport] = useState<Transport | null>(null);
  const [chip, setChip] = useState<string | null>(null);
  const [firmware, setFirmware] = useState<File | null>(null);
  const [portInfo, setPortInfo] = useState('');
  const [progress, setProgress] = useState(0);
  const [updateComplete, setUpdateComplete] = useState(false);

  const connect = async () => {
    try {
      const serialApi =
        (navigator as Navigator & { serial?: typeof serialPolyfill }).serial ?? serialPolyfill;
      const port = await serialApi.requestPort({});
      const nextTransport = new Transport(port, true);
      const loader = new ESPLoader({ transport: nextTransport, baudrate: 115200 });
      const detectedChip = await loader.main();

      setTransport(nextTransport);
      setChip(detectedChip);
      setPortInfo(nextTransport.getInfo());
      setUpdateComplete(false);
      message.success(`Connesso al dispositivo: ${detectedChip}`);
    } catch (error) {
      message.error(toError(error).message);
    }
  };

  const disconnect = async () => {
    try {
      await transport?.disconnect();
    } finally {
      setTransport(null);
      setChip(null);
      setPortInfo('');
      setProgress(0);
    }
  };

  const flash = async () => {
    if (!transport || !firmware) {
      message.warning('Connetti il dispositivo e seleziona un archivio firmware TAR.');
      return;
    }

    try {
      setUpdateComplete(false);
      const fileArray = extractTarFiles(await firmware.arrayBuffer());
      const loader = new ESPLoader({ transport, baudrate: 115200 });

      await loader.writeFlash({
        fileArray,
        flashMode: 'keep',
        flashFreq: 'keep',
        flashSize: 'keep',
        eraseAll: false,
        compress: true,
        reportProgress: (fileIndex, written, total) => {
          const completedFiles = fileIndex / fileArray.length;
          const currentFile = total > 0 ? written / total / fileArray.length : 0;
          setProgress(Math.min(100, Math.round((completedFiles + currentFile) * 100)));
        },
      });

      setProgress(100);
      setUpdateComplete(true);
      message.success('Firmware aggiornato correttamente.');
    } catch (error) {
      message.error(`Aggiornamento fallito: ${toError(error).message}`);
      setProgress(0);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <Typography.Title level={2}>ESP32 firmware updater</Typography.Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Button icon={<UsbOutlined />} onClick={transport ? disconnect : connect} type="primary">
          {transport ? 'Disconnetti dispositivo' : 'Connetti dispositivo'}
        </Button>

        {transport ? (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={<><UsbOutlined /> Porta</>}>{portInfo || 'Seriale'}</Descriptions.Item>
              <Descriptions.Item label={<><InfoCircleOutlined /> Dispositivo</>}>{chip}</Descriptions.Item>
            </Descriptions>

            <Space wrap>
              <Upload
                accept=".tar"
                maxCount={1}
                beforeUpload={(file) => {
                  setFirmware(file);
                  setUpdateComplete(false);
                  return false;
                }}
                onRemove={() => {
                  setFirmware(null);
                  return true;
                }}
              >
                <Button icon={<UploadOutlined />}>Seleziona firmware TAR</Button>
              </Upload>
              <Button type="primary" icon={<SyncOutlined />} onClick={flash} disabled={!firmware}>
                Avvia aggiornamento
              </Button>
            </Space>
          </>
        ) : null}

        {progress > 0 ? <Progress percent={progress} /> : null}
        {updateComplete ? (
          <Alert
            type="success"
            showIcon
            message="Aggiornamento completato"
            description="Scollega il dispositivo e riavvialo."
          />
        ) : null}
      </Space>
    </div>
  );
}
