interface IInterface {
	[key: string]: any;
}
// src/b.ts
export class B implements IInterface {
	#element: HTMLElement | null;
	[key: string]: any;
	get element() {
		return this.#element;
	}
}
