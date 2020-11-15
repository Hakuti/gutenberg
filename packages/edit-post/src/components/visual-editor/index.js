/**
 * WordPress dependencies
 */
import {
	PostTitle,
	VisualEditorGlobalKeyboardShortcuts,
} from '@wordpress/editor';
import {
	WritingFlow,
	Typewriter,
	ObserveTyping,
	BlockList,
	CopyHandler,
	BlockSelectionClearer,
	MultiSelectScrollIntoView,
	__experimentalBlockSettingsMenuFirstItem,
	__experimentalUseResizeCanvas as useResizeCanvas,
	__unstableEditorStyles as EditorStyles,
	Iframe,
} from '@wordpress/block-editor';
import { Popover, DropZoneProvider } from '@wordpress/components';

/**
 * Internal dependencies
 */
import BlockInspectorButton from './block-inspector-button';
import { useSelect } from '@wordpress/data';

function VisualEditor( { settings } ) {
	const deviceType = useSelect( ( select ) => {
		return select( 'core/edit-post' ).__experimentalGetPreviewDeviceType();
	}, [] );

	const inlineStyles = useResizeCanvas( deviceType );

	return (
		<>
			<VisualEditorGlobalKeyboardShortcuts />
			<Popover.Slot name="block-toolbar" />
			<Iframe
				className="edit-post-visual-editor"
				style={ inlineStyles }
				head={ window.__editorStyles.html }
			>
				<BlockSelectionClearer>
					<DropZoneProvider>
						<EditorStyles styles={ settings.styles } />
						<MultiSelectScrollIntoView />
						<Typewriter>
							<CopyHandler>
								<WritingFlow>
									<ObserveTyping>
										<CopyHandler>
											<div className="edit-post-visual-editor__post-title-wrapper">
												<PostTitle />
											</div>
											<BlockList />
										</CopyHandler>
									</ObserveTyping>
								</WritingFlow>
							</CopyHandler>
						</Typewriter>
						<__experimentalBlockSettingsMenuFirstItem>
							{ ( { onClose } ) => (
								<BlockInspectorButton onClick={ onClose } />
							) }
						</__experimentalBlockSettingsMenuFirstItem>
					</DropZoneProvider>
				</BlockSelectionClearer>
			</Iframe>
		</>
	);
}

export default VisualEditor;
