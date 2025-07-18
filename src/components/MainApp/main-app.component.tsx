import { Layout } from 'antd';
import { SiderBar } from 'src/components';
import { NotAuthHeaderIcons } from 'src/components';
import { AuthContextProvider } from 'src/interfaces';
import { useAuth } from 'src/hooks';
import { AuthHeaderIcons } from 'src/components';
import {
  AboutPage,
  Communities,
  MyAddMemberRequests,
  NewCommunity,
  UserGuideChallenges,
  UserGuideDisputes,
  // NoMatchPage
} from 'src/pages';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from 'src/components';
import { JSX } from 'react/jsx-runtime';

const { Header, Content } = Layout;

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
      <SiderBar isCommunityWS={false} isNotAuthorized={!authData.user} />
      <Layout>
        <Header className="header">{icons}</Header>
        <Content>
          {location.pathname === '/' && <AboutPage />}
          <Routes>
            <Route
              path="/communities"
              element={
                <ProtectedRoute>
                  <Communities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/new-community"
              element={
                <ProtectedRoute>
                  <NewCommunity />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-add-requests"
              element={
                <ProtectedRoute>
                  <MyAddMemberRequests />
                </ProtectedRoute>
              }
            />
            {/*user guide*/}
            <Route
              path="/user-guide-challenges"
              element={<UserGuideChallenges />}
            />
            <Route
              path="/user-guide-disputes"
              element={<UserGuideDisputes />}
            />
            {/*<Route path="*" element={<NoMatchPage />} />*/}
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
