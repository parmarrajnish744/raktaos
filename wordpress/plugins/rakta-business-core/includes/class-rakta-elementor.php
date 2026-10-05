<?php
/**
 * Rakta Elementor Widgets Registration
 */

if (!defined('ABSPATH')) {
    exit;
}

class Rakta_Elementor {

    public static function init() {
        add_action('elementor/elements/categories_registered', [__CLASS__, 'register_categories']);
        add_action('elementor/widgets/register', [__CLASS__, 'register_widgets']);
    }

    /**
     * Add "Rakta Business OS" category in Elementor editor
     */
    public static function register_categories($elements_manager) {
        $elements_manager->add_category(
            'rakta-elements',
            [
                'title' => __('Rakta Business OS', 'rakta-business-core'),
                'icon'  => 'fa fa-id-card',
            ]
        );
    }

    /**
     * Register Elementor Widgets
     */
    public static function register_widgets($widgets_manager) {
        if (!class_exists('\Elementor\Widget_Base')) {
            return;
        }

        require_once RAKTA_CORE_PATH . 'includes/widgets/class-elementor-card-widget.php';
        require_once RAKTA_CORE_PATH . 'includes/widgets/class-elementor-lead-widget.php';

        $widgets_manager->register(new \Rakta_Elementor_Card_Widget());
        $widgets_manager->register(new \Rakta_Elementor_Lead_Widget());
    }
}
