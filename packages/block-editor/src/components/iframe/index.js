/**
 * WordPress dependencies
 */
import { useState, useEffect, createPortal, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

function IframeContent( { doc, head, children } ) {
	useEffect( () => {
		const { defaultView } = doc;
		const { frameElement } = defaultView;

		doc.body.className = 'editor-styles-wrapper';
		doc.body.style.margin = '0px';
		doc.head.innerHTML = head;
		doc.dir = document.dir;

		[ ...document.styleSheets ].reduce( ( acc, styleSheet ) => {
			try {
				const isMatch = [ ...styleSheet.cssRules ].find(
					( { selectorText } ) => {
						return (
							selectorText.indexOf( '.editor-styles-wrapper' ) !==
							-1
						);
					}
				);

				if ( isMatch ) {
					const node = styleSheet.ownerNode;

					if ( ! doc.getElementById( node.id ) ) {
						doc.head.appendChild( node.cloneNode( true ) );
					}
				}
			} catch ( e ) {}

			return acc;
		}, [] );

		function bubbleEvent( event ) {
			const prototype = Object.getPrototypeOf( event );
			const constructorName = prototype.constructor.name;
			const Constructor = window[ constructorName ];

			const init = {};

			for ( const key in event ) {
				init[ key ] = event[ key ];
			}

			if ( event.view && event instanceof event.view.MouseEvent ) {
				const rect = frameElement.getBoundingClientRect();
				init.clientX += rect.left;
				init.clientY += rect.top;
			}

			const newEvent = new Constructor( event.type, init );
			const cancelled = ! frameElement.dispatchEvent( newEvent );

			if ( cancelled ) {
				event.preventDefault();
			}
		}

		const eventTypes = [ 'keydown', 'keypress', 'dragover' ];

		eventTypes.forEach( ( name ) => {
			doc.addEventListener( name, bubbleEvent );
		} );

		return () => {
			eventTypes.forEach( ( name ) => {
				doc.removeEventListener( name, bubbleEvent );
			} );
		};
	}, [ doc ] );

	return createPortal( children, doc.body );
}

export default function Iframe( { children, head, ...props } ) {
	const [ contentDocument, setContentDocument ] = useState();
	const ref = useRef();

	function setDocumentIfReady( doc ) {
		const { readyState } = doc;

		if ( readyState === 'interactive' || readyState === 'complete' ) {
			setContentDocument( doc );
		}
	}

	useEffect( () => {
		setDocumentIfReady( ref.current.contentDocument );
	}, [] );

	function setRef( newRef ) {
		ref.current = newRef;

		if ( newRef ) {
			setDocumentIfReady( newRef.contentDocument );
		}
	}

	return (
		<iframe
			{ ...props }
			ref={ setRef }
			title={ __( 'Editor canvas' ) }
			name="editor-canvas"
			onLoad={ () => {
				// Document is not immediately loaded in Firefox.
				setDocumentIfReady( ref.current.contentDocument );
			} }
		>
			{ contentDocument && (
				<IframeContent doc={ contentDocument } head={ head }>
					{ children }
				</IframeContent>
			) }
		</iframe>
	);
}
