import styles from './status-tag.module.scss';

const STATUS_CLASSES: Record<string, string> = {
  on_consideration: styles.statusTagOnReview,
  principal_agreement: styles.statusTagApproved,
  rule_approved: styles.statusTagActive,
  rule_revoked: styles.statusTagInactive,
};

export const StatusTag = ({
  status,
  statusCode,
}: {
  status: string;
  statusCode: string;
}) => {
  return (
    <span className={`${styles.statusTag} ${STATUS_CLASSES[statusCode]}`}>
      {status}
    </span>
  );
};
