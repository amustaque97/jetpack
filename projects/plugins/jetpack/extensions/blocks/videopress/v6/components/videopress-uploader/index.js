/**
 * External dependencies
 */
import { BlockIcon, MediaPlaceholder } from '@wordpress/block-editor';
import { withNotices } from '@wordpress/components';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useRef } from 'react';
/**
 * Internal dependencies
 */
import { useResumableUploader } from '../../hooks/use-uploader.js';
import { description, title } from '../../index.js';
import { VideoPressIcon } from '../icons';
import UploadError from './uploader-error.js';
import UploadProgress from './uploader-progress.js';

import './style.scss';

const ALLOWED_MEDIA_TYPES = [ 'video' ];

const VideoPressUploader = ( {
	attributes,
	setAttributes,
	noticeUI,
	noticeOperations,
	handleDoneUpload,
} ) => {
	const [ uploadPaused, setUploadPaused ] = useState( false );
	const [ uploadCompleted, setUploadCompleted ] = useState( false );
	const [ isUploadingInProgress, setIsUploadingInProgress ] = useState( false );
	const tusUploader = useRef( null );

	/*
	 * Storing the file to get it name and size for progress.
	 */
	const [ uploadFile, setFile ] = useState( null );

	/*
	 * Tracking state when uploading the video file.
	 * uploadingProgress is an array with two items:
	 *  - the first item is the upload progress
	 *  - the second item is total
	 */
	const [ uploadingProgress, setUploadingProgressState ] = useState( [] );

	// Define a memoized function to register the upload progress.
	const setUploadingProgress = useCallback( function ( ...args ) {
		setUploadingProgressState( args );
	}, [] );

	/*
	 * Tracking error data
	 */
	const [ uploadErrorData, setUploadErrorDataState ] = useState( null );

	// Define a memoized function to register the error data.
	const setUploadErrorData = useCallback( function ( error ) {
		if ( error?.originalResponse ) {
			try {
				// parse failed request response message
				const body = error?.originalResponse?.getBody?.();
				const parsedBody = JSON.parse( body );
				setUploadErrorDataState( parsedBody );
				return;
			} catch {}
		}

		setUploadErrorDataState( error );
	}, [] );

	/*
	 * Handle upload success
	 */
	const handleUploadSuccess = attr => {
		setAttributes( attr );
		setUploadCompleted( true );
	};

	// Helper instance to upload the video to the VideoPress infrastructure.
	const [ videoPressUploader ] = useResumableUploader( {
		onError: setUploadErrorData,
		onProgress: setUploadingProgress,
		onSuccess: handleUploadSuccess,
	} );

	// Returns true if the object represents a valid host for a VideoPress video.
	// Private vidoes are hosted under video.wordpress.com
	const isValidVideoPressUrl = urlObject => {
		const validHosts = [ 'videopress.com', 'video.wordpress.com' ];
		return urlObject.protocol === 'https:' && validHosts.includes( urlObject.host );
	};

	/**
	 * Helper function to pick up the guid
	 * from the VideoPress URL.
	 *
	 * @param {string} url - VideoPress URL.
	 * @returns {void}       The guid picked up from the URL. Otherwise, False.
	 */
	const getGuidFromVideoUrl = url => {
		try {
			const urlObject = new URL( url );
			if ( isValidVideoPressUrl( urlObject ) ) {
				const videoGuid = urlObject.pathname.match( /^\/v\/([a-zA-Z0-9]+)$/ );
				return videoGuid.length === 2 ? videoGuid[ 1 ] : false;
			}
		} catch ( e ) {
			return false;
		}
	};

	/**
	 * Handler to add a video via an URL.
	 *
	 * @param {string} videoUrl - URL of the video to attach
	 */
	function onSelectURL( videoUrl ) {
		const videoGuid = getGuidFromVideoUrl( videoUrl );
		if ( ! videoGuid ) {
			setUploadErrorDataState( { data: { message: __( 'Invalid VideoPress URL', 'jetpack' ) } } );
			return;
		}

		// Update guid based on the URL.
		setAttributes( { guid: videoGuid, src: videoUrl } );
		handleDoneUpload();
	}

	const startUpload = file => {
		// reset error
		if ( uploadErrorData ) {
			setUploadErrorData( null );
		}

		setFile( file );
		setUploadingProgress( 0, file.size );
		setIsUploadingInProgress( true );

		// Upload file to VideoPress infrastructure.
		tusUploader.current = videoPressUploader( file );
	};

	const pauseOrResumeUpload = () => {
		const uploader = tusUploader?.current;

		if ( uploader ) {
			const uploaderCall = uploadPaused ? 'start' : 'abort';
			uploader[ uploaderCall ]();
			setUploadPaused( ! uploadPaused );
		}
	};

	/**
	 * Uploading file handler.
	 *
	 * @param {File} media - media file to upload
	 * @returns {void}
	 */
	function onSelectVideo( media ) {
		const isFileUploading = null !== media && media instanceof FileList;

		// Handle upload by selecting a File
		if ( isFileUploading ) {
			const file = media[ 0 ];
			startUpload( file );
			return;
		}

		// Handle selection of Media Library VideoPress attachment
		if ( media.videopress_guid ) {
			const videoGuid = media.videopress_guid[ 0 ];
			const videoUrl = `https://videopress.com/v/${ videoGuid }`;
			if ( getGuidFromVideoUrl( videoUrl ) ) {
				return onSelectURL( videoUrl );
			}
		}

		setUploadErrorDataState( {
			data: {
				message: __(
					'Please select a VideoPress video from Library or upload a new one',
					'jetpack'
				),
			},
		} );
	}

	// Showing error if upload fails
	if ( uploadErrorData ) {
		const onRetry = () => {
			startUpload( uploadFile );
		};

		const onCancel = () => {
			setFile( null );
			setUploadingProgress( [] );
			setUploadErrorData( null );
			setIsUploadingInProgress( false );
		};

		return <UploadError onRetry={ onRetry } onCancel={ onCancel } errorData={ uploadErrorData } />;
	}

	// Uploading file to backend
	if ( isUploadingInProgress ) {
		const progress = ( uploadingProgress[ 0 ] / uploadingProgress[ 1 ] ) * 100;
		return (
			<UploadProgress
				attributes={ attributes }
				setAttributes={ setAttributes }
				file={ uploadFile }
				progress={ progress }
				paused={ uploadPaused }
				completed={ uploadCompleted }
				onPauseOrResume={ pauseOrResumeUpload }
				onDone={ handleDoneUpload }
			/>
		);
	}

	// Default view to select file to upload
	return (
		<MediaPlaceholder
			handleUpload={ false }
			className="is-videopress-placeholder"
			icon={ <BlockIcon icon={ VideoPressIcon } /> }
			labels={ {
				title,
				instructions: description,
			} }
			onSelect={ onSelectVideo }
			onSelectURL={ onSelectURL }
			accept="video/*"
			allowedTypes={ ALLOWED_MEDIA_TYPES }
			value={ attributes }
			notices={ noticeUI }
			onError={ function ( error ) {
				noticeOperations.removeAllNotices();
				noticeOperations.createErrorNotice( error );
			} }
		/>
	);
};

export default withNotices( VideoPressUploader );
