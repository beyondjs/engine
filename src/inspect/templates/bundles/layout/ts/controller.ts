import { ReactWidgetController } from '@beyond-js/react-18-widgets/base';
import { Layout } from './views';

export /*bundle*/
class Controller extends ReactWidgetController {
	get Widget() {
		return Layout;
	}
}
