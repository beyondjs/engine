import './hmr';
import {bees} from './bees';

export /*bundle*/ const local = new class BeyondLocal {
    get bees() {
        return bees;
    }
}
