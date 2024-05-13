import { Menu, type MenuProps } from "antd";
import React, { useState } from "react";
import { TeamOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Sider from "antd/es/layout/Sider";

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

const items: MenuItem[] = [
    getItem('Сообщества', 'communities', <TeamOutlined />,
        [getItem('Все', 'all-communities'),
                 getItem('Мои', 'my-communities')]),
];

export function SideMenu() {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="SideMenu">
            <Sider
                collapsible
                theme="light"
                collapsed={collapsed}
                breakpoint="xxl"
                onCollapse={(value) => setCollapsed(value)}
            >
                <div/>
                <Menu
                    defaultSelectedKeys={['com']}
                    mode="inline"
                    items={items}
                    theme="light"
                    onClick={(item) => {
                        navigate(item.key)
                    }}
                />
            </Sider>
        </div>
    )
}
