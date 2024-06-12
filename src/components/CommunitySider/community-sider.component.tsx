import './community-sider.component.css'
import { Button, Flex, Image, Layout, Menu, MenuProps } from "antd";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

const { Sider} = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    className?: string,
    icon?: React.ReactNode,
    children?: MenuItem[],
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
    getItem('Общие настройки сообщества', 'all-communities',
        'menu-item', <TeamOutlined className="menu-icon" />),
    getItem('Мои настройки сообщества', 'my-communities',
        'menu-item', <TeamOutlined className="menu-icon" />),
    getItem('Мои делегаты', 'my-profile',
        'menu-item', <TeamOutlined className="menu-icon" />),
];

export function CommunitySider() {

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
        selectedKeys,
        setSelectedKeys
    ] = useState<string[]>([]);

    const onClickImage = () => {
        setSelectedKeys([]);
        navigate('/', { preventScrollReset: true });
    }

    useEffect(() => {
        const pathname = location.pathname.split('/');
        setSelectedKeys([pathname[pathname.length - 1]]);
    }, [location])

    return (
        <Sider
            theme="light"
            collapsible
            collapsed={collapsed}
            trigger={null}
            width={250}
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
            <div>
                <Flex align="center" justify="center">
                    <Image
                        height={40}
                        preview={false}
                        src={logoPath}
                        onClick={onClickImage}
                        style={{cursor: "pointer"}}
                    >
                    </Image>
                </Flex>
                <Menu
                    mode="inline"
                    className="menu-bar"
                    items={items}
                    onClick={(item) => {
                        setSelectedKeys([item.key]);
                        navigate(item.key, { preventScrollReset: true });
                    }}
                    selectedKeys={selectedKeys}
                />
            </div>

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
        </Sider>
    )
}
