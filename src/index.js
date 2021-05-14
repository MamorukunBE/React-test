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
		return (
			<ComponentOnlyTheme.Provider value={this.state.theme}>
				<div style={{ marginTop: "2rem" }} className={this.state.theme.class}>
					ComponentOnlyTest
					<ComponentOnlyBtn toggleTheme={this.handleThemeToggle}/>
				</div>
			</ComponentOnlyTheme.Provider>
		);
	}
}

// Components only test of context (with set function)
//----------------------------------------------------

const ConsumerTestThemes = {
	light: { class: 'light' },
	dark: { class: 'dark' },
}
const ConsumerTestTheme = React.createContext({
	theme: ConsumerTestThemes.light,
	toggler: () => { }
});

class ConsumerBtn extends React.Component {
	render() {
		return (
			<ConsumerTestTheme.Consumer>
				{({theme, toggler}) => {
					return (
						<React.Fragment>
							<br />						
							<span style={{ cursor: "pointer", border: "1px solid red", marginTop: "1rem", display: "inline-block" }} onClick={toggler}>
								Toggle this section theme (actually {theme.class})
							</span>
						</React.Fragment>
					)
				}}
			</ConsumerTestTheme.Consumer>
		);
	}
}
class ComponentOnlyBISTest extends React.Component {
	static contextType = ConsumerTestTheme;
	constructor() {
		super();
		this.handleThemeToggle = this.handleThemeToggle.bind(this);
		this.state = {
			themeData: {
				theme: ConsumerTestThemes.dark,
				toggler: this.handleThemeToggle
			}
		};
	}
	handleThemeToggle() {
		this.setState(state => ({ themeData: {...state.themeData, theme: state.themeData.theme === ConsumerTestThemes.dark ? ConsumerTestThemes.light : ConsumerTestThemes.dark }}));
	}
	render() {
		return (
			<ConsumerTestTheme.Provider value={this.state.themeData}>
				<div style={{ marginTop: "2rem" }} className={this.state.themeData.theme.class}>
					ComponentOnlyBISTest
					<ConsumerBtn />
				</div>
			</ConsumerTestTheme.Provider>
		);
	}
}

// Forwarding ref
//---------------

class FancySpanComponent extends React.Component {
	render() {
		return (
			<ThemeContext.Consumer>
				{themeHook => {
					return (
						<span ref={this.props.innerRef} className={this.props.className + " " + themeHook[0] }>
							{ this.props.children }
							<div style={{ textAlign: "center" }}>rand: {this.props.randomData}</div>
						</span>
					)
				}}
			</ThemeContext.Consumer>
		);
	}
}
function propsLoggerWrapper(ClassToLog) {
	return class PropsLogger extends React.Component {
		componentDidUpdate(prevProps) {
			console.log("(Logger) Previous:", prevProps);
			console.log("(Logger) New:", this.props);
		}
		render() {
			return <ClassToLog innerRef={this.ref} {...this.props} />;
		}
	}
};
// Use a tmp object to prevent recreating it each React.forwardRef() call, thus dismounting and remonting the component at every rerender
const FancySpanTemp = propsLoggerWrapper(FancySpanComponent);
const FancySpan = React.forwardRef((props, ref) => <FancySpanTemp innerRef={ref} {...props} />);
class RefForwarder extends React.Component {
	constructor() {
		super();
		this.btnRef = React.createRef();
		this.handleRandomizerClick = this.handleRandomizerClick.bind(this);
	}
	handleRandomizerClick() {
		this.btnRef.current.style.backgroundColor = "rgb(" + (Math.random() * 256) + "," + (Math.random() * 256) + "," + (Math.random() * 256) + ")";
	}
	render() {
		return (
			<div>
				<FancySpan ref={this.btnRef} className="fancy" randomData={Math.floor(Math.random() * 100)}>
					My fancy span
				</FancySpan>
				<button onClick={this.handleRandomizerClick}>
					Change ref color
				</button>
			</div>
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
				<RefForwarder />
			</ThemeContext.Provider>
			<ComponentOnlyTest />
			<ComponentOnlyBISTest />
		</div>
	);
}
ReactDOM.render(<LazyTest />, document.getElementById('root'));
