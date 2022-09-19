import * as React from "react";
import {routing} from "@beyond-js/kernel/routing";

const navigate = event => routing.pushState(event.currentTarget.dataset.url);

export /*bundle*/
class Menu extends React.Component {
    render() {
        const menu = [{url: '/', title: 'Home'}, {url: '/users', title: 'Usuarios'}];

        const items = [];
        for (const {url, title} of menu) {
            items.push(
                <div key={url} className="item" onClick={navigate} data-url={url}>
                    {title}
                </div>
            );
        }
        return (<aside>{items}</aside>);
    }
}