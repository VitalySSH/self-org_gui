import {
    AddMemberRequestsForMe
} from "src/pages";

export function AddMemberRequest(props: any) {

    const communityId = props?.communityId;

    return (
        <div className="community-work-space">
            <div className="section-header">
                Заявки на вступление в сообщество
            </div>
            <AddMemberRequestsForMe communityId={communityId}/>
        </div>
    );
}
