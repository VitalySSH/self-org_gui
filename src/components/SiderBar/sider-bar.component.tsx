import './sider-bar.component.scss';
import { Button, Flex, Image, Layout, Menu } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    TeamOutlined,
    PlusCircleOutlined,
    InfoCircleOutlined,
    ExceptionOutlined,
    ApartmentOutlined
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState} from "react";
import { SiderBarInterface } from "src/interfaces";
import { AuthCard } from "src/components";
import { MenuItem } from "src/shared/types.ts";

const { Sider} = Layout;

const communitiesMenuItems: MenuItem[] = [
    {
        key: 'communities',
        icon: <TeamOutlined className="menu-icon"/>,
        label: 'Все',
    },
    {
        key: 'my-communities',
        icon: <TeamOutlined className="menu-icon"/>,
        label: 'Мои',
    },
    {
        key: 'new-community',
        icon: <PlusCircleOutlined className="menu-icon"/>,
        label: 'Новое',
    }
];

const userGuideMenuItems: MenuItem[] = [
    {
        key: 'test1',
        icon: <InfoCircleOutlined className="menu-icon"/>,
        label: 'Сообщества',
    },
    {
        key: 'test2',
        icon: <InfoCircleOutlined className="menu-icon"/>,
        label: 'Делегаты',
    },
    {
        key: 'test3',
        icon: <InfoCircleOutlined className="menu-icon"/>,
        label: 'Правила',
    },
    {
        key: 'test4',
        icon: <InfoCircleOutlined className="menu-icon"/>,
        label: 'Инициатвы',
    },
    {
        key: 'test5',
        icon: <InfoCircleOutlined className="menu-icon"/>,
        label: 'Споры',
    },
    {
        key: 'test6',
        icon: <InfoCircleOutlined className="menu-icon"/>,
        label: 'Вызовы',
    }
];

export function SiderBar(props: SiderBarInterface) {

    const location = useLocation();
    const navigate = useNavigate();

    const [
        collapsed,
        setCollapsed
    ] = useState(false);

    const [
        logoPath,
        setLogoPath
    ] = useState('/utu_logo.png');

    const [
        communitiesMenuKeys,
        setCommunitiesMenuKeys
    ] = useState<string[]>([]);

    const [
        userGuideMenuKeys,
        setUserGuideMenuKeys
    ] = useState<string[]>([]);

    const [
        communityWSMenuKeys,
        setCommunityWSMenuKeys
    ] = useState<string[]>([]);

    const onClickImage = () => {
        setCommunitiesMenuKeys([]);
        setUserGuideMenuKeys([]);
        setCommunityWSMenuKeys([]);
        navigate('/', { preventScrollReset: true });
    }

    useEffect(() => {
        if (location.pathname === '/') {
            setCommunitiesMenuKeys([]);
            setUserGuideMenuKeys([]);
            setCommunityWSMenuKeys([]);
        } else {
            const pathname = location.pathname.split('/');
            if (props.isCommunityWS) {
                if (pathname.length >= 3) {
                    setCommunityWSMenuKeys([pathname[3]]);
                }
            } else {
                if (pathname.length >= 1) {
                    const currentKey = pathname[1];
                    if (props.isNotAuthorized) {
                        setUserGuideMenuKeys([currentKey]);
                    } else {
                        const isFindUserGuide=
                            userGuideMenuItems
                                .find(it => it?.key === currentKey);
                        if (isFindUserGuide) {
                            setUserGuideMenuKeys([currentKey]);
                        }
                        const isFindCommunities=
                            communitiesMenuItems
                                .find(it => it?.key === currentKey);
                        if (isFindCommunities) {
                            setCommunitiesMenuKeys([currentKey]);
                        }
                    }
                }
            }
        }
    }, [location])

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            trigger={null}
            width={300}
            className="sider"
            breakpoint="md"
            onBreakpoint={(broken) => {
                setCollapsed(broken);
                if (!broken) {
                    setLogoPath('/utu_logo.png');
                } else {
                    setLogoPath('/utu_logo_small.png');
                }
            }}
        >

            <Flex
                align="center"
                justify="center"
                className="sider-logo"
            >
                <Image
                    height={40}
                    preview={false}
                    src={logoPath}
                    onClick={onClickImage}
                    style={{cursor: "pointer"}}
                >
                </Image>
            </Flex>

            {!props.isCommunityWS &&
                <>
                    {!props.isNotAuthorized &&
                        <>
                            {!collapsed &&
                                <div className="menu-header">
                                    Сообщества
                                </div>
                            }
                            {collapsed &&
                                <ApartmentOutlined className="menu-header-icon" />
                            }
                            <Menu
                                mode="inline"
                                items={communitiesMenuItems}
                                onClick={(item) => {
                                    setCommunitiesMenuKeys([item.key]);
                                    navigate(item.key, {preventScrollReset: true});
                                }}
                                selectedKeys={communitiesMenuKeys}
                            />
                        </>
                    }
                    {!collapsed &&
                        <div className="menu-header">
                            Руководство пользователя
                        </div>
                    }
                    {collapsed &&
                        <ExceptionOutlined className="menu-header-icon" />
                    }
                    <Menu
                        mode="inline"
                        items={userGuideMenuItems}
                        onClick={(item) => {
                            setUserGuideMenuKeys([item.key]);
                            navigate(item.key, {preventScrollReset: true});
                        }}
                        selectedKeys={userGuideMenuKeys}
                    />
                </>
            }


            {!collapsed && props.isNotAuthorized && <AuthCard/>}

            <Button
                type="text"
                icon={collapsed ?
                    <MenuUnfoldOutlined style={{fontSize: 24}}/>
                    : <MenuFoldOutlined style={{fontSize: 24}}/>}
                onClick={() => {
                    if (collapsed) {
                        setLogoPath('/utu_logo.png');
                    } else {
                        setLogoPath('/utu_logo_small.png');
                    }
                    setCollapsed(!collapsed);
                }}
                className="triger-btn"
            />
            {!collapsed &&
                <Flex align="center" justify="center">
                    <div
                        style={{
                            position: 'fixed',
                            bottom: 12
                        }}
                    >
                        UtU ©{new Date().getFullYear()}
                    </div>
                </Flex>
            }


        </Sider>
    )
}
