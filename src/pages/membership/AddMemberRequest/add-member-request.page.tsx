import { Layout, Typography } from "antd";
import {
    AddMemberRequestsForMe
} from "src/pages";

export function AddMemberRequest(props: any) {

    const communityId = props?.communityId;

    return (
        <Layout
            style={{height: '100%'}}
        >
            <Typography.Title
                level={3}
                style={{ textAlign: "center" }}
            >
                Заявки на вступление в сообщество
            </Typography.Title>
            <AddMemberRequestsForMe communityId={communityId} />
        </Layout>
    );
}
