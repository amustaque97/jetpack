/**
 * External dependencies
 */
import { TouchableWithoutFeedback, View } from 'react-native';

/**
 * WordPress dependencies
 */
import { Icon } from '@wordpress/components';

/**
 * Internal dependencies
 */
import SvgIconCustomize from './icon-customize';
import styles from './editor.scss';

const StoryEditingButton = ( {
	onEditButtonTapped,
} ) => {
	return (
		<TouchableWithoutFeedback onPress={ console.log("button pressed") }>
			<View style={ styles.editContainer }>
				<View style={ styles.edit }>
					{/* { mediaOptions() } */}
					<Icon
						size={ 16 }
						icon={ SvgIconCustomize }
						{ ...styles.iconCustomise }
					/>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
};

export default StoryEditingButton;
