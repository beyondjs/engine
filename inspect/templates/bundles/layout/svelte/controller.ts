import {SvelteWidgetController} from '@beyond-js/svelte-widgets/base';
import type {SvelteComponent} from 'svelte';
import Widget from "./widget.svelte";

export /*bundle*/
class Controller extends SvelteWidgetController {
    get Widget(): SvelteComponent {
        return Widget;
    }
}
