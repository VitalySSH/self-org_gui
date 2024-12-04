import { Container, CONTAINER_CONTEXT } from "./container.ts";

export function resolve(target: any, propertyName: string) {
    const original = Reflect.getMetadata('design:type', target.constructor.prototype, propertyName);

    Object.defineProperty(target.constructor.prototype, propertyName, {
        get() {
            if (this.context && this.context instanceof Container) {
                return this.context.get(original);
            }
            return this[CONTAINER_CONTEXT].get(original);
        }
    });
}