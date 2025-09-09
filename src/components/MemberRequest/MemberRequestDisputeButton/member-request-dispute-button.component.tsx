import { Button } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { MemberExcludedCode } from 'src/consts';

interface MemberRequestDisputeButtonProps {
  item: {
    statusCode: string;
  };
  // setLoading: (loading: boolean) => void;
}

export function MemberRequestDisputeButton({
  item,
}: MemberRequestDisputeButtonProps) {
  const isDisabled = item.statusCode !== MemberExcludedCode;

  return (
    <Button
      type="default"
      danger
      disabled={isDisabled}
      icon={<ExclamationCircleOutlined />}
      className="dispute-button"
      style={{
        borderRadius: '6px',
        fontWeight: 500,
        fontSize: '12px',
        height: '32px',
        minWidth: '100px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      Оспорить
    </Button>
  );
}
