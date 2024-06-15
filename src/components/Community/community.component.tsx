import {Layout, Typography} from "antd";
import './community.component.css';
import { Route, Routes, useParams } from "react-router-dom";
import {
    CommunitySettings,
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
import { CrudDataSourceService } from "../../services";
import { CommunityModel } from "../../models";
import {useEffect, useState} from "react";


const {
    Header,
    Content,
    Footer,
} = Layout;

export function Community () {

    const { id } = useParams();
    const [loading, setLoading] =
        useState(true);
    const [community, setCommunity] =
        useState({} as CommunityModel);
    const [communityName, setCommunityName] =
        useState('');

    const communityService =
        new CrudDataSourceService(CommunityModel);

    const getCommunity = () => {
        if (loading && id) {
            communityService.get(id, [
                'main_settings.name', 'main_settings.description'
            ]).then(community => {
                    setCommunity(community);
                    const name =
                        community.main_settings?.name?.name || '';
                    setCommunityName(name);
                }).catch((error) => {
                console.log(error);
            }).finally(() => {
                setLoading(false);
            });
        }
    }

    useEffect(() => {
        getCommunity();
    }, [getCommunity]);

    return (
        <Layout className="app">
            <CommunitySider />
            <Layout>
                <Header className="header">
                    <Typography.Title
                        level={4}
                        className="community-name"
                    >{communityName}</Typography.Title>
                    <AuthHeaderIcons />
                </Header>
                <Content className="content">
                    {/*<CommunityPanel />*/}
                    <Routes>
                        <Route path='settings' element={
                                <CommunitySettings community={community} />
                            }
                        />
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