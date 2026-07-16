/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: index.ts
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import { DeviceComponentsRegistry } from '@/utils/deviceComponentsRegistry';
import { FormInstance } from 'antd';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import React from 'react';

export type TableDataType =
  | LinkDataType
  | LinkTableDataType
  | MapDataType
  | MapTableDataType
  | DinLocalDataType
  | StatusDataType;

export interface DinLocalDataType {
  id?: number;
  title: string;
  sid: string | number;
  din: string | number;
  acpt_all: string;
  links: string;
  status: string;
}

export interface ReceiverDataType {
  id: number;
  title: string;
  din_id: number;
  acpt_all: boolean;
  enable: boolean;
  din: DinDataType;
  links: LinkDataType[];
}
export interface ActionsButtonProps {
  data: any;
  onEdit: (data: any) => void;

  onDelete: (data: any) => void;
  onOpenModal?: (data: any) => void;
  showOpenModal?: boolean;
}

export interface ColumnType<T = any> {
  title: string;
  dataIndex: string;
  key: string;
  render?: (value: any, record: T) => React.ReactNode;
  width?: number;
}

export interface GenericTableProps<T> {
  items: T[];
  columns?: ColumnType[];
  excludeColumns?: string[];
  handleClick?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  showButton: boolean;
  rowKey: string;
  route?: AppRouterInstance;
  searchText?: string;
  handleSearchChange?: (value: string) => void;
  handleEventSearchChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  confirm: (data: any) => void;
  onRowClick: (data: T) => void;
  onEditClick: (data: any) => void;
  onOpenModal?: (data: T) => void;
  showOpenModal?: boolean;
}

export interface FormMenuProps {
  onSave?: () => void;
  onEdit?: () => void;
  onGoBack?: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
  showAddButton?: boolean;
  showDetailButtons?: boolean;
  showSaveButton?: boolean;
}

export interface PanelViewProps {
  children: React.ReactNode;
  layoutStyle?: 'default' | 'singleTable' | 'formAndTable' | 'devices';
}

export interface DataPanelProps {
  title: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  isEditing?: boolean;
  showSemaphore?: boolean;
  showLinkStatus?: boolean;
  showAlignmentStatus?: boolean;
}

export interface PanelProps {
  showAddButton?: boolean;
  showDetailButtons?: boolean;
  showSaveButtons?: boolean;
  handleAdd?: () => void;
  handleDelete?: () => void;
  handleGoBack?: () => void;
  handleEdit?: () => void;
  handleSave?: () => void;
  children: React.ReactNode;
  layoutStyle?: 'default' | 'singleTable' | 'formAndTable' | 'devices';
  form?: FormInstance;
}

export interface FormSemaphoreProps {
  isDataSaved?: boolean;
}

export interface PanelListProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  layoutStyle?: 'default' | 'singleTable' | 'formAndTable';
}

export interface DinLocalFormProps {
  form: FormInstance;
  onFinish?: (values: ConfigFormData) => void;
  onStart?: () => void;
  setIsDataSaved: (status: boolean) => void;
  autoStart?: boolean;
  setAutoStart?: (checked: boolean) => void;
  showEnabledCheckBox: boolean;
  showAcceptAllCheckBox: boolean;
  showPowerActions: boolean;
  showSaveButton: boolean;
  showStatus: boolean;
  statusData?: StatusDataType | null;
}
export interface ConfigFormData {
  id: number;
  title: string;
  din_id: string;
  acpt_all: boolean;
  enable: boolean;
  sid: string;
  din: string;
  profileR: string;
  profileE: string;
  profileS: string;
  skey: string;
  links: LinkDataType[];
  maps: MapDataType[];
}

export interface ConfigData {
  id: number;
  title: string;
  din_id: string;
  acpt_all: boolean;
  enable: boolean;
  din: {
    id: string;
    sid: string;
    din: string;
    p_res: string;
    skey: string;
  };
}

export interface LinkFormProps {
  form: FormInstance;
  onFinish: (values: LinkDataType) => void;
  setIsDataSaved: (status: boolean) => void;
  networkTech: number | null;
  setNetworkTech: (tech: number) => void;
}

export interface MapFormProps {
  form: FormInstance;
  onFinish: (values: DinFormValues) => void;
  setIsDataSaved: (status: boolean) => void;
}

export interface LinkDataType {
  id?: number;
  link: number;
  din_id_din?: number;
  url: string;
  ipAddress?: string;
  port?: string;
}

export interface LinkFormData {
  id: number;
  link: string;
  uri: string;
}

export interface StatusDataType {
  lasttime: number;
  hwver: number;
  linked: number;
  sync: number;
  lock: number;
  sklen?: number;
  skey?: string;
  form?: number;
  codec?: number;
}

export interface DinDataType {
  id?: number;
  sid: string;
  din: string;
  p_res: string;
  skey: string;
}
export interface DinFormData {
  din: DinDataType;
  link?: Omit<Link, 'din_id'>;
}

export interface LinkTableDataType extends Omit<LinkDataType, 'link'> {
  link: React.ReactNode;
  source: LinkDataType;
}

