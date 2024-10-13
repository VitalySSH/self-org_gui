import {Card, List} from "antd";
import {
    SettingsStatisticsInterface
} from "../../../interfaces";
import Meta from "antd/es/card/Meta";


export function SettingsStatistics(props: any) {

    return (
        <List
            itemLayout="vertical"
            dataSource={props.data}
            locale={{emptyText: "Нет данных"}}
            size="large"
            renderItem={(item: SettingsStatisticsInterface) => (
                <List.Item>
                    <Card>
                        <Meta title={item.name}/>
                        <div>
                            {`Отдано голосов: ${ item.percent }%`}
                        </div>
                    </Card>
                </List.Item>
            )}
        />
    )
}
