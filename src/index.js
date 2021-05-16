/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React, { Suspense, Profiler, useState } from 'react';
import ReactDOM from 'react-dom';
import { AppTheme, UseContextTheme } from './colors';
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
	handleToggle() { this.themeToggler(this.themeColor === "light" ? "dark" : "light"); }
	render() {
		[this.themeColor, this.themeToggler] = this.context;
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
				{ themeHook => {
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
// HOC wrapper
// 1) need a const instantiation to update during each rerendering (else is it fully recreated)
// 2) il parent pass a ref, have to pass it by calling React.forwardRef, and not only the wrapper class
function propsLoggerWrapper(ClassToLog) {
	class PropsLogger extends React.Component {
		componentDidUpdate(prevProps) {
			console.log("(Logger) Previous:", prevProps);
			console.log("(Logger) New:", this.props);
		}
		render() {
			return <ClassToLog innerRef={this.props.innerRef} {...this.props} />;
		}
	}
	PropsLogger.displayName = "PropsLogger(" + (ClassToLog.displayName || ClassToLog.name || 'Component') + ")";

	return React.forwardRef((props, ref) => <PropsLogger innerRef={ref} {...props} />);
}
const FancySpan = propsLoggerWrapper(FancySpanComponent);
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

// Context hook in functionnal component
//--------------------------------------

const HookContext = React.createContext({ selectedTheme: UseContextTheme.light, themeSetter: () => {} });

function ContextHookInfo(props) {
	const themeContext = React.useContext(HookContext);		// useContext hook testing without the need of a provider
	const [parentStateData, setParentStateData] = (
		props.parentHook === undefined ? [undefined, undefined] : props.parentHook );
	const additionnalBtn = (
		parentStateData === undefined ?
			null :
			(<button onClick={() => setParentStateData(!parentStateData)}>Change parrent other hook ({parentStateData ? "true" : "false"})</button>)
	);
	return (
		<div style={{border: "1px solid black", margin: "10px"}}>
			<p style={themeContext.selectedTheme.style}>Hook {props.name} theme color is {themeContext.selectedTheme.name}</p>
			<p>{props.comment}</p>
			<button onClick={() => themeContext.themeSetter(themeContext.selectedTheme === UseContextTheme.light ? UseContextTheme.dark : UseContextTheme.light) }>Change hook theme</button>
			{additionnalBtn}
		</div>
	);
}

// Bootstrap
//----------

const LazyComponent = React.lazy(() => { return (new Promise((resolve) => setTimeout(resolve, 1 * 1000)).then(() => import("./lazycomponent"))); });

function LazyTest() {
	const themeHook = React.useState("light");
	const [useContextSelectedTheme, useContextThemeSetter] = useState(UseContextTheme.dark);
	const parentHook = useState(true);
	function ProfilerUpdated(...args) {
		console.log("Rendering time: " + args[2]);
	}
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
			<Profiler id="TestProfiler" onRender={ProfilerUpdated}>
				<ComponentOnlyTest />
				<ComponentOnlyBISTest />
				<HookContext.Provider value={{ selectedTheme: useContextSelectedTheme, themeSetter: useContextThemeSetter}}>
					<ContextHookInfo name="with provider" comment="will take the provider value and will be able to change it" parentHook={parentHook} />
				</HookContext.Provider>
				<ContextHookInfo name="without provider" comment="Will take the context default value and won't be about to change it" />
			</Profiler>
		</div>
	);
}
ReactDOM.render(<LazyTest />, document.getElementById('root'));
