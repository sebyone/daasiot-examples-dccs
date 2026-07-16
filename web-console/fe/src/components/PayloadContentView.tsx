/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: PayloadContentView.tsx
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import { Checkbox, Input } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import React, { useEffect, useState } from 'react';

const PayloadContentView = ({ payloadContent }: { payloadContent: string }) => {
  const [payloadFormat, setPayloadFormat] = useState('BASE64');
  const [convertedContent, setConvertedContent] = useState('');

  const convertPayload = (format: string) => {
    const content = payloadContent || '';

    switch (format) {
      case 'ASCII':
        setConvertedContent(atob(content));
        break;
      case 'Binary':
        setConvertedContent(
          atob(content)
            .split('')
            .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
            .join(' ')
        );
        break;
      case 'HEX':
        setConvertedContent(
          atob(content)
            .split('')
            .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
            .join(' ')
        );
        break;
      case 'BASE64':
        setConvertedContent(content);
        break;
      default:
        setConvertedContent(content);
    }
  };

  const handleCheckboxChange = (e: CheckboxChangeEvent) => {
    const selectedFormat = e.target.value;
    setPayloadFormat(selectedFormat);
    convertPayload(selectedFormat);
  };

  useEffect(() => {
    convertPayload(payloadFormat);
  }, [payloadContent, payloadFormat]);

  return (
    <>
      <div style={{ marginBottom: '10px' }}>
        <Checkbox value="ASCII" checked={payloadFormat === 'ASCII'} onChange={handleCheckboxChange}>
          ASCII
        </Checkbox>
        <Checkbox value="Binary" checked={payloadFormat === 'Binary'} onChange={handleCheckboxChange}>
          Binary
        </Checkbox>
        <Checkbox value="HEX" checked={payloadFormat === 'HEX'} onChange={handleCheckboxChange}>
          HEX
        </Checkbox>
        <Checkbox value="BASE64" checked={payloadFormat === 'BASE64'} onChange={handleCheckboxChange}>
          BASE64
        </Checkbox>
      </div>
      <Input.TextArea
        value={convertedContent}
        rows={5}
        readOnly
        style={{ width: '100%', resize: 'none', border: '2px solid black', borderRadius: '10px', cursor: 'default' }}
      />
    </>
  );
};

export default PayloadContentView;
