import { Layout } from "antd";
import './community.component.css';
import { Route, Routes } from "react-router-dom";
import {
    AllCommunities,
    MyCommunities,
    MyProfile
} from "../../pages";
import { AppFooter } from "../AppFooter/app-footer.component.tsx";
import {
    CommunitySider
} from "../CommunitySider/community-sider.component.tsx";
import {
    AuthHeaderIcons
} from "../AuthHeaderIcons/auth-header-icons.component.tsx";


const {
    Header,
    Content,
    Footer,
} = Layout;

export function Community () {

    return (
        <Layout className="app">
            <CommunitySider />
            <Layout>
                <Header className="header">
                    <AuthHeaderIcons/>
                </Header>
                <Content className="content">
                    {/*<CommunityPanel />*/}
                    <Routes>
                        <Route path='all-communities' element={<AllCommunities/>} />
                        <Route path='my-communities' element={<MyCommunities/>} />
                        <Route path='my-profile' element={<MyProfile />} />
                    </Routes>
                </Content>
                <Footer className="footer">
                    <AppFooter />
                </Footer>
            </Layout>
        </Layout>
    );
}