import {Animal} from "./animal";

export /*bundle*/
class Dog extends Animal {
    legs = 4;

    welcome(): string {
        return `Guau ${this.name}`;
    }
}
