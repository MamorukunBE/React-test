import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import AppTheme from './colors';
import "./test.css";

const LazyComponent = React.lazy(() => { return (new Promise((resolve) => setTimeout(resolve, .1 * 1000)).then(() => import("./lazycomponent"))); });
const ThemeContext = React.createContext([null, () => {}]);

class ThemeToggler extends React.Component {
	static contextType = ThemeContext;
	static ownStyle = { cursor: "pointer", border: "1px solid red" };
	constructor(props) {
		super(props);		
		this.handleToggle = this.handleToggle.bind(this);
	}
	componentDidMount() {
		this.themeToggler = this.context[1];
	}
	handleToggle() { this.themeToggler(this.themeColor === "light" ? "dark" : "light"); }
	render() {
		this.themeColor = this.context[0];
		return (<span style={ThemeToggler.ownStyle} onClick={this.handleToggle}>Toggle actuel {this.themeColor} theme</span>); }
}
class InnerContent extends React.Component {
	static contextType = ThemeContext;
	render() {
		document.body.style.backgroundColor = AppTheme[this.context[0]].backgroundColor;
		return (
			<div style={AppTheme[this.context[0]]}>
				<LazyComponent />
				Simple display<br /><br />
				<ThemeToggler />
			</div>
		);
	}
}

function LazyTest() {
	const themeHook = React.useState("light");
	return (
		<ThemeContext.Provider value={themeHook}>
			<div style={AppTheme[themeHook[0]]} width="50vh">
				<Suspense fallback={<div>Loading...</div>}>
					<InnerContent />
				</Suspense>
			</div>
		</ThemeContext.Provider>
	);
}
ReactDOM.render(<LazyTest />, document.getElementById('root'));
