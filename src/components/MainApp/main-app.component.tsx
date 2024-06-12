import './main-app.component.css';
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
import { AllCommunities } from "../../pages";
import { Route, Routes } from "react-router-dom";


const {
    Header,
    Content,
    Footer,
} = Layout;

export function MainApp () {

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
                <Header className="main-header">
                    <Logo />
                    {icons}
                </Header>
                <Content className="content">
                    <Routes>
                        <Route path='/communities' element={<AllCommunities/>} />
                    </Routes>
                </Content>
                <Footer className="footer">
                    <AppFooter />
                </Footer>
            </Layout>
        </Layout>
    );
}