import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import AppTheme from './colors';
import "./test.css";

// Test of context using a hook
//-----------------------------
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

// Components only test of context
//--------------------------------

const ComponentOnlyThemes = {
	light: { class: 'light' },
	dark: { class: 'dark' },
}
const ComponentOnlyTheme = React.createContext(ComponentOnlyThemes.light);

class ComponentOnlyBtn extends React.Component {
	static contextType = ComponentOnlyTheme;
	constructor(props) {
		super(props);
		this.handleThemeToggle = this.handleThemeToggle.bind(this);
	}
	handleThemeToggle() { this.props.toggleTheme(); }
	render() {
		return (
			<React.Fragment>
				<br />
				<span style={{cursor: "pointer", border: "1px solid red", marginTop: "1rem", display: "inline-block"}} onClick={this.handleThemeToggle}>
					Toggle this section theme (actually {this.context.class})
				</span>
			</React.Fragment>
		);
	}
}
class ComponentOnlyTest extends React.Component {
	static contextType = ComponentOnlyTheme;
	constructor() {
		super();
		this.state = { theme: ComponentOnlyThemes.dark };
		this.handleThemeToggle = this.handleThemeToggle.bind(this);
	}
	handleThemeToggle() {
		this.setState(state => ({ theme: state.theme === ComponentOnlyThemes.dark ? ComponentOnlyThemes.light : ComponentOnlyThemes.dark }));
	}
	render() {
		console.log(this.state.theme);
		return (
			<ThemeContext.Provider value={this.state.theme}>
				<div style={{ marginTop: "2rem" }} className={this.state.theme.class}>
					ComponentTestOnly
					<ComponentOnlyBtn toggleTheme={this.handleThemeToggle}/>
				</div>
			</ThemeContext.Provider>
		);
	}
}

// Bootstrap
//----------

const LazyComponent = React.lazy(() => { return (new Promise((resolve) => setTimeout(resolve, 1 * 1000)).then(() => import("./lazycomponent"))); });

function LazyTest() {
	const themeHook = React.useState("light");
	return (
		<div>
			<ThemeContext.Provider value={themeHook}>
				<div style={AppTheme[themeHook[0]]} width="50vh">
					<Suspense fallback={<div>Loading...</div>}>
						<InnerContent />
					</Suspense>
				</div>
			</ThemeContext.Provider>
			<ComponentOnlyTest />
		</div>
	);
}
ReactDOM.render(<LazyTest />, document.getElementById('root'));
