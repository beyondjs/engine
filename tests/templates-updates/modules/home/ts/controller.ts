import { PageReactWidgetController } from '@beyond-js/react-18-widgets/page';
import { Page } from './views';

export /*bundle*/
class Controller extends PageReactWidgetController {
	get Widget() {
		return Page;
	}
}
