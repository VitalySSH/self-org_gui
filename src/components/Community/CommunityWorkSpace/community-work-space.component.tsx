import { Dropdown, Layout } from 'antd';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  AddMemberRequest,
  CommunitySummary,
  MyCommunitySettings,
  Initiatives,
  Rules,
  Disputes,
  Challenges,
  NewRule,
  MyDelegates,
  SubCommunities, RuleDetail,
} from 'src/pages';
import { DownOutlined } from '@ant-design/icons';
import { AuthHeaderIcons, SiderBar } from 'src/components';
import { CommunityAOService } from 'src/services';
import { useEffect, useState } from 'react';
import { CommunityWorkSpaceData } from 'src/interfaces';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

export function CommunityWorkSpace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [communityData, setCommunityData] = useState(
    null as CommunityWorkSpaceData | null
  );

  const communityService = new CommunityAOService();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getCommunity = () => {
    if (id && communityData?.id !== id) {
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
  };

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
        <Header className="header" style={{ justifyContent: 'space-between' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <ArrowLeftOutlined
              onClick={() => {
                navigate(-1);
              }}
              style={{
                fontSize: 24,
                marginRight: 16,
              }}
            />
            <div className="community-name">{communityData?.name}</div>
            {!!communityData?.menuItems?.length && (
              <Dropdown
                menu={{
                  items: communityData.menuItems,
                  onClick: (e: { key: string }) => handleMenuClick(e.key),
                }}
                placement="bottom"
              >
                <DownOutlined style={{ marginLeft: 8 }} />
              </Dropdown>
            )}
          </div>
          <AuthHeaderIcons />
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
            <Route path="rules" element={<Rules communityId={id} />} />
            <Route path="rules/new" element={<NewRule communityId={id} />} />
            <Route path="rules/:id/*" element={<RuleDetail />} />
            <Route
              path="initiatives"
              element={<Initiatives communityId={id} />}
            />
            <Route
              path="challenges"
              element={<Challenges communityId={id} />}
            />
            <Route path="disputes" element={<Disputes communityId={id} />} />
            <Route
              path="add-member"
              element={<AddMemberRequest communityId={id} />}
            />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
