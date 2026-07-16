/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: useModelHelper.ts
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */

import { Dev } from '@/types';

/**
 * Hook per le utility di gestione dei modelli
 *
 * @returns Oggetto contenente funzioni d'aiuto per la gestione dei modelli
 */
export const useModelHelpers = () => {
  /**
   * Recupera l'immagine di copertina di un modello
   * @param model - Modello di dispositivo
   * @returns URL dell'immagine di copertina
   */
  const getCoverModelImage = (model: Dev): string | undefined => {
    return model.resources?.find((resource) => resource.resource_type === 4)?.link;
  };

  /**
   * Recupera i documenti associati a un modello
   * @param model - Modello di dispositivo
   * @returns Array di documenti con nome e link
   */
  const getDatasheetModelDocuments = (model: Dev): Array<{ name: string; link: string }> => {
    return (
      model.resources
        ?.filter((resource) => resource.resource_type === 2)
        .map((resource) => ({
          name: resource.name,
          link: resource.link,
        })) || []
    );
  };

  /**
   * Recupera il link del firmware di un modello
   * @param model - Modello di dispositivo
   * @returns URL del firmware
   */
  const getFirmware = (model: Dev): string | undefined => {
    const firmwareLink = model.resources?.find((resource) => resource.resource_type === 5)?.link;
    return firmwareLink?.split('/').pop();
  };

  return {
    getCoverModelImage,
    getDatasheetModelDocuments,
    getFirmware,
  };
};
