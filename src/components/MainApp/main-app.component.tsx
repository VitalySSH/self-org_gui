import { Layout } from "antd";
import { SiderBar } from "src/components";
import {
    NotAuthHeaderIcons
} from "src/components";
import { AuthContextProvider } from "src/interfaces";
import { useAuth } from "src/hooks";
import {
    AuthHeaderIcons
} from "src/components";
import {
    AboutPage,
    AllCommunities,
    MyAddMemberRequests,
    MyCommunities,
    NewCommunity,
    UserGuideChallenges,
    // NoMatchPage
} from "src/pages";
import { Route, Routes, useLocation } from "react-router-dom";
import { ProtectedRoute } from "src/components";
import { JSX } from "react/jsx-runtime";


const {
    Header,
    Content,
} = Layout;

export function MainApp() {

    const location = useLocation();
    const authData: AuthContextProvider = useAuth();

    let icons: JSX.Element | undefined;
    if (authData.user) {
        icons = <AuthHeaderIcons />;
    } else {
        icons = <NotAuthHeaderIcons />;
    }

    return (
        <Layout>
            <SiderBar
                isCommunityWS={false}
                isNotAuthorized={!authData.user}
            />
            <Layout>
                <Header className="header">
                    {/*<Logo />*/}
                    {icons}
                </Header>
                <Content className="content">
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
                        {/*user guide*/}
                        <Route path='/user-guide/challenges' element={
                            <UserGuideChallenges />
                        } />
                        {/*<Route path="*" element={<NoMatchPage />} />*/}
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
}