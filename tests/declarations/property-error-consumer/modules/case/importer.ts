//your code here
// src/a.ts
import { Exporter } from '@beyond-js/property-error-declarations/to-export';

export /*bundle*/ class Importer {
	#b: Exporter;
	get metadata() {
		return this.#b.metadata;
	}
	main() {
		const b = new Exporter();
		this.#b = b;
		console.log(b.metadata);
	}
}
