import { Button, Flex, Image, Layout, Menu } from "antd";
import { useEffect, useState } from "react";
import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import './main-app.component.css';
import {
    Route,
    Routes,
    useLocation,
    useNavigate,
} from "react-router-dom";
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

export function MainApp () {

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
        <Layout className="app">
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
                    <Menu
                        mode="inline"
                        className="menu-bar"
                        onClick={(item) => {
                          setSelectedKeys([item.key]);
                          navigate(item.key, { preventScrollReset: true });
                        }}
                        selectedKeys={selectedKeys}
                    >
                        <Menu.Item
                            key="all-communities"
                            icon={<TeamOutlined className="menu-icon" />}
                            className="menu-item"
                        >Общие настройки сообщества</Menu.Item>
                        <Menu.Item
                            key="my-communities"
                            icon={<TeamOutlined className="menu-icon" />}
                            className="menu-item"
                        >Мои настройки сообщества</Menu.Item>
                        <Menu.Item
                            key="my-profile"
                            icon={<TeamOutlined className="menu-icon" />}
                            className="menu-item"
                        >Мои делегаты</Menu.Item>
                    </Menu>
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