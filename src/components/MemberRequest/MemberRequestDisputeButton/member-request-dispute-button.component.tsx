import { Button } from 'antd';
import { MemberExcludedCode } from 'src/consts';

export function MemberRequestDisputeButton(props: any) {
  return (
    <>
      <Button
        disabled={props.item.statusCode !== MemberExcludedCode}
        style={{ width: '90%' }}
      >
        Оспорить
      </Button>
    </>
  );
}
