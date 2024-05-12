import { ClassType } from "../types";
import { Container } from "../shared/container.ts";

export function Injectable(target: ClassType) {
    Container.add(target);
}