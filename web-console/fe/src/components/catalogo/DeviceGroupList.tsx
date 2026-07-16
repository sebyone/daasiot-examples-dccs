/*
 * DaaS-nodejs 2024 (@) Sebyone Srl
 *
 * File: DeviceGroupList.tsx
 *
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 * If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * This Source Code Form is "Incompatible With Secondary Licenses", as defined by the MPL v.2.0.
 *
 * Contributors:
 * francescopantusa98@gmail.com - initial implementation
 *
 */

/** Questo componente visualizza una lista di gruppi di dispositivi con supporto per:
 * - Selezione del gruppo corrente
 * - Paginazione
 * - Visualizzazione immagini dei gruppi
 * - Responsive design
 *
 * @component
 */

import { DeviceGroupListProps } from '@/types';
import { Button, Card, Empty, Menu, Pagination } from 'antd';
import React from 'react';
import styles from './DeviceGroupList.module.css';

const DeviceGroupList = React.memo(
  ({
    groups,
    selectedGroup,
    pagination,
    isMobile,
    isLaptop,
    onGroupSelect,
    onPaginationChange,
    translations,
  }: DeviceGroupListProps) => {
    return (
      <Card
        title={translations.devicesGroup}
        style={{ marginBottom: '20px' }}
        extra={
          selectedGroup && (
            <Button type="link" onClick={() => onGroupSelect(null, null)}>
              {translations.deselectGroup}
            </Button>
          )
        }
      >
        {groups?.data ? (
          <Menu
            mode="vertical"
            selectedKeys={selectedGroup?.title ? [selectedGroup.title] : []}
            onClick={({ key }) => {
              const group = groups.data.find((g) => g.title === key);
              if (group) {
                onGroupSelect(group.id, group.title);
              }
            }}
            style={{ marginTop: -20 }}
          >
            {groups.data.map((group) => (
              <Menu.Item key={group.title} className={styles.menuItem}>
                <div className={styles.menuItemContent}>
                  {group.link_image && (
                    <div className={styles.imageContainer}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={group.link_image}
                        alt={group.description || ''}
                        className={styles.groupImage}
                        style={{ width: '40px', height: '40px' }}
                      />
                    </div>
                  )}
                  <span className={styles.groupTitle}>{group.title}</span>
                </div>
              </Menu.Item>
            ))}
          </Menu>
        ) : (
          <Empty description={translations.noGroupsAvailable} />
        )}
        <div className={styles.paginationWrapper} style={{ transform: 'scale(0.8)' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            pageSizeOptions={['5', '10']}
            total={pagination.total}
            onChange={onPaginationChange}
            showSizeChanger={true}
            size="small"
            className={styles.pagination}
          />
        </div>
      </Card>
    );
  }
);

DeviceGroupList.displayName = 'DeviceGroupList';

export default DeviceGroupList;
