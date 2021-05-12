import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
// const LazyComponent = React.lazy(() => import("./lazycomponent"));
const LazyComponent = React.lazy(() => { return (new Promise((resolve) => setTimeout(resolve, 1 * 1000)).then(() => import("./lazycomponent"))); });

class LazyTest extends React.Component {
	render() {
		return (
			<div>
				<Suspense fallback={<div>Loading...</div>}>
					<React.Fragment>
						<LazyComponent />
						Simple display
					</React.Fragment>
				</Suspense>
			</div>
		);
	}
}
ReactDOM.render(<LazyTest />, document.getElementById('root'));
