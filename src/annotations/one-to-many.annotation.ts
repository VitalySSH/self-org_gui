export function oneToMany(entityName: string) {
    return (target: any, propertyName: string) => {
        const metadata = Reflect.getMetadata('OneToMany', target) || {};
        metadata[propertyName] = { entityName };
        Reflect.defineMetadata('OneToMany', metadata, target);
    };
}