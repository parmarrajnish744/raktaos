<?php
/**
 * Elementor Widget: Digital Card Embed
 */

if (!defined('ABSPATH')) {
    exit;
}

class Rakta_Elementor_Card_Widget extends \Elementor\Widget_Base {

    public function get_name() {
        return 'rakta_card_widget';
    }

    public function get_title() {
        return __('Digital Business Card', 'rakta-business-core');
    }

    public function get_icon() {
        return 'eicon-person';
    }

    public function get_categories() {
        return ['rakta-elements'];
    }

    public function get_keywords() {
        return ['card', 'digital business card', 'vcard', 'rakta', 'contact'];
    }

    protected function register_controls() {
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Card Settings', 'rakta-business-core'),
                'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'card_slug',
            [
                'label'       => __('Card Handle / Slug', 'rakta-business-core'),
                'type'        => \Elementor\Controls_Manager::TEXT,
                'default'     => 'sudheer-borra',
                'placeholder' => 'e.g. sudheer-borra',
                'description' => __('Enter the unique slug of the card created in Rakta Business OS.', 'rakta-business-core'),
            ]
        );

        $this->add_control(
            'card_style',
            [
                'label'   => __('Layout Style', 'rakta-business-core'),
                'type'    => \Elementor\Controls_Manager::SELECT,
                'default' => 'card',
                'options' => [
                    'card'   => __('Standard Card', 'rakta-business-core'),
                    'banner' => __('Horizontal Banner', 'rakta-business-core'),
                ],
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        $slug = !empty($settings['card_slug']) ? sanitize_text_field($settings['card_slug']) : 'sudheer-borra';
        $style = !empty($settings['card_style']) ? sanitize_text_field($settings['card_style']) : 'card';

        echo do_shortcode('[rakta_card slug="' . esc_attr($slug) . '" style="' . esc_attr($style) . '"]');
    }
}
