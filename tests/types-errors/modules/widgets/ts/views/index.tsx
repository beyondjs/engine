import * as React from 'react';

export /*bundle*/
function View() {
	const [element, setElement] = React.useState<string>('widget-b-error');
	const Component = element;

	const text = element === 'widget-a-error' ? 'Widget A' : 'Widget B';
	const nextControl = 'widget-b-error' === element ? 'widget-a-error' : 'widget-b-error';
	console.log(element);
	return (
		<div>
			<h2>Error unmounting web components</h2>

			<button onClick={() => setElement(nextControl)}>{text}</button>
			<Component />
		</div>
	);
}
