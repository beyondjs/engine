import {ReactWidgetController} from '@beyond-js/react-widgets/base';
import {Widget} from "./views";

export /*bundle*/
class Controller extends ReactWidgetController {
    get Widget() {
        return Widget;
    }
}