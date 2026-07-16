/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: useDeviceGroups.ts
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
 * Questo file contiene il custom hook useDeviceGroups utilizzato per gestire i gruppi di dispositivi
 *
 */
import { useCustomNotification } from '@/hooks/useNotificationHook';
import ConfigService from '@/services/configService';
import { DeviceGroup, UseDeviceGroupsResult, UsePaginationState } from '@/types';
import { useEffect, useState } from 'react';

/**
 * Hook per la gestione dei gruppi di dispositivi
 *
 * @param t - Funzione di traduzione
 * @returns Oggetto contenente lo stato e le funzioni per gestire i gruppi
 */

export const useDeviceGroups = (t: (key: string) => string): UseDeviceGroupsResult => {
  const [groups, setGroups] = useState<DeviceGroup | null>(null);
  const [groupsPagination, setGroupsPagination] = useState<UsePaginationState>({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const { notify } = useCustomNotification();

  /**
   * Recupera i gruppi di dispositivi dal server
   * @param page - Numero di pagina corrente
   * @param pageSize - Dimensione della pagina
   * @param search - Termine di ricerca opzionale
   */
  const fetchDeviceModelGroups = async (page: number, pageSize: number, search: string = '') => {
    try {
      const offset = (page - 1) * pageSize;
      const response = await ConfigService.getDeviceModelGroups(offset, pageSize, search);
      setGroups(response);
      setGroupsPagination((prev) => ({ ...prev, total: response.pagination.total }));
    } catch (error) {
      notify('error', t('error'), t('errorGetDevices'));
    }
  };

  // Carica i gruppi all'avvio e quando cambia la paginazione
  useEffect(() => {
    fetchDeviceModelGroups(groupsPagination.current, groupsPagination.pageSize);
  }, [groupsPagination.current, groupsPagination.pageSize]);

  const handleGroupsPaginationChange = (page: number, pageSize?: number) => {
    setGroupsPagination((prev) => ({ ...prev, current: page, pageSize: pageSize || prev.pageSize }));
  };

  return { groups, groupsPagination, handleGroupsPaginationChange };
};
