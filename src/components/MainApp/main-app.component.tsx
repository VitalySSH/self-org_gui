import { AppHeader } from "../AppHeader/app-header.component.tsx";
import { Space } from "antd";
import { SideMenu } from "../SideMenu/side-menu.component.tsx";
import { PageContent } from "../PageContent/page-content.component.tsx";
import { AppFooter } from "../AppFooter/app-footer.component.tsx";



export function MainApp () {

    return (
        <div className="App">
            <AppHeader/>
            <Space className="SideMenuAndPageContent">
                <SideMenu></SideMenu>
                <PageContent></PageContent>
            </Space>
            <AppFooter/>
        </div>
    );
}