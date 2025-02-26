<?php
/**
 * Primary class file for the Jetpack VideoPress plugin.
 *
 * @package automattic/jetpack-videopress-plugin-plugin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Automattic\Jetpack\Connection\Manager as Connection_Manager;
use Automattic\Jetpack\Connection\Rest_Authentication as Connection_Rest_Authentication;
use Automattic\Jetpack\My_Jetpack\Initializer as My_Jetpack_Initializer;
use Automattic\Jetpack\Sync\Data_Settings;
use Automattic\Jetpack\VideoPress\Initializer as VideoPress_Pkg_Initializer;

/**
 * Class Jetpack_VideoPress_Plugin
 */
class Jetpack_VideoPress_Plugin {

	/**
	 * Constructor.
	 */
	public function __construct() {
		// Set up the REST authentication hooks.
		Connection_Rest_Authentication::init();

		// Init Jetpack packages and ConnectionUI.
		add_action(
			'plugins_loaded',
			function () {
				$config = new Automattic\Jetpack\Config();
				// Connection package.
				$config->ensure(
					'connection',
					array(
						'slug'     => JETPACK_VIDEOPRESS_SLUG,
						'name'     => JETPACK_VIDEOPRESS_NAME,
						'url_info' => JETPACK_VIDEOPRESS_URI,
					)
				);
				// Sync package.
				$config->ensure( 'sync', Data_Settings::MUST_SYNC_DATA_SETTINGS );

				// Identity crisis package.
				$config->ensure( 'identity_crisis' );

				$config->ensure(
					'videopress',
					array( 'admin_ui' => true )
				);
			},
			1
		);

		// Register VideoPress block
		add_action( 'init', array( $this, 'register_videopress_block' ) );

		My_Jetpack_Initializer::init();
	}

	/**
	 * Removes plugin from the connection manager
	 * If it's the last plugin using the connection, the site will be disconnected.
	 *
	 * @access public
	 * @static
	 */
	public static function plugin_deactivation() {
		$manager = new Connection_Manager( 'jetpack-videopress' );
		$manager->remove_connection();
	}

	/**
	 * Register the VideoPress block.
	 */
	public function register_videopress_block() {
		VideoPress_Pkg_Initializer::register_videopress_block();
	}
}
