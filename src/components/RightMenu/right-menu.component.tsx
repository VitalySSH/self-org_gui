import { Menu } from 'antd';
import './right-menu.component.scss';
import React from 'react';
import {
  PlusCircleOutlined,
  UserAddOutlined,
  HomeOutlined,
  // MoonOutlined,
  // SunOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { MenuItem } from 'src/shared/types.ts';
// import { useTheme } from 'src/contexts/ThemeContext';

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
    'Новое сообщество',
    'new-community',
    'right-menu-item',
    <PlusCircleOutlined className="right-menu-icon" />
  ),
  getItem(
    'Сообщества',
    'communities',
    'right-menu-item',
    <HomeOutlined className="right-menu-icon" />
  ),
  getItem(
    'Мои заявки на вступление',
    'my-add-requests',
    'right-menu-item',
    <UserAddOutlined className="right-menu-icon" />
  ),
];

export function RightMenu(props: any) {
  const navigate = useNavigate();
  // const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="right-menu-container">
      {/*<div className="right-menu-header">*/}
      {/*  <h3 className="right-menu-title">Навигация</h3>*/}
      {/*  <p className="right-menu-subtitle">Личный кабинет</p>*/}
      {/*</div>*/}

      <Menu
        mode="inline"
        items={items}
        onClick={(item) => {
          props.setDrawerOpen(false);
          navigate(`/${item.key}`);
        }}
        className="right-menu"
      />

      {/*<div className="right-menu-footer">*/}
      {/*  <Button*/}
      {/*    type="text"*/}
      {/*    icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}*/}
      {/*    onClick={toggleTheme}*/}
      {/*    className="theme-toggle-button"*/}
      {/*  >*/}
      {/*    {isDarkMode ? 'Светлая тема' : 'Тёмная тема'}*/}
      {/*  </Button>*/}
      {/*</div>*/}
    </div>
  );
}
