import { ReactWidgetController } from '@beyond-js/react-18-widgets/base';
import { Widget } from './views';
import { StoreManager } from './store';
export /*bundle*/
class Controller extends ReactWidgetController {
	#store: StoreManager;
	createStore() {
		this.#store = new StoreManager();
		return this.#store;
	}
	get Widget() {
		return Widget;
	}
}
