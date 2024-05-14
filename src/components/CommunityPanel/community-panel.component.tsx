import {
    Collapse,
    Flex, Tabs,
    TabsProps,
} from "antd";
import CollapsePanel from "antd/es/collapse/CollapsePanel";
import './community-panel.component.css'

const items: TabsProps['items'] = [
    {
        key: '1',
        label: 'Все сообщества',
        children: 'Здесь будет списов всех сообществ приложения',
    },
    {
        key: '2',
        label: 'Мои сообщества',
        children: 'Здесь будет списов ообществ, членом которых я являюсь',
    },
];


export function CommunityPanel() {

    return (
        <Flex>
            <Collapse className="community-panel">
                <CollapsePanel header="Сообщества" key="community">
                    <Tabs defaultActiveKey="1" items={items}  />
                </CollapsePanel>
            </Collapse>
        </Flex>
    )
}
