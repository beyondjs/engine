import * as React from "react";

export /*bundle*/
type AppProps = {
    message: string;
};

export /*bundle*/
const Header = ({message}: AppProps): JSX.Element => {
    return <h2>{message}</h2>;
}