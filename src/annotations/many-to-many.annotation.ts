export function manyToMany(entityName: string, isBackRef: boolean = false) {
  return (target: any, propertyName: string) => {
    const metadata = Reflect.getMetadata('ManyToMany', target) || {};
    metadata[propertyName] = { entityName, isBackRef };
    Reflect.defineMetadata('ManyToMany', metadata, target);
  };
}
