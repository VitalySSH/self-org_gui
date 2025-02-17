import { Menu } from 'antd';
import './right-menu.component.scss';
import React from 'react';
import {
  TeamOutlined,
  PlusCircleOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MenuItem } from 'src/shared/types.ts';

function getItem(
  label: React.ReactNode,
  key: React.Key,
  className?: string,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    className,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem(
    'Создать сообщество',
    'new-community',
    'menu-item',
    <PlusCircleOutlined className="menu-icon" />
  ),
  getItem(
    'Все сообщества',
    'communities',
    'menu-item',
    <TeamOutlined className="menu-icon" />
  ),
  getItem(
    'Мои сообщества',
    'my-communities',
    'menu-item',
    <TeamOutlined className="menu-icon" />
  ),
  getItem(
    'Мои заявки на вступление',
    'my-add-requests',
    'menu-item',
    <UserAddOutlined className="menu-icon" />
  ),
];

export function RightMenu(props: any) {
  const navigate = useNavigate();

  return (
    <Menu
      mode="inline"
      items={items}
      onClick={(item) => {
        props.setDrawerOpen(false);
        navigate(`/${item.key}`);
      }}
      className="right-menu"
    />
  );
}
