import * as React from "react";

const Header = ({title}) => (<header><h1>{title}</h1></header>);

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "menu-layout": any;
            "beyond-layout-children": any;
        }
    }
}

export /*bundle*/
class Layout extends React.Component {
    render() {
        return (
            <div className="main-widget">
                <Header title="Web App"/>
                <div className="content">
                    <div className="aside-panel">
                        <menu-layout/>
                    </div>
                    <main>
                        <beyond-layout-children/>
                    </main>
                </div>
            </div>
        );
    }
}