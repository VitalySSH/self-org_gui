export function readonly() {
    return (target: any, propertyName: string) => {
        const metadata = Reflect.getMetadata('Readonly', target) || {};
        metadata[propertyName] = {
            tagged: true,
        };
        Reflect.defineMetadata('Readonly', metadata, target);
    };
}