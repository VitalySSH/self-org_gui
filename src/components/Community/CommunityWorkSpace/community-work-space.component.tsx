import { Dropdown, Layout, Spin } from 'antd';
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
  NewChallenge,
} from 'src/pages';
import { DownOutlined } from '@ant-design/icons';
import { AuthHeaderIcons, SiderBar } from 'src/components';
import { CommunityAOService } from 'src/services';
import { useCallback, useEffect, useState } from 'react';
import { CommunityWorkSpaceData } from 'src/interfaces';
import { ArrowLeftOutlined, HomeOutlined } from '@ant-design/icons';
import './community-work-space.component.scss';

const { Header, Content } = Layout;

export function CommunityWorkSpace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [communityData, setCommunityData] =
    useState<CommunityWorkSpaceData | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadCommunityData = useCallback(
    async (communityId: string, showLoading = false) => {
      if (showLoading) {
        setIsLoading(true);
      }

      try {
        const communityService = new CommunityAOService();
        const resp = await communityService.getNameData(communityId);

        setIsBlocked(resp.is_blocked);
        if (resp.is_blocked) {
          navigate('/no-much-page');
          return;
        }

        setCommunityData({
          id: communityId,
          name: resp.name,
          menuItems: resp.parent_data.map((it) => ({
            key: `/communities/${it.id}`,
            label: it.name,
          })),
        });
      } catch (error) {
        console.error('Failed to load community data:', error);
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [navigate]
  );

  const getCommunity = useCallback(() => {
    if (id && communityData?.id !== id) {
      loadCommunityData(id, true);
    } else if (id && communityData?.id === id) {
      setIsLoading(false);
    }
  }, [communityData?.id, id, loadCommunityData]);

  const refreshCommunityData = useCallback(() => {
    if (!id) return;
    loadCommunityData(id, false);
  }, [id, loadCommunityData]);

  useEffect(() => {
    getCommunity();
  }, [getCommunity]);

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Показываем загрузку пока данные не загружены
  if (isLoading || !communityData) {
    return (
      <Layout className="community-workspace">
        <SiderBar isCommunityWS={true} isBlocked={isBlocked} />
        <Layout className="community-main-layout">
          <div className="community-loading-container">
            <Spin size="large" />
            <p className="community-loading-text">Загрузка сообщества...</p>
          </div>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout className="community-workspace">
      <SiderBar isCommunityWS={true} isBlocked={isBlocked} />
      <Layout className="community-main-layout">
        <Header className="community-header">
          <div className="community-header-content">
            <div className="community-navigation-section">
              <button
                onClick={handleGoBack}
                className="community-back-button"
                aria-label="Назад"
              >
                <ArrowLeftOutlined className="community-back-icon" />
              </button>

              <div className="community-info">
                <div className="community-name-wrapper">
                  <h2 className="community-name" title={communityData.name}>
                    {communityData.name}
                  </h2>

                  {!!communityData.menuItems?.length && (
                    <Dropdown
                      overlayClassName="community-dropdown-menu"
                      menu={{
                        items: communityData.menuItems.map((item) => ({
                          key: item.key,
                          className: 'community-dropdown-item',
                          label: (
                            <div className="community-dropdown-link">
                              <HomeOutlined className="community-dropdown-icon" />
                              <span className="community-dropdown-name">
                                {item.label}
                              </span>
                            </div>
                          ),
                        })),
                        onClick: (e) => {
                          e.domEvent.preventDefault();
                          handleMenuClick(e.key);
                        },
                      }}
                      placement="bottomLeft"
                      trigger={['click']}
                    >
                      <button className="community-dropdown-trigger">
                        <DownOutlined className="community-dropdown-arrow" />
                      </button>
                    </Dropdown>
                  )}
                </div>
              </div>
            </div>

            <div className="community-header-actions">
              <AuthHeaderIcons />
            </div>
          </div>
        </Header>

        <Content className="community-content">
          <div className="community-content-wrapper">
            <Routes>
              <Route
                path="summary"
                element={<CommunitySummary communityId={id || ''} />}
              />
              <Route
                path="sub-communities"
                element={<SubCommunities communityId={id || ''} />}
              />
              <Route
                path="my-settings"
                element={
                  <MyCommunitySettings
                    communityId={id || ''}
                    onSettingsSaved={refreshCommunityData}
                  />
                }
              />
              <Route
                path="my-delegates"
                element={<MyDelegates communityId={id || ''} />}
              />
              <Route
                path="my-delegates/new"
                element={<NewDelegate communityId={id || ''} />}
              />
              <Route
                path="my-delegates/:id/*"
                element={<DelegateDetail communityId={id || ''} />}
              />
              <Route path="rules" element={<Rules communityId={id || ''} />} />
              <Route
                path="rules/new"
                element={<NewRule communityId={id || ''} />}
              />
              <Route path="rules/:id/*" element={<RuleDetail />} />
              <Route
                path="initiatives"
                element={<Initiatives communityId={id || ''} />}
              />
              <Route
                path="initiatives/new"
                element={<NewInitiative communityId={id || ''} />}
              />
              <Route path="initiatives/:id/*" element={<InitiativeDetail />} />
              <Route
                path="challenges"
                element={<Challenges communityId={id || ''} />}
              />
              <Route
                path="challenges/new"
                element={<NewChallenge communityId={id || ''} />}
              />
              <Route
                path="disputes"
                element={<Disputes communityId={id || ''} />}
              />
              <Route
                path="add-member"
                element={<AddMemberRequestsForMe communityId={id || ''} />}
              />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
