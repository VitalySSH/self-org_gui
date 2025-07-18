import { Button, Flex, Image, Layout, Menu, Tooltip } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  ToolOutlined,
  BarChartOutlined,
  BulbOutlined,
  ExperimentOutlined,
  UserAddOutlined,
  ThunderboltOutlined,
  ReadOutlined,
  CrownOutlined,
  ApiOutlined,
  TrophyOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SiderBarInterface } from 'src/interfaces';
import { AuthCard } from 'src/components';
import { MenuItem } from 'src/shared/types.ts';
import { SubCommunitiesLabel } from 'src/consts';

const { Sider } = Layout;

const communitiesMenuItems: MenuItem[] = [
  {
    key: 'communities',
    icon: <HomeOutlined />,
    label: 'Все',
  }
];

const userGuideMenuItems: MenuItem[] = [
  {
    key: 'test1',
    icon: <TeamOutlined />,
    label: 'Сообщества',
  },
  {
    key: 'test2',
    icon: <CrownOutlined />,
    label: 'Советники',
  },
  {
    key: 'test3',
    icon: <SafetyCertificateOutlined />,
    label: 'Правила',
  },
  {
    key: 'test4',
    icon: <BulbOutlined />,
    label: 'Инициатвы',
  },
  {
    key: 'user-guide/disputes',
    icon: <ThunderboltOutlined />,
    label: 'Споры',
  },
  {
    key: 'user-guide-challenges',
    icon: <ExperimentOutlined />,
    label: 'Лаборатория',
  },
  {
    key: 'test5',
    icon: <TrophyOutlined />,
    label: 'Коллективный опыт',
  },
  {
    key: 'test6',
    icon: <ApiOutlined />,
    label: 'Интеграции',
  },
];

const communityWSMenuItems: MenuItem[] = [
  {
    key: 'summary',
    icon: <BarChartOutlined />,
    label: 'Обзор',
  },
  {
    key: 'sub-communities',
    icon: <ApartmentOutlined />,
    label: SubCommunitiesLabel,
  },
  {
    key: 'my-settings',
    icon: <ToolOutlined />,
    label: 'Мои настройки',
  },
  {
    key: 'my-delegates',
    icon: <CrownOutlined />,
    label: 'Мои советники',
  },
  {
    key: 'rules',
    icon: <ReadOutlined />,
    label: 'Правила',
  },
  {
    key: 'initiatives',
    icon: <BulbOutlined />,
    label: 'Инициативы',
  },
  {
    key: 'challenges',
    icon: <ExperimentOutlined />,
    label: 'Лаборатория',
  },
  {
    key: 'disputes',
    icon: <ThunderboltOutlined />,
    label: 'Споры',
  },
  {
    key: 'add-member',
    icon: <UserAddOutlined />,
    label: 'Заявки на вступление',
  },
];

