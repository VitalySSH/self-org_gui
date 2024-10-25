import { Button } from "antd";
import { MemberExcludedCode } from "../../consts";


export function MemberRequestDisputeButton(props: any) {

    const tableRow = props.tableRow;

    return (
        <>
            <Button
                disabled={tableRow.statusCode !== MemberExcludedCode}
                style={{ width: '90%' }}
            >
                Оспорить
            </Button>
        </>
    );
}
