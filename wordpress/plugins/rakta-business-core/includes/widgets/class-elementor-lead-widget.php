<?php
/**
 * Elementor Widget: SME Lead Capture Form
 */

if (!defined('ABSPATH')) {
    exit;
}

class Rakta_Elementor_Lead_Widget extends \Elementor\Widget_Base {

    public function get_name() {
        return 'rakta_lead_widget';
    }

    public function get_title() {
        return __('SME Lead Enquiry Form', 'rakta-business-core');
    }

    public function get_icon() {
        return 'eicon-form-horizontal';
    }

    public function get_categories() {
        return ['rakta-elements'];
    }

    public function get_keywords() {
        return ['lead', 'form', 'contact', 'crm', 'rakta', 'enquiry'];
    }

    protected function register_controls() {
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Form Configuration', 'rakta-business-core'),
                'tab'   => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'card_slug',
            [
                'label'       => __('Destination Card Slug', 'rakta-business-core'),
                'type'        => \Elementor\Controls_Manager::TEXT,
                'default'     => 'sudheer-borra',
                'placeholder' => 'e.g. sudheer-borra',
                'description' => __('Enquiries submitted will route directly to this business/card owner in Rakta Business OS CRM.', 'rakta-business-core'),
            ]
        );

        $this->add_control(
            'form_title',
            [
                'label'   => __('Title', 'rakta-business-core'),
                'type'    => \Elementor\Controls_Manager::TEXT,
                'default' => __('Send Us an Enquiry', 'rakta-business-core'),
            ]
        );

        $this->add_control(
            'form_subtitle',
            [
                'label'   => __('Subtitle', 'rakta-business-core'),
                'type'    => \Elementor\Controls_Manager::TEXTAREA,
                'default' => __('Share your requirements and our team will get back to you directly on WhatsApp or Call.', 'rakta-business-core'),
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        $slug = !empty($settings['card_slug']) ? sanitize_text_field($settings['card_slug']) : 'sudheer-borra';
        $title = !empty($settings['form_title']) ? sanitize_text_field($settings['form_title']) : '';
        $subtitle = !empty($settings['form_subtitle']) ? sanitize_text_field($settings['form_subtitle']) : '';

        echo do_shortcode('[rakta_lead_form card_slug="' . esc_attr($slug) . '" title="' . esc_attr($title) . '" subtitle="' . esc_attr($subtitle) . '"]');
    }
}
