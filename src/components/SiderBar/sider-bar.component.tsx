import { useEffect, useState } from 'react';
import { Button, Flex, Image, Layout, Menu, Tooltip, Card, Typography } from 'antd';
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
  GlobalOutlined,
  UserOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { SiderBarInterface } from 'src/interfaces';
import { AuthCard } from 'src/components';
import { MenuItem } from 'src/shared/types.ts';
import { SubCommunitiesLabel } from 'src/consts';

const { Sider } = Layout;
const { Text } = Typography;

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
  const [communitiesActive, setCommunitiesActive] = useState(false);
  const [userGuideMenuKeys, setUserGuideMenuKeys] = useState<string[]>([]);
  const [communityWSMenuKeys, setCommunityWSMenuKeys] = useState<string[]>([]);

  const cleanKeys = () => {
    setCommunitiesActive(false);
    setUserGuideMenuKeys([]);
    setCommunityWSMenuKeys([]);
  };

  const onClickImage = () => {
    cleanKeys();
    navigate('/');
  };

  const onClickCommunities = () => {
    cleanKeys();
    setCommunitiesActive(true);
    navigate('/communities');
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
        cleanKeys();
        const currentKey = pathname[1];

        // Проверяем, находимся ли мы на странице сообществ
        if (currentKey === 'communities') {
          setCommunitiesActive(true);
        } else if (props.isNotAuthorized) {
          setUserGuideMenuKeys([currentKey]);
        } else {
          const isFindUserGuide = userGuideMenuItems.find(
            (it) => it?.key === currentKey
          );
          if (isFindUserGuide) {
            setUserGuideMenuKeys([currentKey]);
          }
        }
      }
    }
  }, [location.pathname, navigate, props.isCommunityWS, props.isNotAuthorized]);

  // Компонент навигации к сообществам
  const renderCommunitiesNavigation = () => {
    if (collapsed) {
      return (
        <Tooltip title="Сообщества" placement="right">
          <div
            className={`communities-nav-collapsed ${communitiesActive ? 'active' : ''}`}
            onClick={onClickCommunities}
          >
            <div className="communities-icon-wrapper">
              <GlobalOutlined className="communities-main-icon" />
              <UserOutlined className="communities-sub-icon" />
            </div>
          </div>
        </Tooltip>
      );
    }

    return (
      <div className="communities-navigation">
        <Card
          className={`communities-nav-card ${communitiesActive ? 'active' : ''}`}
          onClick={onClickCommunities}
          hoverable
          size="small"
        >
          <div className="communities-nav-content">
            <div className="communities-icons">
              <GlobalOutlined className="communities-main-icon" />
              <UserOutlined className="communities-sub-icon" />
            </div>
            <div className="communities-text">
              <Text className="communities-title">Сообщества</Text>
            </div>
            <HomeOutlined className="communities-arrow" />
          </div>
        </Card>
      </div>
    );
  };

  // Компонент для неавторизованных пользователей
  const renderUnauthorizedContent = () => (
    <div className="sider-unauthorized">
      <div className="auth-welcome">
        <div className="welcome-icon">
          <TeamOutlined />
        </div>
        <div className="welcome-text">
          <Text className="welcome-title">Добро пожаловать!</Text>
          <Text className="welcome-subtitle" type="secondary">
            Войдите для доступа к сообществам
          </Text>
        </div>
      </div>
      <div className="sider-auth-container">
        <AuthCard />
      </div>
    </div>
  );

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
      {/* Основной контент сайдбара */}
      <div className="sider-content">
        <Flex align="center" justify="center" className="sider-logo">
          <Image
            height={collapsed ? 32 : 40}
            preview={false}
            src={logoPath}
            onClick={onClickImage}
            className="sider-logo-image"
            alt="UTU Logo"
          />
        </Flex>

        {props.isNotAuthorized ? (
          !collapsed && renderUnauthorizedContent()
        ) : (
          <>
            {!props.isCommunityWS && (
              <>
                {/* Навигация к сообществам */}
                {renderCommunitiesNavigation()}

                {/* Руководство пользователя */}
                {!collapsed && <div className="menu-header">Руководство пользователя</div>}
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
                {renderCommunitiesNavigation()}
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
          </>
        )}
      </div>

      {/* Нижняя часть с кнопкой и футером */}
      <div className="sider-bottom">
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
      </div>
    </Sider>
  );
}