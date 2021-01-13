/* global _wpmejsSettings, MediaElementPlayer */

/**
 * External dependencies
 */
import { throttle } from 'lodash';

/**
 * WordPress dependencies
 */
import { useEffect, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { speak } from '@wordpress/a11y';
import { dispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STATE_PLAYING, STATE_PAUSED, STATE_ERROR, STORE_ID } from '../../../store/media-source/constants';

/**
 * Style dependencies
 */
import './style.scss';

// MediaElement global settings.
const meJsSettings = typeof _wpmejsSettings !== 'undefined' ? _wpmejsSettings : {};

function createJumpButton( containerClass, label, clickHandler ) {
	const buttonContainer = document.createElement( 'div' );
	buttonContainer.className = containerClass;

	const button = document.createElement( 'button' );
	button.innerText = label;
	button.addEventListener( 'click', clickHandler );
	button.setAttribute( 'aria-label', label );
	button.setAttribute( 'title', label );
	buttonContainer.appendChild( button );
	return buttonContainer;
}

function AudioPlayer( {
	trackSource,
	onPlay,
	onPause,
	onError,
	onTimeChange,
	onSkipForward,
	onJumpBack,
	currentTime = 0,
	playStatus = STATE_PAUSED,
	playerId,
} ) {
	const audioRef = useRef();

	/**
	 * Play current audio.
	 *
	 * @public
	 */
	const play = () => {
		// Ignoring exceptions as they are handled globally from the audio element.
		audioRef.current.play().catch( () => {} );
	};

	/**
	 * Pause current audio.
	 *
	 * @public
	 */
	const pause = () => {
		audioRef.current.pause();
		speak( __( 'Paused', 'jetpack' ), 'assertive' );
	};

	useEffect( () => {
		const audio = audioRef.current;
		const mediaElement = new MediaElementPlayer( audio, meJsSettings );

		// Try to catch play event from the media player button.
		const playButton = mediaElement.container?.[ 0 ]?.querySelector( '.mejs-play button' );
		function onPlayButtonHandler( event ) {
			event.preventDefault();
			event.stopPropagation();

			if ( audio?.error ) {
				return onError( audio.error );
			}

			if ( audio?.paused ) {
				return play();
			}

			pause();
		}

		// Add the skip and jump buttons if needed
		if ( onJumpBack || onSkipForward ) {
			const containerClass = `${ mediaElement.options.classPrefix }button ${ mediaElement.options.classPrefix }jump-button`;

			if ( onJumpBack ) {
				const buttonClass = `${ containerClass } ${ mediaElement.options.classPrefix }jump-backward-button`;
				mediaElement.addControlElement(
					createJumpButton( buttonClass, __( 'Jump Back', 'jetpack' ), onJumpBack ),
					'jumpBackwardButton'
				);
			}

			if ( onSkipForward ) {
				const buttonClass = `${ containerClass } ${ mediaElement.options.classPrefix }skip-forward-button`;
				mediaElement.addControlElement(
					createJumpButton( buttonClass, __( 'Skip Forward', 'jetpack' ), onSkipForward ),
					'skipForwardButton'
				);
			}
		}
		onPlay && audio.addEventListener( 'play', onPlay );
		onPause && audio.addEventListener( 'pause', onPause );
		onError && audio.addEventListener( 'error', onError );
		playButton && playButton.addEventListener( 'click', onPlayButtonHandler );

		dispatch( STORE_ID ).setMediaElementDomReference( playerId, audioRef.current.id );

		return () => {
			// Cleanup.
			mediaElement.remove();
			onPlay && audio.removeEventListener( 'play', onPlay );
			onPause && audio.removeEventListener( 'pause', onPause );
			onError && audio.removeEventListener( 'error', onError );
			playButton && playButton.removeEventListener( 'click', onPlayButtonHandler );
		};
	}, [ audioRef, onPlay, onPause, onError, onJumpBack, onSkipForward, playerId ] );

	/*
	 * `playStatus` property handleing.
	 */
	useEffect( () => {
		// Get the current status of the audio element and the required action to toggle it.
		const [ audioStatus, action ] = audioRef.current?.paused === false
			? [ STATE_PLAYING, pause ]
			: [ STATE_PAUSED, play ];

		if ( STATE_ERROR !== playStatus && audioStatus !== playStatus ) {
			action();
		}
	}, [ audioRef, playStatus ] );

	useEffect( () => {
		if ( ! onTimeChange ) {
			return;
		}
		//Add time change event listener
		const audio = audioRef.current;
		const throttledTimeChange = throttle( time => onTimeChange( time ), 1000 );
		const onTimeUpdate = e => throttledTimeChange( e.target.currentTime );
		onTimeChange && audio?.addEventListener( 'timeupdate', onTimeUpdate );

		return () => {
			audio?.removeEventListener( 'timeupdate', onTimeUpdate );
		};
	}, [ audioRef, onTimeChange ] );

	//Check current time against prop and potentially jump
	useEffect( () => {
		const audio = audioRef.current;

		// If there's no audio component or we're not controlling time with the `currentTime` prop,
		// then bail early.
		if ( ! currentTime || ! audio ) {
			return;
		}

		// We only want to change the play position if the difference between our current play position
		// and the prop is greater than 1. We're throttling the time change events to once per second, so
		// if the floored time has changed by more than a second, we haven't received an event in the past
		// two seconds. That's unlikely and so a change of more than a second should be as a result of us
		// wanting to update the position, so we set the audio element's current time as a result.
		if ( Math.abs( Math.floor( currentTime - audio.currentTime ) ) > 1 ) {
			audio.currentTime = currentTime;
		}
	}, [ audioRef, currentTime ] );

	return (
		<div className="jetpack-audio-player">
			{ /* eslint-disable-next-line jsx-a11y/media-has-caption */ }
			<audio src={ trackSource } ref={ audioRef }></audio>
		</div>
	);
}

export default AudioPlayer;
