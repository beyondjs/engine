import * as React from "react";
import {Header} from "$[scope]$[name]/header";

export /*bundle*/
function View(): JSX.Element {
    const header = Header({message: 'My first module with BeyondJS'});

    return <h1>{header}</h1>;
}