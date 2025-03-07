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
import CryptoJS from 'crypto-js';
import { Transport } from 'esptool-js';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import React from 'react';

export type TableDataType = LinkDataType | MapDataType | DinLocalDataType | StatusDataType;

export interface Version {
  daasLibrary: string;
  compiler: string;
  cppStandardLibrary: string;
  node: string;
  nodeAddonApi: string;
}

export interface DinLocalDataType {
  id?: number;
  title: string;
  sid: string | number;
  din: string | number;
  acpt_all: string;
  links: string;
  status: string;
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
  alignment?: string;
  linkStatus?: boolean;
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
  showPowerActionsProcessor: boolean;
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
  links?: [
    {
      id: number;
      link: number;
      din_id: number;
      url: string;
    },
  ];
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
  onFinish: (values: DinFormData) => void;
  setIsDataSaved: (status: boolean) => void;
  disableSid: boolean;
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
  cdin: {
    sid: string;
    din: string;
    p_res: string;
    skey: string;
    links: Link[];
    receiver: null;
  };
}

export interface Link {
  id: number;
  link: number;
  din_id: number;
  url: string;
}

export interface MapDataType {
  id?: number;
  din: string;
  links: Link[];
  tech: string;
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
  data: MapDataType;
  status: boolean;
  setStatus: (enabled: boolean) => void;
  onChangeComplete: (value: number | number[]) => void;
  onChange: (status: boolean) => void;
  onSend: () => void;
}

export interface ModalMapProps {
  isVisible: boolean;
  onClose: () => void;
  sid: string;
  din?: string;
  onMapCreated?: (din: string) => void;
  selectedMapId?: number | null;
  mode?: 'create' | 'edit';
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
  serial: string;
  latitude: number;
  longitude: number;
  device_model: {
    id: number;
    device_group_id: number;
    description: string;
    name: string;
    link_image: string;
  };
  din: {
    id?: number;
    sid: string;
    din: string;
    p_res: string;
    skey: string;
  };
}

export interface CreateDevice {
  modello: number;
  receiver: number;
  serial: string;
  din: number;
  denominazione: string;
  latitudine?: string;
  longitudine?: string;
  enable?: boolean;
  id?: number;
}

export interface Device {
  data: DataDevice[];
  pagination: Pagination;
}

export interface NodoFormProps {
  form: FormInstance;
  onFinish: (values: CreateDevice) => void;
  setIsDataSaved: (status: boolean) => void;
  deviceModels: Dev[];
  receiversData: ConfigData[];
  selectedReceiverSid: string;
  onReceiverChange: (receiverId: number) => void;
  onOpenModal: () => void;
  dins?: DinDataType[];
  onDinChange?: (value: number) => void;
  mode?: 'create' | 'edit';
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
  name: string;
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

/* CATALOGO */

export interface DeviceGroupListProps {
  /** Lista dei gruppi di dispositivi */
  groups: DeviceGroup | null;
  /** Gruppo attualmente selezionato */
  selectedGroup: { id: number; title: string | null } | null;
  /** Configurazione della paginazione */
  pagination: { current: number; pageSize: number; total: number };
  /** Flag per la visualizzazione mobile */
  isMobile: boolean;
  /** Flag per la visualizzazione laptop */
  isLaptop: boolean;
  /** Callback per la selezione di un gruppo */
  onGroupSelect: (groupId: number | null, groupTitle: string | null) => void;
  /** Callback per il cambio pagina */
  onPaginationChange: (page: number, pageSize?: number) => void;
  /** Testi tradotti */
  translations: {
    devicesGroup: string;
    deselectGroup: string;
    noGroupsAvailable: string;
  };
}

export interface ModelListProps {
  /** Lista dei modelli di dispositivi */
  deviceModels: { data: Dev[] } | null;
  /** Flag per lo stato di caricamento */
  isLoading: boolean;
  /** Modello attualmente selezionato */
  selectedModel: Dev | null;
  /** Flag per indicare se la ricerca è attiva */
  isSearchActive: boolean;
  /** Configurazione della paginazione */
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  /** Flag per la visualizzazione mobile */
  isMobile: boolean;
  /** Callback per la selezione di un modello */
  onModelSelect: (model: Dev) => void;
  /** Callback per il cambio pagina */
  onPaginationChange: (page: number, pageSize?: number) => void;
  /** Testi tradotti */
  translations: {
    modelsGroup: string;
    noModelsAvailable: string;
    selectGroupModel: string;
  };
  /** Funzione per ottenere l'immagine di copertina del modello */
  getCoverModelImage: (model: Dev) => string | undefined;
}

export interface ModelDetailsProps {
  /** Modello da visualizzare */
  model: Dev;
  /** Flag per la visualizzazione mobile */
  isMobile: boolean;
  /** Testi tradotti */
  translations: {
    order: string;
    description: string;
    documents: string;
    loadFW: string;
  };
  /** Callback per l'apertura della pagina relativa al caricamento firmware */
  onLoadFW: () => void;
  /** Funzione per ottenere l'immagine di copertina dalla chiamata API*/
  getCoverModelImage: (model: Dev) => string | undefined;
  /** Funzione per ottenere i documenti del modello dalla chiamata API*/
  getDatasheetModelDocuments: (model: Dev) => Array<{ name: string; link: string }>;
  /** Funzione per ottenere il link del firmware dalla chiamata API*/
  getFirmware: (model: Dev) => string | undefined;
}

/** Interfaccia per lo stato della paginazione */
export interface UsePaginationState {
  current: number;
  pageSize: number;
  total: number;
}

/** Interfaccia per il risultato dell'hook useDeviceGroups */
export interface UseDeviceGroupsResult {
  groups: DeviceGroup | null;
  groupsPagination: UsePaginationState;
  handleGroupsPaginationChange: (page: number, pageSize?: number) => void;
}

/** Interfaccia per il risultato dell'hook useDeviceModels */
export interface UseDeviceModelsResult {
  deviceModels: DeviceModel | null;
  isLoading: boolean;
  modelsPagination: UsePaginationState;
  searchTerm: string;
  isSearchActive: boolean;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleModelsPaginationChange: (page: number, pageSize?: number) => void;
  fetchDeviceModels: (groupId: number | null, page: number, pageSize: number, search?: string) => Promise<void>;
}

/** Interfaccia per info del gruppo selezionato */
export interface SelectedGroup {
  id: number;
  title: string | null;
}

export interface LoaderOptions {
  transport: Transport;
  baudrate: number;
  romBaudrate: number;
  serialInterface?: boolean;
  debugLogging?: boolean;
}

export interface TarFile {
  name: string;
  data: string;
  size: number;
  offset: number;
}

export interface FlashOptions {
  fileArray: {
    data: string;
    address: number;
  }[];
  flashSize: string;
  flashMode: string;
  flashFreq: string;
  eraseAll: boolean;
  compress: boolean;
  reportProgress: (fileIndex: number, written: number, total: number) => void;
  calculateMD5Hash: (image: string) => CryptoJS.WordArray;
}

export type FlashStatus = '' | 'downloading' | 'extracting' | 'connecting' | 'flashing' | 'validating';
