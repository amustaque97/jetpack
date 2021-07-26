/**
 * External dependencies
 */
import { Component, createRef } from '@wordpress/element';
import ResizeObserver from 'resize-observer-polyfill';

/**
 * Internal dependencies
 */
import Column from '../column';
import Gallery from '../gallery';
import Row from '../row';
import { getGalleryRows, handleRowResize } from './resize';
import { imagesToRatios, ratiosToColumns, ratiosToMosaicRows } from './ratios';

export default class Mosaic extends Component {
	gallery = createRef();
	pendingRaf = null;
	ro = null; // resizeObserver instance

	componentDidMount() {
		this.observeResize();
	}

	componentWillUnmount() {
		this.unobserveResize();
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.images !== this.props.images || prevProps.align !== this.props.align ) {
			this.triggerResize();
		} else if ( 'columns' === this.props.layoutStyle && prevProps.columns !== this.props.columns ) {
			this.triggerResize();
		}
	}

	handleGalleryResize = entries => {
		if ( this.pendingRaf ) {
			cancelAnimationFrame( this.pendingRaf );
			this.pendingRaf = null;
		}
		this.pendingRaf = requestAnimationFrame( () => {
			for ( const { contentRect, target } of entries ) {
				const { width } = contentRect;
				const colWidths = [];
				getGalleryRows( target ).forEach( row => {
					colWidths.push( handleRowResize( row, width ) );
				} );
				if ( 'undefined' !== typeof this.props.onResize ) {
					this.props.onResize( colWidths );
				}
			}
		} );
	};

	triggerResize() {
		if ( this.gallery.current ) {
			this.handleGalleryResize( [
				{
					target: this.gallery.current,
					contentRect: { width: this.gallery.current.clientWidth },
				},
			] );
		}
	}

	observeResize() {
		this.triggerResize();
		this.ro = new ResizeObserver( this.handleGalleryResize );
		if ( this.gallery.current ) {
			this.ro.observe( this.gallery.current );
		}
	}

	unobserveResize() {
		if ( this.ro ) {
			this.ro.disconnect();
			this.ro = null;
		}
		if ( this.pendingRaf ) {
			cancelAnimationFrame( this.pendingRaf );
			this.pendingRaf = null;
		}
	}

	render() {
		const {
			align,
			columns,
			images,
			layoutStyle,
			renderedImages,
			columnWidths,
			isSave,
		} = this.props;

		const ratios = imagesToRatios( images );
		const rows =
			'columns' === layoutStyle
				? ratiosToColumns( ratios, columns )
				: ratiosToMosaicRows( ratios, { isWide: [ 'full', 'wide' ].includes( align ) } );

		let cursor = 0;
		return (
			<Gallery galleryRef={ this.gallery } isSave={ isSave }>
				{ rows.map( ( row, rowIndex ) => (
					<Row key={ rowIndex } isSave={ isSave }>
						{ row.map( ( colSize, colIndex ) => {
							const columnImages = renderedImages.slice( cursor, cursor + colSize );
							cursor += colSize;
							return (
								<Column
									isSave={ isSave }
									key={ colIndex }
									width={ columnWidths ? columnWidths[ rowIndex ][ colIndex ] : undefined }
								>
									{ columnImages }
								</Column>
							);
						} ) }
					</Row>
				) ) }
			</Gallery>
		);
	}
}
