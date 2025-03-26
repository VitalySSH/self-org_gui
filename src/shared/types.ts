import { FilterItem, OrderItem } from 'src/interfaces';
import { MenuProps } from 'antd';
export type ClassType = new (...args: any[]) => any;
export type FilterOperations =
  | 'equals'
  | 'iequals'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'like'
  | 'ilike'
  | 'beetween'
  | 'notin'
  | 'null';
export type Filters = FilterItem[];
export type Orders = OrderItem[];
export type ModelType<T> = new (...args: any[]) => T;
export type MenuItem = Required<MenuProps>['items'][number];
export type Resource = 'rule' | 'initiative';
export type AIResponseStatus = 'OK' | 'ERROR' | 'NOVOTES';
