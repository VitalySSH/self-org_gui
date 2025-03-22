export function attribute(type?: any) {
  return (target: any, propertyKey: string) => {
    const metadata = Reflect.getMetadata('Attribute', target) || {};
    // TODO: разобраться, почему типы не сохраняются в метаданных.
    // const type = Reflect.getMetadata('design:type', target, propertyKey);
    metadata[propertyKey] = {
      tagged: true,
      type: type,
    };
    Reflect.defineMetadata('Attribute', metadata, target);
  };
}
