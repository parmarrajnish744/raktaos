<?php
/**
 * Rakta Supabase Authentication Module for WordPress
 * Provides client-side embedded auth modals, forms, and dynamic navigation widgets
 * with zero password synchronization and zero duplicate WordPress authentication.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Rakta_Auth {

    public static function init() {
        add_shortcode('rakta_auth_modal', [__CLASS__, 'render_auth_modal_shortcode']);
        add_shortcode('rakta_auth_nav', [__CLASS__, 'render_auth_nav_shortcode']);
        add_shortcode('rakta_login_form', [__CLASS__, 'render_login_form_shortcode']);
        add_shortcode('rakta_register_form', [__CLASS__, 'render_register_form_shortcode']);

        // Always render modal container in footer if enabled
        add_action('wp_footer', [__CLASS__, 'render_footer_modal']);
    }

    /**
     * [rakta_auth_nav btn_class="custom-btn" dashboard_text="Go to Dashboard"]
     * Dynamic header widget: switches between Login/Register and Account/Dashboard based on Supabase session
     */
    public static function render_auth_nav_shortcode($atts) {
        $atts = shortcode_atts([
            'btn_class'      => 'rakta-auth-btn',
            'dashboard_text' => __('Dashboard', 'rakta-business-core'),
            'login_text'     => __('Sign In', 'rakta-business-core'),
            'register_text'  => __('Create Card', 'rakta-business-core'),
        ], $atts, 'rakta_auth_nav');

        $app_url = rtrim(get_option('rakta_app_url', 'https://app.raktabusiness.com'), '/');

        ob_start();
        ?>
        <div class="rakta-auth-nav-container" data-app-url="<?php echo esc_url($app_url); ?>">
            <!-- Logged out state (Default before JS initializes) -->
            <div class="rakta-nav-guest" style="display: flex; align-items: center; gap: 10px;">
                <button type="button" class="rakta-btn-link rakta-open-login-btn">
                    <?php echo esc_html($atts['login_text']); ?>
                </button>
                <button type="button" class="rakta-btn-pill rakta-open-register-btn">
                    <span><?php echo esc_html($atts['register_text']); ?></span>
                    <span style="font-size: 14px;">&rarr;</span>
                </button>
            </div>

            <!-- Logged in state (Populated dynamically by rakta-auth.js via Supabase session) -->
            <div class="rakta-nav-user" style="display: none; align-items: center; gap: 12px;">
                <a href="<?php echo esc_url($app_url . '/dashboard'); ?>" class="rakta-btn-pill" style="background: var(--rakta-navy, #0B2E59);">
                    <span class="dashicons dashicons-dashboard" style="font-size: 16px; width: 16px; height: 16px; margin-right: 4px; vertical-align: middle;"></span>
                    <span class="rakta-user-name-display"><?php echo esc_html($atts['dashboard_text']); ?></span>
                </a>
                <button type="button" class="rakta-btn-link rakta-logout-btn" title="<?php esc_attr_e('Log Out', 'rakta-business-core'); ?>" style="color: #64748b;">
                    <?php _e('Sign Out', 'rakta-business-core'); ?>
                </button>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * [rakta_auth_modal trigger_text="Sign In / Register"]
     */
    public static function render_auth_modal_shortcode($atts) {
        $atts = shortcode_atts([
            'trigger_text' => __('Sign In to Rakta OS', 'rakta-business-core'),
            'class'        => ''
        ], $atts, 'rakta_auth_modal');

        return sprintf(
            '<button type="button" class="rakta-open-auth-modal-btn %s">%s</button>',
            esc_attr($atts['class']),
            esc_html($atts['trigger_text'])
        );
    }

    /**
     * [rakta_login_form redirect="/dashboard"]
     */
    public static function render_login_form_shortcode($atts) {
        $atts = shortcode_atts([
            'redirect' => '/dashboard',
            'title'    => __('Sign In to Rakta OS', 'rakta-business-core')
        ], $atts, 'rakta_login_form');

        return self::get_form_html('login', $atts['redirect'], $atts['title']);
    }

    /**
     * [rakta_register_form redirect="/dashboard/cards/create"]
     */
    public static function render_register_form_shortcode($atts) {
        $atts = shortcode_atts([
            'redirect' => '/dashboard/cards/create',
            'title'    => __('Create Your Digital Card', 'rakta-business-core')
        ], $atts, 'rakta_register_form');

        return self::get_form_html('register', $atts['redirect'], $atts['title']);
    }

    /**
     * Helper to render unified auth form HTML (Card style)
     */
    public static function get_form_html($initial_tab = 'login', $redirect = '/dashboard', $title = '') {
        $app_url = rtrim(get_option('rakta_app_url', 'https://app.raktabusiness.com'), '/');

        ob_start();
        ?>
        <div class="rakta-auth-card" data-default-tab="<?php echo esc_attr($initial_tab); ?>" data-redirect="<?php echo esc_attr($redirect); ?>">
            <!-- Header -->
            <div class="rakta-auth-header">
                <div class="rakta-auth-logo">R</div>
                <h3 class="rakta-auth-title"><?php echo esc_html($title ?: __('Rakta Business OS', 'rakta-business-core')); ?></h3>
                <p class="rakta-auth-subtitle"><?php _e('Identity, smart vCards, and lead capture engine', 'rakta-business-core'); ?></p>
            </div>

            <!-- Tab Switcher -->
            <div class="rakta-auth-tabs">
                <button type="button" class="rakta-tab-btn <?php echo $initial_tab === 'login' ? 'active' : ''; ?>" data-tab="login">
                    <?php _e('Sign In', 'rakta-business-core'); ?>
                </button>
                <button type="button" class="rakta-tab-btn <?php echo $initial_tab === 'register' ? 'active' : ''; ?>" data-tab="register">
                    <?php _e('Register Free', 'rakta-business-core'); ?>
                </button>
            </div>

            <!-- Notice Box -->
            <div class="rakta-auth-notice" style="display: none;"></div>

            <!-- Login View -->
            <form class="rakta-auth-form rakta-form-login" style="<?php echo $initial_tab === 'login' ? '' : 'display: none;'; ?>">
                <div class="rakta-form-row">
                    <label class="rakta-label"><?php _e('Email Address', 'rakta-business-core'); ?></label>
                    <input type="email" name="email" class="rakta-input" placeholder="you@company.com" required autocomplete="email" />
                </div>

                <div class="rakta-form-row">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <label class="rakta-label" style="margin-bottom: 0;"><?php _e('Password', 'rakta-business-core'); ?></label>
                        <button type="button" class="rakta-switch-to-forgot" style="background: none; border: none; padding: 0; font-size: 12px; color: #2563EB; cursor: pointer;">
                            <?php _e('Forgot password?', 'rakta-business-core'); ?>
                        </button>
                    </div>
                    <input type="password" name="password" class="rakta-input" placeholder="••••••••" required autocomplete="current-password" />
                </div>

                <div class="rakta-form-row" style="margin-top: 18px;">
                    <button type="submit" class="rakta-btn-submit">
                        <span class="rakta-btn-text"><?php _e('Sign In to Dashboard', 'rakta-business-core'); ?></span>
                        <span class="rakta-auth-spinner" style="display: none;">⏳</span>
                    </button>
                </div>
            </form>

            <!-- Register View -->
            <form class="rakta-auth-form rakta-form-register" style="<?php echo $initial_tab === 'register' ? '' : 'display: none;'; ?>">
                <div class="rakta-form-row">
                    <label class="rakta-label"><?php _e('Full Name', 'rakta-business-core'); ?></label>
                    <input type="text" name="name" class="rakta-input" placeholder="Sudheer Borra" required autocomplete="name" />
                </div>

                <div class="rakta-form-row">
                    <label class="rakta-label"><?php _e('Work Email', 'rakta-business-core'); ?></label>
                    <input type="email" name="email" class="rakta-input" placeholder="sudheer@rushipower.com" required autocomplete="email" />
                </div>

                <div class="rakta-form-row">
                    <label class="rakta-label"><?php _e('Password (min 6 characters)', 'rakta-business-core'); ?></label>
                    <input type="password" name="password" class="rakta-input" placeholder="••••••••" minlength="6" required autocomplete="new-password" />
                </div>

                <div class="rakta-form-row" style="margin-top: 18px;">
                    <button type="submit" class="rakta-btn-submit">
                        <span class="rakta-btn-text"><?php _e('Create Account & Card', 'rakta-business-core'); ?></span>
                        <span class="rakta-auth-spinner" style="display: none;">⏳</span>
                    </button>
                </div>
            </form>

            <!-- Forgot Password View -->
            <form class="rakta-auth-form rakta-form-forgot" style="display: none;">
                <div class="rakta-form-row">
                    <label class="rakta-label"><?php _e('Enter Registered Email', 'rakta-business-core'); ?></label>
                    <input type="email" name="email" class="rakta-input" placeholder="you@company.com" required />
                    <p class="description" style="font-size: 12px; color: #64748b; margin-top: 4px;">
                        <?php _e('We will send a secure password recovery link to your inbox.', 'rakta-business-core'); ?>
                    </p>
                </div>

                <div class="rakta-form-row" style="margin-top: 18px;">
                    <button type="submit" class="rakta-btn-submit">
                        <span class="rakta-btn-text"><?php _e('Send Recovery Link', 'rakta-business-core'); ?></span>
                        <span class="rakta-auth-spinner" style="display: none;">⏳</span>
                    </button>
                </div>

                <div style="text-align: center; margin-top: 12px;">
                    <button type="button" class="rakta-switch-to-login" style="background: none; border: none; padding: 0; font-size: 13px; color: #64748b; cursor: pointer;">
                        &larr; <?php _e('Back to Sign In', 'rakta-business-core'); ?>
                    </button>
                </div>
            </form>

            <div class="rakta-auth-footer">
                <span><?php _e('Secured by', 'rakta-business-core'); ?> <strong>Rakta OS Cloud Auth</strong></span>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Renders global floating modal in footer
     */
    public static function render_footer_modal() {
        ?>
        <div id="rakta-global-auth-modal" class="rakta-modal-backdrop" style="display: none;">
            <div class="rakta-modal-dialog">
                <button type="button" class="rakta-modal-close" aria-label="Close modal">&times;</button>
                <?php echo self::get_form_html('login', '/dashboard'); ?>
            </div>
        </div>
        <?php
    }
}
