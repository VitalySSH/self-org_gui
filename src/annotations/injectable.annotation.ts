import { ClassType } from "src/types";
import { Container } from "./container.ts";

export function Injectable(target: ClassType) {
    Container.add(target);
}