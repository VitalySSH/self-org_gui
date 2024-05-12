export function attribute() {
    return (target: any, propertyName: string) => {
        const metadata = Reflect.getMetadata('Attribute', target) || {};
        metadata[propertyName] = {
            tagged: true,
        };
        Reflect.defineMetadata('Attribute', metadata, target);
    };
}