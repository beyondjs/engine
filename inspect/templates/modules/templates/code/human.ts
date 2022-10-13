import {Animal} from "./animal";

class Human extends Animal {
    legs = 2;

    welcome(): string {
        return `Guau ${this.name}`;
    }
}
