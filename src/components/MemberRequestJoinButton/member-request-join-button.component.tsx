import { Button } from "antd";
import { useNavigate } from "react-router-dom";


export function MemberRequestJoinButton(props: any) {

    const tableRow = props.tableRow;
    const navigate = useNavigate();

    const join = () => {
        navigate(tableRow.communityId)

    }

    return (
        <Button
          onClick={join}
          style={{ width: '90%' }}
        >
            Вступить
        </Button>
    );
}
