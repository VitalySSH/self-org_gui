import { Layout } from "antd";
import { Route, Routes, useParams } from "react-router-dom";
import {
    AddMemberRequest,
    CommunitySummary,
    MyCommunitySettings,
    Initiatives,
    Rules,
    Disputes,
    Challenges,
    NewRule,
    MyDelegates, SubCommunities,
} from "src/pages";
import { AuthHeaderIcons, SiderBar } from "src/components";
import { CrudDataSourceService } from "src/services";
import { CommunityModel } from "src/models";
import { useEffect, useState } from "react";


const {
    Header,
    Content,
} = Layout;

export function CommunityWorkSpace() {

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
        <Layout className="community">
            <SiderBar isCommunityWS={true}/>
            <Layout>
                <Header
                    className="header"
                    style={{ justifyContent: "space-between" }}
                >
                    <div className="community-name">{communityName}</div>
                    <AuthHeaderIcons />
                </Header>
                <Content className="content">
                    <Routes>
                        <Route path='summary' element={
                            <CommunitySummary communityId={id} />
                        } />
                        <Route path='sub-communities' element={
                            <SubCommunities communityId={id} />
                        } />
                        <Route path='my-settings' element={
                            <MyCommunitySettings communityId={id} />
                        } />
                        <Route path='my-delegates' element={
                            <MyDelegates communityId={id} />
                        } />
                        <Route path='rules' element={
                            <Rules communityId={id} />
                        } />
                        <Route path='rules/new' element={
                            <NewRule communityId={id} />
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
            </Layout>
        </Layout>
    );
}