import { useEffect, useState } from 'react';
import {
  Button,
  Flex,
  Image,
  Layout,
  Menu,
  Tooltip,
  Card,
  Typography,
} from 'antd';
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
  CloseOutlined,
  PlayCircleOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContextProvider, SiderBarInterface } from 'src/interfaces';
import { AuthCard } from 'src/components';
import { MenuItem } from 'src/shared/types.ts';
import { SubCommunitiesLabel } from 'src/consts';
import { AuthApiClientService } from 'src/services';
import './demo-mode.scss';
import { DEMO_CONFIG } from 'src/config/configuration.ts';
import { encryptPassword } from 'src/utils';
import { useAuth } from 'src/hooks';

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
    label: 'Инициативы',
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
  const authApiClientService = new AuthApiClientService();
  const authData: AuthContextProvider = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [logoPath, setLogoPath] = useState('/utu_logo.png');
  const [communitiesActive, setCommunitiesActive] = useState(false);
  const [userGuideMenuKeys, setUserGuideMenuKeys] = useState<string[]>([]);
  const [communityWSMenuKeys, setCommunityWSMenuKeys] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ДЕМО-РЕЖИМ: Состояние (легко удаляется в будущем)
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem(DEMO_CONFIG.storageKey) === 'true';
  });
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Закрываем мобильное меню при изменении маршрута
  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Блокируем скролл при открытом мобильном меню
  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, mobileMenuOpen]);

  // ДЕМО-РЕЖИМ: Блокировка перехода (легко удаляется в будущем)
  useEffect(() => {
    if (isDemoMode) {
      // Разрешаем только демо-сообщество и главную страницу
      const isAllowedPath =
        location.pathname === '/' ||
        location.pathname.startsWith(`/communities/${DEMO_CONFIG.communityId}`);

      if (!isAllowedPath) {
        navigate(-1);
      }
    }
  }, [location.pathname, isDemoMode, navigate]);

  const cleanKeys = () => {
    setCommunitiesActive(false);
    setUserGuideMenuKeys([]);
    setCommunityWSMenuKeys([]);
  };

  const onClickImage = () => {
    cleanKeys();
    navigate('/');
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const onClickCommunities = () => {
    // ДЕМО-РЕЖИМ: Блокируем переход на сообщества (легко удаляется в будущем)
    if (isDemoMode) {
      return;
    }

    cleanKeys();
    setCommunitiesActive(true);
    navigate('/communities');
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // ДЕМО-РЕЖИМ: Вход в демо-режим (легко удаляется в будущем)
  const handleEnterDemoMode = async () => {
    try {
      setIsDemoLoading(true);

      await authApiClientService.asyncLogin(
        DEMO_CONFIG.email,
        btoa(encryptPassword(DEMO_CONFIG.password))
      );
      const currentUser = await authApiClientService.getCurrentUser();
      authData.login(currentUser, false, true);

      localStorage.setItem(DEMO_CONFIG.storageKey, 'true');
      setIsDemoMode(true);

      navigate(`/communities/${DEMO_CONFIG.communityId}`);

      if (isMobile) {
        setMobileMenuOpen(false);
      }
    } catch (error) {
      console.error('Ошибка входа в демо-режим:', error);
    } finally {
      setIsDemoLoading(false);
    }
  };

  // ДЕМО-РЕЖИМ: Выход из демо-режима (легко удаляется в будущем)
  const handleExitDemoMode = async () => {
    try {
      setIsDemoLoading(true);

      await authApiClientService.logout();

      localStorage.removeItem(DEMO_CONFIG.storageKey);
      setIsDemoMode(false);
      authData.logout();

      navigate('/');

      if (isMobile) {
        setMobileMenuOpen(false);
      }
    } catch (error) {
      console.error('Ошибка выхода из демо-режима:', error);
    } finally {
      setIsDemoLoading(false);
    }
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

        if (currentKey === 'communities') {
          setCommunitiesActive(true);
        } else if (props.isNotAuthorized && !isDemoMode) {
          // ДЕМО-РЕЖИМ: Добавлена проверка
          setUserGuideMenuKeys([currentKey]);
        } else if (!isDemoMode) {
          // ДЕМО-РЕЖИМ: Добавлена проверка
          const isFindUserGuide = userGuideMenuItems.find(
            (it) => it?.key === currentKey
          );
          if (isFindUserGuide) {
            setUserGuideMenuKeys([currentKey]);
          }
        }
      }
    }
  }, [
    location.pathname,
    navigate,
    props.isCommunityWS,
    props.isNotAuthorized,
    isDemoMode,
    props.isBlocked,
  ]);

  const renderCommunitiesNavigation = () => {
    // ДЕМО-РЕЖИМ: Скрываем навигацию к сообществам (легко удаляется в будущем)
    if (isDemoMode && !props.isCommunityWS) {
      return null;
    }

    if (collapsed && !isMobile) {
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

        {/* ДЕМО-РЕЖИМ: Кнопка демо-режима (легко удаляется в будущем) */}
        <div style={{ marginTop: '32px' }}>
          <Button
            type="default"
            icon={<PlayCircleOutlined />}
            onClick={handleEnterDemoMode}
            loading={isDemoLoading}
            block
            className="demo-enter-btn"
          >
            Демо-режим
          </Button>
        </div>
      </div>
    </div>
  );

  // ДЕМО-РЕЖИМ: Контент для демо-режима (легко удаляется в будущем)
  const renderDemoModeContent = () => (
    <div className="sider-demo-mode">
      <div className="demo-welcome">
        <div className="welcome-icon">
          <PlayCircleOutlined style={{ color: '#cc0000' }} />
        </div>
        <div className="welcome-text">
          <Text className="welcome-title">Демо-режим</Text>
        </div>
      </div>

      <div style={{ marginTop: 'auto', padding: '16px' }}>
        <Button
          type="primary"
          danger
          icon={<PoweroffOutlined />}
          onClick={handleExitDemoMode}
          loading={isDemoLoading}
          block
          className="demo-exit-btn"
        >
          Выйти из демо-режима
        </Button>
      </div>

      {/* ДЕМО-РЕЖИМ: Меню сообщества */}
      {location.pathname.startsWith(
        `/communities/${DEMO_CONFIG.communityId}`
      ) ? (
        <div style={{ marginBottom: '16px' }}>
          {(!collapsed || isMobile) && (
            <div className="menu-header">Сообщество</div>
          )}
          {collapsed && !isMobile && (
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
              if (isMobile) {
                setMobileMenuOpen(false);
              }
            }}
            selectedKeys={communityWSMenuKeys}
            className="sider-menu"
          />
        </div>
      ) : (
        <div style={{ marginBottom: '16px', padding: '0 16px' }}>
          <Button
            type="default"
            icon={<ApartmentOutlined />}
            onClick={() => {
              navigate(`/communities/${DEMO_CONFIG.communityId}`);
              if (isMobile) {
                setMobileMenuOpen(false);
              }
            }}
            block
            className="demo-community-btn"
          >
            Демо-сообщество
          </Button>
        </div>
      )}
    </div>
  );

  const renderSiderContent = () => (
    <>
      <div className="sider-content">
        <Flex align="center" justify="center" className="sider-logo">
          <Image
            height={collapsed && !isMobile ? 32 : 40}
            preview={false}
            src={isMobile ? '/utu_logo.png' : logoPath}
            onClick={onClickImage}
            className="sider-logo-image"
            alt="UTU Logo"
          />
        </Flex>

        {/* ДЕМО-РЕЖИМ: Условное отображение контента (легко удаляется в будущем) */}
        {isDemoMode ? (
          (!collapsed || isMobile) && renderDemoModeContent()
        ) : props.isNotAuthorized ? (
          (!collapsed || isMobile) && renderUnauthorizedContent()
        ) : (
          <>
            {!props.isCommunityWS && (
              <>
                {renderCommunitiesNavigation()}

                {(!collapsed || isMobile) && (
                  <div className="menu-header">Руководство пользователя</div>
                )}
                {collapsed && !isMobile && (
                  <Tooltip title="Руководство пользователя" placement="right">
                    <BookOutlined className="menu-header-icon" />
                  </Tooltip>
                )}
                <Menu
                  mode="inline"
                  items={userGuideMenuItems}
                  onClick={() => {
                    if (isMobile) {
                      setMobileMenuOpen(false);
                    }
                  }}
                  selectedKeys={userGuideMenuKeys}
                  className="sider-menu sider-menu-disabled"
                />
              </>
            )}

            {props.isCommunityWS && (
              <>
                {renderCommunitiesNavigation()}
                {(!collapsed || isMobile) && (
                  <div className="menu-header">Сообщество</div>
                )}
                {collapsed && !isMobile && (
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
                    if (isMobile) {
                      setMobileMenuOpen(false);
                    }
                  }}
                  selectedKeys={communityWSMenuKeys}
                  className="sider-menu"
                />
              </>
            )}
          </>
        )}
      </div>

      <div className="sider-bottom">
        {isMobile ? (
          <Button
            type="text"
            icon={<CloseOutlined className="trigger-icon" />}
            onClick={handleMobileMenuToggle}
            className="trigger-btn mobile-close-btn"
          />
        ) : (
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
        )}

        {(!collapsed || isMobile) && (
          <Flex align="center" justify="center" className="sider-footer">
            <div className="sider-copyright">
              UtU ©{new Date().getFullYear()}
            </div>
          </Flex>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MenuUnfoldOutlined />}
          onClick={handleMobileMenuToggle}
          className={`mobile-fab-menu ${mobileMenuOpen ? 'menu-open' : ''}`}
        />

        {mobileMenuOpen && (
          <div className="mobile-sider-overlay">
            <div className="mobile-sider">{renderSiderContent()}</div>
            <div
              className="mobile-sider-backdrop"
              onClick={handleMobileMenuToggle}
            />
          </div>
        )}
      </>
    );
  }

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
      {renderSiderContent()}
    </Sider>
  );
}
