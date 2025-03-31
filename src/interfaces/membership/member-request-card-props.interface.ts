export interface MemberRequestCardProps<T> {
  item: T;
  setLoading?: (loading: boolean) => void;
  onShowSubCommunities?: (item: T) => void;
}
