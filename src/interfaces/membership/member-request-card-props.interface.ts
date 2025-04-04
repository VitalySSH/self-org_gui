export interface MemberRequestCardProps<T> {
  item: T;
  setLoading?: (loading: boolean) => void;
  isParent?: boolean;
  onShowSubCommunities?: (item: T) => void;
}
