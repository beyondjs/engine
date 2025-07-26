import {PageReactWidgetController} from '@beyond-js/react-widgets/page';
import {View} from "./views";

export /*bundle*/
class Controller extends PageReactWidgetController {
    get Widget() {
        return View;
    }
}