/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: PanelView.tsx
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */
import { PanelViewProps } from '@/types';
import './components.css';

const PanelView = ({ children, layoutStyle }: PanelViewProps) => {
  const containerClass = `panel-content-view ${layoutStyle}`;
  return (
    <>
      <div className={containerClass}>{children}</div>
    </>
  );
};

export default PanelView;