export function SiderBar(props: SiderBarInterface) {
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);

  const [logoPath, setLogoPath] = useState('/utu_logo.png');

  const [communitiesMenuKeys, setCommunitiesMenuKeys] = useState<string[]>([]);

  const [userGuideMenuKeys, setUserGuideMenuKeys] = useState<string[]>([]);

  const [communityWSMenuKeys, setCommunityWSMenuKeys] = useState<string[]>([]);

  const cleanKeys = () => {
    setCommunitiesMenuKeys([]);
    setUserGuideMenuKeys([]);
    setCommunityWSMenuKeys([]);
  };

  const onClickImage = () => {
    cleanKeys();
    navigate('/');
  };

  useEffect(() => {
    if (props.isBlocked) navigate('/no-much-page');
    if (location.pathname === '/') {
      cleanKeys();
    } else {
      const pathname = location.pathname.split('/');
      if (props.isCommunityWS) {
        if (pathname.length > 3) {
          setCommunityWSMenuKeys([pathname[3]]);
        } else {
          setCommunityWSMenuKeys(['summary']);
          navigate('summary');
        }
      } else {
        if (pathname.length >= 1) {
          cleanKeys();
          const currentKey = pathname[1];
          if (props.isNotAuthorized) {
            setUserGuideMenuKeys([currentKey]);
          } else {
            const isFindUserGuide = userGuideMenuItems.find(
              (it) => it?.key === currentKey
            );
            if (isFindUserGuide) {
              setUserGuideMenuKeys([currentKey]);
            }
            const isFindCommunities = communitiesMenuItems.find(
              (it) => it?.key === currentKey
            );
            if (isFindCommunities) {
              setCommunitiesMenuKeys([currentKey]);
            }
          }
        }
      }
    }
  }, [location.pathname, navigate, props.isCommunityWS, props.isNotAuthorized]);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={300}
      className="sider-bar"
      breakpoint="lg"
      onBreakpoint={(broken) => {
        setCollapsed(broken);
        if (!broken) {
          setLogoPath('/utu_logo.png');
        } else {
          setLogoPath('/utu_logo_small.png');
        }
      }}
    >
      <Flex align="center" justify="center" className="sider-logo">
        <Image
          height={40}
          preview={false}
          src={logoPath}
          onClick={onClickImage}
          className="sider-logo-image"
          alt="UTU Logo"
        />
      </Flex>

      {!props.isCommunityWS && !props.isNotAuthorized && (
        <>
          {!collapsed && <div className="menu-header">Сообщества</div>}
          {collapsed && (
            <Tooltip title="Сообщества" placement="right">
              <ApartmentOutlined className="menu-header-icon" />
            </Tooltip>
          )}
          <Menu
            mode="inline"
            items={communitiesMenuItems}
            onClick={(item) => {
              setCommunitiesMenuKeys([item.key]);
              navigate(item.key);
            }}
            selectedKeys={communitiesMenuKeys}
            className="sider-menu"
          />
          {!collapsed && (
            <div className="menu-header">Руководство пользователя</div>
          )}
          {collapsed && (
            <Tooltip title="Руководство пользователя" placement="right">
              <BookOutlined className="menu-header-icon" />
            </Tooltip>
          )}
          <Menu
            mode="inline"
            items={userGuideMenuItems}
            onClick={() => {
              // setUserGuideMenuKeys([item.key]);
              // navigate(item.key);
            }}
            selectedKeys={userGuideMenuKeys}
            className="sider-menu sider-menu-disabled"
          />
        </>
      )}
      {props.isCommunityWS && (
        <>
          {!collapsed && <div className="menu-header">Сообщество</div>}
          {collapsed && (
            <Tooltip title="Сообщество" placement="right">
              <ApartmentOutlined className="menu-header-icon" />
            </Tooltip>
          )}
          <Menu
            mode="inline"
            items={communityWSMenuItems}
            onClick={(item) => {
              setCommunityWSMenuKeys([item.key]);
              navigate(item.key);
            }}
            selectedKeys={communityWSMenuKeys}
            className="sider-menu"
          />
        </>
      )}

      {!collapsed && props.isNotAuthorized && (
        <div className="sider-auth-container">
          <AuthCard />
        </div>
      )}

      <Button
        type="text"
        icon={
          collapsed ? (
            <MenuUnfoldOutlined className="trigger-icon" />
          ) : (
            <MenuFoldOutlined className="trigger-icon" />
          )
        }
        onClick={() => {
          if (collapsed) {
            setLogoPath('/utu_logo.png');
          } else {
            setLogoPath('/utu_logo_small.png');
          }
          setCollapsed(!collapsed);
        }}
        className="trigger-btn"
      />
      {!collapsed && (
        <Flex align="center" justify="center" className="sider-footer">
          <div className="sider-copyright">
            UtU ©{new Date().getFullYear()}
          </div>
        </Flex>
      )}
    </Sider>
  );
}