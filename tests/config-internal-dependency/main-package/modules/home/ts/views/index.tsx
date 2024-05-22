import * as React from 'react';
import config from 'dependency-package/config';

export /*bundle*/
function View(): JSX.Element {
	console.log('dependency-package/config', config, config.package);

	return (
		<div className="page__container">
			<h1>
				My first page using BeyondJS with <span className="beyond">React</span>!
			</h1>
		</div>
	);
}
