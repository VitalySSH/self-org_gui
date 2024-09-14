import { ModelConfig } from "../interfaces";

export class ApiModel {
    id!: string;
    [key: string]: any;

    get entityName(): string {
        const config = this.modelConfig;

        return config.entityName;
    }

    get modelConfig(): ModelConfig {
        return Reflect.getMetadata('ModelConfig', this.constructor);
    }

    public get attributes(): object {
        return Reflect.getMetadata('Attribute', this);
    }

    public get oneToMany(): object {
        return Reflect.getMetadata('OneToMany', this) || {};
    }

    public get manyToMany(): object {
        return Reflect.getMetadata('ManyToMany', this) || {};
    }

}