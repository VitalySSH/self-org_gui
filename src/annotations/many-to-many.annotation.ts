export function manyToMany(entityName: string) {
    return (target: any, propertyName: string) => {
        const metadata = Reflect.getMetadata('ManyToMany', target) || {};
        metadata[propertyName] = { entityName };
        Reflect.defineMetadata('ManyToMany', metadata, target);
    };
}