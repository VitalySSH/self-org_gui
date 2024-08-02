import { Layout } from "antd";
import { AppFooter } from "../AppFooter/app-footer.component.tsx";
import {
    NotAuthHeaderIcons
} from "../NotAuthHeaderIcons/not-auth-header-icons.component.tsx";
import { Logo } from "../Logo/logo.component.tsx";
import { AuthContextProvider } from "../../interfaces";
import { useAuth } from "../../hooks";
import {
    AuthHeaderIcons
} from "../AuthHeaderIcons/auth-header-icons.component.tsx";
import {
    AboutPage,
    AllCommunities,
    MyCommunities,
    NewCommunity
} from "../../pages";
import { Route, Routes, useLocation } from "react-router-dom";


const {
    Header,
    Content,
    Footer,
} = Layout;

export function MainApp () {

    const location = useLocation();
    const authData: AuthContextProvider = useAuth();

    let icons;
    if (authData.user) {
        icons = <AuthHeaderIcons />;
    } else {
        icons = <NotAuthHeaderIcons />;
    }

    return (
        <Layout className="app">
            <Layout>
                <Header className="header">
                    <Logo />
                    {icons}
                </Header>
                <Content className="main-content">
                    {location.pathname === '/' && <AboutPage />}
                    <Routes>
                        <Route path='/communities' element={<AllCommunities/>} />
                        <Route path='/my-communities' element={<MyCommunities/>} />
                        <Route path='/new-community' element={<NewCommunity/>} />
                    </Routes>
                </Content>
                <Footer className="footer">
                    <AppFooter />
                </Footer>
            </Layout>
        </Layout>
    );
}