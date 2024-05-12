import {Menu, type MenuProps} from "antd";
import React from "react";
import { TeamOutlined, UserOutlined } from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

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
    getItem('Мой профиль', 'my-profile', <UserOutlined />),
];

export function SideMenu() {
    const navigate = useNavigate();

    return (
        <div className="SideMenu">
            <Menu
                defaultSelectedKeys={['com']}
                mode="inline"
                items={items}
                onClick={(item)=>{
                    navigate(item.key)
                }}
            >

            </Menu>
        </div>
    )
}
