import { AppHeader } from "../AppHeader/app-header.component.tsx";
import { Layout, Space } from "antd";
import { PageContent } from "../PageContent/page-content.component.tsx";
import { AppFooter } from "../AppFooter/app-footer.component.tsx";
import { SideMenu}  from "../SideMenu/side-menu.component.tsx";

export function MainAppLast () {

    return (
        <div className="App">
            <AppHeader/>
            <Space className="SideMenuAndPageContent">
                <Layout>
                    <SideMenu></SideMenu>
                </Layout>
                <Layout>
                    <PageContent></PageContent>
                </Layout>
            </Space>
            <AppFooter/>
        </div>
    );
}