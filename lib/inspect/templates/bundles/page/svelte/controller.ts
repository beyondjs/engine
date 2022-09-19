import {PageSvelteWidgetController} from '@beyond-js/svelte-widgets/page';
import type {SvelteComponent} from 'svelte';
import Widget from "./widget.svelte";

export /*bundle*/
class Controller extends PageSvelteWidgetController {
    get Widget(): SvelteComponent {
        return Widget;
    }
}
