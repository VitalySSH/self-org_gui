import { Layout } from "antd";
import { AppFooter } from "src/components";
import {
    NotAuthHeaderIcons
} from "src/components";
import { Logo } from "src/components";
import { AuthContextProvider } from "src/interfaces";
import { useAuth } from "src/hooks";
import {
    AuthHeaderIcons
} from "src/components";
import {
    AboutPage,
    AllCommunities,
    JoinCommunity,
    MyAddMemberRequests,
    MyCommunities,
    NewCommunity,
    // NoMatchPage
} from "src/pages";
import { Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "src/components";


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
                        <Route path='/my-add-requests/community/:id' element={
                            <ProtectedRoute>
                                <JoinCommunity />
                            </ProtectedRoute>
                        } />
                        {/*<Route path="*" element={<NoMatchPage />} />*/}
                    </Routes>
                </Content>
                <Footer className="footer">
                    <AppFooter />
                </Footer>
            </Layout>
        </Layout>
    );
}