export interface DinFormValues {
  id?: number;
  sid: string;
  din: string;
  profileR?: string;
  profileE?: string;
  profileS?: string;
  skey?: string;
  links?: number;
  address?: string;
  receiver?: number | null;
}

export interface Link {
  id: number;
  link: number;
  din_id: number;
  url: string;
}

export interface MapDataType {
  pdin_id?: number;
  cdin_id?: number;
  cdin: DinDataType & {
    links: Link[];
    receiver: ReceiverDataType | null;
  };
}

export interface MapTableDataType {
  id?: number;
  din: string;
  tech: React.ReactNode;
  source: MapDataType;
}

export interface CardDispositivoProps {
  status: boolean;
  setStatus: (enabled: boolean) => void;
  onChangeComplete: (value: number | number[]) => void;
  onChange: (status: boolean) => void;
  onSend: () => void;
}

export interface ModalDispositivoProps {
  isVisible: boolean;
  onClose: () => void;
  data: MapTableDataType;
  status: boolean;
  setStatus: (enabled: boolean) => void;
  onChangeComplete: (value: number | number[]) => void;
  onChange: (status: boolean) => void;
  onSend: () => void;
}

export interface FormDataDevice {
  name: string;
  din: {
    sid: string;
    din: string;
  };
  latitude: number;
  longitude: number;
}

export interface DataDevice {
  id: number;
  device_model_id: number;
  din_id: number;
  name: string;
  latitude: number;
  longitude: number;
  device_model: {
    id: number;
    device_group_id: number;
    description: string;
    serial: string;
    link_image: string;
    link_datasheet: string;
    link_userguide: string;
  };
  din: {
    id?: number;
    sid: string;
    din: string;
    p_res: string;
    skey: string;
  };
}

export interface Device {
  data: DataDevice[];
  pagination: Pagination;
}

export interface NodoFormProps {
  form: FormInstance;
  onFinish: (values: DataDevice) => void;
  setIsDataSaved: (status: boolean) => void;
}

export interface BaseCardDispositivoProps {
  deviceName: string;
  dinOptions: number[];
  selectedDin: number | null;
  setSelectedDin: (din: number | null) => void;
  onTest: () => void;
  status: boolean;
  setStatus: (status: boolean) => void;
  value: number;
  setValue: (value: number) => void;
  showTestControl: boolean;
  onSend: () => void;
  options?: { label: string; value: number }[];
  children?: React.ReactNode;
}

export interface CardDispositivoFactoryProps {
  deviceType: keyof DeviceComponentsRegistry;
  deviceName: string;
  dinOptions: number[];
  selectedDin: number | null;
  setSelectedDin: (din: number | null) => void;
  onTest: () => void;
  onSend: () => void;
  status: boolean;
  setStatus: (status: boolean) => void;
  value: number;
  setValue: (value: number) => void;
  showTestControl: boolean;
}

export interface UPLDispositivoCardProps extends BaseCardDispositivoProps {
  status: boolean;
  setStatus: (status: boolean) => void;
  value: number;
  setValue: (value: number) => void;
  showTestControl: boolean;
}

export interface DDO {
  id?: number;
  din_id_dst?: number;
  din_id_src?: number;
  timestamp: string;
  typeset_id: number;
  payload: string;
  payload_size: number;
}

export interface DDOView {
  id?: number;
  timestamp: string;
  typeset: number;
  payload: string;
  payloadSize: number;
}

export interface Pagination {
  count: number;
  offset: number;
  limit: number;
  total: number;
}
export interface Event {
  data: DDO[];
  pagination: Pagination;
}

export interface DeviceModelGroup {
  id: number;
  title: string;
  description: string;
  link_image: string;
}
export interface DeviceGroup {
  data: DeviceModelGroup[];
  pagination: Pagination;
}

export interface Resource {
  id: number;
  name: string;
  device_model_id: number;
  link: string;
  resource_type: number;
}

export interface DeviceGroup {
  id: number;
  title: string;
  description: string;
  link_image: string;
}

export interface Dev {
  id: number;
  device_group_id: number;
  description: string;
  serial: string;
  device_group?: DeviceGroup;
  resources?: Resource[];
}

export interface DeviceModel {
  data: Dev[];
  pagination: Pagination;
}

export interface DeviceFunction {
  id: number;
  device_id: number;
  device_model_function_id: number;
  enabled: boolean;
  function: Function;
  parameters: DeviceFunctionParameter[];
  inputs: any[];
  outputs: any[];
  notifications: any[];
}

export interface Function {
  id: number;
  name: string;
  device_model_id: number;
  parameters: FunctionParameter[];
  inputs: any[];
  outputs: any[];
  notifications: any[];
}

export interface FunctionParameter {
  id: number;
  property_type: number;
  name: string;
  function_id: number;
  data_type: number;
  default_value: string;
  safe_value: string;
}

export interface DeviceFunctionParameter {
  id: number;
  property_id: number;
  device_function_id: number;
  value: any;
  parameter_template: FunctionParameter;
}
