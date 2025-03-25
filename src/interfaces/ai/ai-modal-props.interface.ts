export interface AiModalProps {
  visible: boolean;
  onClose: () => void;
  request?: () => Promise<string>;
}
