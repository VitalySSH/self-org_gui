import { Layout, Typography } from "antd";
import './community.component.css';
import { Route, Routes, useParams } from "react-router-dom";
import {
    AddMemberRequest,
    CommunitySummary,
    MyCommunitySettings,
    Initiatives,
    Rules,
    Disputes,
    Challenges,
} from "../../../pages";
import { AppFooter } from "../../AppFooter/app-footer.component.tsx";
import {
    CommunitySider
} from "../CommunitySider/community-sider.component.tsx";
import {
    AuthHeaderIcons
} from "../../AuthHeaderIcons/auth-header-icons.component.tsx";
import { CrudDataSourceService } from "../../../services";
import { CommunityModel } from "../../../models";
import { useEffect, useState } from "react";


const {
    Header,
    Content,
    Footer,
} = Layout;

export function Community () {

    const { id } = useParams();
    const [loading, setLoading] =
        useState(true);
    const [communityName, setCommunityName] =
        useState('');

    const communityService =
        new CrudDataSourceService(CommunityModel);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getCommunity = () => {
        if (loading && id) {
            communityService.get(id, ['main_settings.name'])
                .then(communityInst => {
                    const name =
                        communityInst.main_settings?.name?.name || '';
                    setCommunityName(name);
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
                    <Routes>
                        <Route path='summary' element={
                            <CommunitySummary communityId={id} />
                        } />
                        <Route path='my-settings' element={
                            <MyCommunitySettings communityId={id} />
                        } />
                        <Route path='rules' element={
                            <Rules communityId={id} />
                        } />
                        <Route path='initiatives' element={
                            <Initiatives communityId={id} />
                        } />
                        <Route path='challenges' element={
                            <Challenges communityId={id} />
                        } />
                        <Route path='disputes' element={
                            <Disputes communityId={id} />
                        } />
                        <Route path='add-member' element={
                            <AddMemberRequest communityId={id} />
                        } />
                    </Routes>
                </Content>
                <Footer className="footer">
                    <AppFooter />
                </Footer>
            </Layout>
        </Layout>
    );
}