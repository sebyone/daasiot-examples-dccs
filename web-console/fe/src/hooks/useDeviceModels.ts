/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: useDeviceModels.ts
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
 *
 *
 * Questo file contiene il custom hook useDeviceModels utilizzato per gestire i modelli di dispositivi
 *
 */
import ConfigService from '@/services/configService';
import { DeviceModel, UseDeviceModelsResult, UsePaginationState } from '@/types';
import debounce from 'debounce';
import { useState } from 'react';
import { useCustomNotification } from './useNotificationHook';

/**
 * Hook per la gestione dei modelli di dispositivi
 *
 * @param t - Funzione di traduzione
 * @returns Oggetto contenente lo stato e le funzioni per gestire i modelli
 */
export const useDeviceModels = (t: (key: string) => string): UseDeviceModelsResult => {
  const [deviceModels, setDeviceModels] = useState<DeviceModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [modelsPagination, setModelsPagination] = useState<UsePaginationState>({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const { notify } = useCustomNotification();

  /**
   * Recupera i modelli di dispositivi dal server
   * @param groupId - ID del gruppo selezionato (opzionale)
   * @param page - Numero di pagina corrente
   * @param pageSize - Dimensione della pagina
   * @param search - Termine di ricerca opzionale
   */
  const fetchDeviceModels = async (groupId: number | null, page: number, pageSize: number, search: string = '') => {
    setIsLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const response = groupId
        ? await ConfigService.getDeviceModelByModelGroupId(groupId, offset, pageSize, search)
        : await ConfigService.getDeviceModel(offset, pageSize, search);
      setDeviceModels(response);
      setModelsPagination((prev) => ({ ...prev, total: response.pagination.total }));
      setCurrentGroupId(groupId);
    } catch (error) {
      notify('error', t('error'), t('errorGetModels'));
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione di ricerca con debounce per evitare troppe chiamate API durante la ricerca del modello
  const debouncedSearch = debounce((searchTerm: string, groupId: number | null) => {
    setIsSearchActive(searchTerm.length > 0);
    fetchDeviceModels(groupId, 1, modelsPagination.pageSize, searchTerm);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value, currentGroupId);
  };

  const handleModelsPaginationChange = (page: number, pageSize?: number) => {
    const newPageSize = pageSize || modelsPagination.pageSize;
    setModelsPagination((prev) => ({ ...prev, current: page, pageSize: newPageSize }));
    fetchDeviceModels(currentGroupId, page, newPageSize, searchTerm);
  };

  return {
    deviceModels,
    isLoading,
    modelsPagination,
    searchTerm,
    isSearchActive,
    handleSearchChange,
    handleModelsPaginationChange,
    fetchDeviceModels,
  };
};
