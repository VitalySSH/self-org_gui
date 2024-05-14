import {Button, Flex, Image, Layout, Menu, type MenuProps} from "antd";
import React, { useState } from "react";
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined, TeamOutlined,
} from '@ant-design/icons';
import './main-app.component.css';
import {Route, Routes, useNavigate} from "react-router-dom";
import {
    AllCommunities,
    MyCommunities,
    MyProfile
} from "../../pages";
import { AppHeader } from "../AppHeader/app-header.component.tsx";
import { AppFooter } from "../AppFooter/app-footer.component.tsx";
import { CommunityPanel } from "../CommunityPanel/community-panel.component.tsx";


const {
    Sider,
    Header,
    Content,
    Footer,
} = Layout;

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
    // getItem('Сообщества', 'communities', <TeamOutlined style={{ fontSize: 20 }} />,
    //     [getItem('Все', 'all-communities'),
    //         getItem('Мои', 'my-communities')]),
    getItem('Общие настройки сообщества', 'all-communities',
        <TeamOutlined style={{ fontSize: 20 }} />),
    getItem('Мои настройки сообщества', 'my-communities',
        <TeamOutlined style={{ fontSize: 20 }} />),
    getItem('Мои делегаты', 'my-profile',
        <TeamOutlined style={{ fontSize: 20 }} />),
];

export function MainApp () {
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
        navigate('/');
    }

    return (
        <Layout className="app">
            <Sider
                theme="light"
                collapsible
                collapsed={collapsed}
                trigger={null}
                width={280}
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
                    <Flex align="center" justify="center" className="">
                        <div className="logo"></div>
                        <Image
                            height={40}
                            preview={false}
                            src={logoPath}
                            onClick={onClickImage}
                            style={{cursor: "pointer"}}
                        >
                        </Image>
                    </Flex>
                    <Menu mode="inline"
                          className="menu-bar"
                          items={items}
                          onClick={(item) => {
                              setSelectedKeys([item.key]);
                              navigate(item.key)
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
            <Layout>
                <Header className="header">
                    <AppHeader/>
                </Header>
                <Content className="content">
                    <CommunityPanel />
                    <Routes>
                        <Route path='/all-communities' element={<AllCommunities/>}/>
                        <Route path='/my-communities' element={<MyCommunities/>} />
                        <Route path='/my-profile' element={<MyProfile />} />
                    </Routes>
                </Content>
                <Footer className="footer">
                    <AppFooter />
                </Footer>
            </Layout>
        </Layout>
    );
}