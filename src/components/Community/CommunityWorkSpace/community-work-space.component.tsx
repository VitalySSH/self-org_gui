import { Dropdown, Layout } from 'antd';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  AddMemberRequestsForMe,
  CommunitySummary,
  MyCommunitySettings,
  Initiatives,
  Rules,
  Disputes,
  Challenges,
  NewRule,
  MyDelegates,
  SubCommunities,
  RuleDetail,
  NewInitiative,
  InitiativeDetail,
  NewDelegate,
  DelegateDetail,
} from 'src/pages';
import { DownOutlined } from '@ant-design/icons';
import { AuthHeaderIcons, SiderBar } from 'src/components';
import { CommunityAOService } from 'src/services';
import { useCallback, useEffect, useState } from 'react';
import { CommunityWorkSpaceData } from 'src/interfaces';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

export function CommunityWorkSpace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [communityData, setCommunityData] = useState(
    null as CommunityWorkSpaceData | null
  );

  const getCommunity = useCallback(() => {
    if (id && communityData?.id !== id) {
      const communityService = new CommunityAOService();
      communityService.getNameData(id).then((resp) => {
        if (resp.is_blocked) navigate('/no-much-page');
        setCommunityData({
          id: id,
          name: resp.name,
          menuItems: resp.parent_data.map((it) => {
            return {
              key: `/my-communities/${it.id}`,
              label: it.name,
            };
          }),
        });
      });
    }
  }, [communityData?.id, id, navigate]);

  useEffect(() => {
    getCommunity();
  }, [getCommunity]);

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  return (
    <Layout className="community">
      <SiderBar isCommunityWS={true} />
      <Layout>
        <Header className="header">
          <div className="header-content">
            <div className="navigation-section">
              <ArrowLeftOutlined
                onClick={() => navigate(-1)}
                className="back-icon"
              />
              <div className="community-info">
                <div className="community-name-wrapper">
                  <h1 className="community-name" title={communityData?.name}>
                    {communityData?.name}
                  </h1>
                  {!!communityData?.menuItems?.length && (
                    <Dropdown
                      menu={{
                        items: communityData.menuItems,
                        onClick: (e: { key: string }) => handleMenuClick(e.key),
                      }}
                      placement="bottom"
                    >
                      <DownOutlined className="dropdown-icon" />
                    </Dropdown>
                  )}
                </div>
              </div>
            </div>
            <AuthHeaderIcons />
          </div>
        </Header>
        <Content className="content">
          <Routes>
            <Route
              path="summary"
              element={<CommunitySummary communityId={id} />}
            />
            <Route
              path="sub-communities"
              element={<SubCommunities communityId={id} />}
            />
            <Route
              path="my-settings"
              element={<MyCommunitySettings communityId={id} />}
            />
            <Route
              path="my-delegates"
              element={<MyDelegates communityId={id} />}
            />
            <Route
              path="my-delegates/new"
              element={<NewDelegate communityId={id} />}
            />
            <Route
              path="my-delegates/:id/*"
              element={<DelegateDetail communityId={id} />}
            />
            <Route path="rules" element={<Rules communityId={id} />} />
            <Route path="rules/new" element={<NewRule communityId={id} />} />
            <Route path="rules/:id/*" element={<RuleDetail />} />
            <Route
              path="initiatives"
              element={<Initiatives communityId={id} />}
            />
            <Route
              path="initiatives/new"
              element={<NewInitiative communityId={id} />}
            />
            <Route path="initiatives/:id/*" element={<InitiativeDetail />} />
            <Route
              path="challenges"
              element={<Challenges communityId={id} />}
            />
            <Route path="disputes" element={<Disputes communityId={id} />} />
            <Route
              path="add-member"
              element={<AddMemberRequestsForMe communityId={id} />}
            />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
