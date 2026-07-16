/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: LinkTable.tsx
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import { ColumnType, LinkTableDataType } from '@/types';
import GenericTable from './generics/GenericTable';

const defaultColumns: ColumnType[] = [
  {
    title: 'Link',
    dataIndex: 'link',
    key: 'link',
  },
  {
    title: 'URI',
    dataIndex: 'url',
    key: 'url',
  },
];

class LinkTable extends GenericTable<LinkTableDataType> {
  getDefaultColumns(): ColumnType[] {
    return defaultColumns;
  }
}

export default LinkTable;
