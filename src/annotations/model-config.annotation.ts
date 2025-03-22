import { ModelConfig } from 'src/interfaces';

export function modelConfig(config: ModelConfig) {
  return (target: any) => {
    Reflect.defineMetadata('ModelConfig', config, target);
  };
}
