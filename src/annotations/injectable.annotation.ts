import { ClassType } from 'src/shared/types';
import { Container } from './container.ts';

export function Injectable(target: ClassType) {
  Container.add(target);
}
