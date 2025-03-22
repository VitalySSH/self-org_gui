type OrderDirection = 'asc' | 'desc';

export interface OrderItem {
  field: string;
  direction: OrderDirection;
}
