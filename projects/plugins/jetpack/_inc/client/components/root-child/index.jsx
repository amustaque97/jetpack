/** @ssr-ready **/

import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';

export default class RootChild extends React.Component {
	static displayName = 'RootChild';

	static propTypes = {
		children: PropTypes.node,
	};

	static contextTypes = {
		store: PropTypes.object,
	};

	componentDidMount() {
		this.container = document.createElement( 'div' );
		document.body.appendChild( this.container );
		this.renderChildren();
	}

	componentDidUpdate() {
		this.renderChildren();
	}

	componentWillUnmount() {
		if ( ! this.container ) {
			return;
		}

		ReactDom.unmountComponentAtNode( this.container );
		document.body.removeChild( this.container );
		delete this.container;
	}

	renderChildren = () => {
		let content;

		if ( this.props && ( Object.keys( this.props ).length > 1 || ! this.props.children ) ) {
			content = <div { ...this.props }>{ this.props.children }</div>;
		} else {
			content = this.props.children;
		}

		// Context is lost when creating a new render hierarchy, so ensure that
		// we preserve the context that we care about
		if ( this.context.store ) {
			content = <ReduxProvider store={ this.context.store }>{ content }</ReduxProvider>;
		}

		ReactDom.render( content, this.container );
	};

	render() {
		return null;
	}
}
