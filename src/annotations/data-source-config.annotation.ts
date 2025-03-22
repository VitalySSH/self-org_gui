export function dataSourceConfig(config: any = {}) {
  return (target: any) => {
    Reflect.defineMetadata('DataSourceConfig', config, target);
  };
}
