//your code here
// src/a.ts
import { B } from './b';

export /*bundle*/ class Exporter {
	#b: B;
	get metadata() {
		return this.#b.metadata;
	}

	main() {
		const b = new B();
		this.#b = b;
	}
}
