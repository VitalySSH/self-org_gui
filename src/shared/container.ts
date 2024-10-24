import 'reflect-metadata';
import { v4 } from 'uuid';
import { ClassType } from "../types";

type AliasType = (modelMetadata: Container) => ClassType;

interface IRegister {
    [key: string]: {
        Target: ClassType
        alias?: AliasType
    }
}

interface IInstances {
    [key: string]: ClassType
}

export const CONTAINER_ID = Symbol('CONTAINER_ID');
export const CONTAINER_CONTEXT = Symbol('CONTAINER_CONTEXT');

export class Container {

    private static context = new Container();
    private static register: IRegister = {};
    private instances: IInstances = {};

    public static add(target: ClassType) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (!target[CONTAINER_ID]) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            target[CONTAINER_ID] = v4();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            this.register[target[CONTAINER_ID]] = {
                Target: target
            }
        }
    }

    public static getContext() {
        return this.context;
    }

    public static set(target: any, alias: any) {
        this.register[target[CONTAINER_ID]].alias = alias;
    }

    public get<T>(target: any): T {
        const instanceKey = target[CONTAINER_ID];

        if (!this.instances[instanceKey]) {
            const { alias, Target } =
                Container.register[instanceKey];
            const model = alias ? alias(this) : new Target();

            this.instances[instanceKey] = model;
            model[CONTAINER_CONTEXT] = this;

            if (model.init) {
                model.init();
            }

        }

        return this.instances[instanceKey] as any;
    }

    public destroy() {
        this.instances = {};
    }

}