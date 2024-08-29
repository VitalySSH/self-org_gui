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
    JoinCommunity,
    MyAddMemberRequests,
    MyCommunities,
    NewCommunity,
    NoMatchPage
} from "../../pages";
import { Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "../ProtectedRoute/protected-route.component.tsx";


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
                        <Route path='/communities' element={
                            <ProtectedRoute>
                                <AllCommunities />
                            </ProtectedRoute>
                        } />
                        <Route path='/my-communities' element={
                            <ProtectedRoute>
                                <MyCommunities />
                            </ProtectedRoute>
                        } />
                        <Route path='/new-community' element={
                            <ProtectedRoute>
                                <NewCommunity />
                            </ProtectedRoute>
                        } />
                        <Route path='/my-add-requests' element={
                            <ProtectedRoute>
                                <MyAddMemberRequests />
                            </ProtectedRoute>
                        } />
                        <Route path='/my-add-requests/:id' element={
                            <ProtectedRoute>
                                <JoinCommunity />
                            </ProtectedRoute>
                        } />
                        <Route path="*" element={<NoMatchPage />} />
                    </Routes>
                </Content>
                <Footer className="footer">
                    <AppFooter />
                </Footer>
            </Layout>
        </Layout>
    );
}