<?php
/**
 * Plugin Name: Rakta Business OS Core
 * Plugin URI: https://raktabusiness.com
 * Description: The official WordPress and Elementor bridge for Rakta Business OS. Connects WordPress landing pages to Supabase, embeds live digital business cards, captures leads directly into the SaaS CRM, and empowers Elementor editors.
 * Version: 1.0.0
 * Author: Rakta Business OS
 * Author URI: https://raktabusiness.com
 * License: GPL-2.0+
 * Text Domain: rakta-business-core
 * Requires PHP: 7.4
 * Requires at least: 5.8
 */

if (!defined('ABSPATH')) {
    exit;
}

define('RAKTA_CORE_VERSION', '1.0.0');
define('RAKTA_CORE_PATH', plugin_dir_path(__FILE__));
define('RAKTA_CORE_URL', plugin_dir_url(__FILE__));

// Load dependencies
require_once RAKTA_CORE_PATH . 'includes/class-rakta-supabase.php';
require_once RAKTA_CORE_PATH . 'includes/class-rakta-shortcodes.php';
require_once RAKTA_CORE_PATH . 'includes/class-rakta-elementor.php';
require_once RAKTA_CORE_PATH . 'includes/class-rakta-auth.php';

/**
 * Main Plugin Orchestrator
 */
class Rakta_Business_Core {
    private static $instance = null;

    public static function instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('admin_menu', [$this, 'register_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets']);
        add_action('wp_ajax_rakta_submit_lead', [$this, 'ajax_submit_lead']);
        add_action('wp_ajax_nopriv_rakta_submit_lead', [$this, 'ajax_submit_lead']);
        add_action('wp_ajax_rakta_test_connection', [$this, 'ajax_test_connection']);

        // Initialize submodules
        Rakta_Shortcodes::init();
        Rakta_Elementor::init();
        Rakta_Auth::init();
    }

    /**
     * Enqueue CSS & JS on frontend
     */
    public function enqueue_frontend_assets() {
        wp_enqueue_style(
            'rakta-core-style',
            RAKTA_CORE_URL . 'assets/css/rakta-wp.css',
            [],
            RAKTA_CORE_VERSION
        );

        wp_enqueue_script(
            'rakta-core-script',
            RAKTA_CORE_URL . 'assets/js/rakta-wp.js',
            ['jquery'],
            RAKTA_CORE_VERSION,
            true
        );

        // Supabase JS official client
        wp_enqueue_script(
            'supabase-js',
            'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
            [],
            '2.48.0',
            false
        );

        // Rakta Client-side Auth Manager
        wp_enqueue_script(
            'rakta-auth-script',
            RAKTA_CORE_URL . 'assets/js/rakta-auth.js',
            ['jquery', 'supabase-js'],
            RAKTA_CORE_VERSION,
            true
        );

        wp_localize_script('rakta-core-script', 'raktaConfig', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce'   => wp_create_nonce('rakta_lead_nonce'),
            'appUrl'  => get_option('rakta_app_url', 'https://app.raktabusiness.com')
        ]);

        wp_localize_script('rakta-auth-script', 'raktaAuthConfig', [
            'url'          => get_option('rakta_supabase_url', ''),
            'anonKey'      => get_option('rakta_supabase_anon_key', ''),
            'appUrl'       => rtrim(get_option('rakta_app_url', 'https://app.raktabusiness.com'), '/'),
            'authMode'     => get_option('rakta_auth_mode', 'modal'),
            'cookieDomain' => get_option('rakta_cookie_domain', '.raktabusiness.com')
        ]);
    }

    /**
     * Register Settings Menu
     */
    public function register_admin_menu() {
        add_menu_page(
            __('Rakta Business OS', 'rakta-business-core'),
            __('Rakta OS', 'rakta-business-core'),
            'manage_options',
            'rakta-settings',
            [$this, 'render_settings_page'],
            'dashicons-id-alt',
            30
        );
    }

    /**
     * Register Settings & Fields
     */
    public function register_settings() {
        register_setting('rakta_settings_group', 'rakta_supabase_url', ['sanitize_callback' => 'esc_url_raw']);
        register_setting('rakta_settings_group', 'rakta_supabase_anon_key', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('rakta_settings_group', 'rakta_app_url', ['sanitize_callback' => 'esc_url_raw']);
        register_setting('rakta_settings_group', 'rakta_cache_ttl', ['sanitize_callback' => 'absint']);
        register_setting('rakta_settings_group', 'rakta_auth_mode', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('rakta_settings_group', 'rakta_cookie_domain', ['sanitize_callback' => 'sanitize_text_field']);
    }

    /**
     * Render Admin Settings Page
     */
    public function render_settings_page() {
        $supabase_url = get_option('rakta_supabase_url', '');
        $supabase_key = get_option('rakta_supabase_anon_key', '');
        $app_url = get_option('rakta_app_url', 'https://app.raktabusiness.com');
        $cache_ttl = get_option('rakta_cache_ttl', 300);
        $auth_mode = get_option('rakta_auth_mode', 'modal');
        $cookie_domain = get_option('rakta_cookie_domain', '.raktabusiness.com');
        ?>
        <div class="wrap" style="max-width: 840px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <div style="background: #E63946; color: #fff; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 20px;">R</div>
                <div>
                    <h1 style="margin: 0; font-size: 22px;"><?php _e('Rakta Business OS &mdash; WordPress Bridge', 'rakta-business-core'); ?></h1>
                    <p style="margin: 2px 0 0; color: #64748b;"><?php _e('Connect WordPress and Elementor marketing pages directly to your SaaS database.', 'rakta-business-core'); ?></p>
                </div>
            </div>

            <form method="post" action="options.php" style="background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                <?php settings_fields('rakta_settings_group'); ?>
                <?php do_settings_sections('rakta_settings_group'); ?>

                <table class="form-table" role="presentation">
                    <tbody>
                        <tr>
                            <th scope="row"><label for="rakta_supabase_url"><?php _e('Supabase Project URL', 'rakta-business-core'); ?></label></th>
                            <td>
                                <input name="rakta_supabase_url" type="url" id="rakta_supabase_url" value="<?php echo esc_attr($supabase_url); ?>" class="regular-text" placeholder="https://xyzcompany.supabase.co" required />
                                <p class="description"><?php _e('Your Supabase project URL (Settings &gt; API &gt; Project URL).', 'rakta-business-core'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="rakta_supabase_anon_key"><?php _e('Supabase Anon Public Key', 'rakta-business-core'); ?></label></th>
                            <td>
                                <input name="rakta_supabase_anon_key" type="password" id="rakta_supabase_anon_key" value="<?php echo esc_attr($supabase_key); ?>" class="regular-text" placeholder="eyJhbGciOi..." required />
                                <p class="description"><?php _e('The safe public client anon key (DO NOT use service_role key here).', 'rakta-business-core'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="rakta_app_url"><?php _e('SaaS App URL', 'rakta-business-core'); ?></label></th>
                            <td>
                                <input name="rakta_app_url" type="url" id="rakta_app_url" value="<?php echo esc_attr($app_url); ?>" class="regular-text" placeholder="https://app.raktabusiness.com" />
                                <p class="description"><?php _e('Where login, dashboard, and card builder live.', 'rakta-business-core'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="rakta_auth_mode"><?php _e('Authentication Mode', 'rakta-business-core'); ?></label></th>
                            <td>
                                <select name="rakta_auth_mode" id="rakta_auth_mode">
                                    <option value="modal" <?php selected($auth_mode, 'modal'); ?>><?php _e('Client-Side Modal (Zero Redirect)', 'rakta-business-core'); ?></option>
                                    <option value="redirect" <?php selected($auth_mode, 'redirect'); ?>><?php _e('Direct Portal Redirection', 'rakta-business-core'); ?></option>
                                </select>
                                <p class="description"><?php _e('Modal handles login/register inline in browser via Supabase JS. Redirect sends users to app.raktabusiness.com/login.', 'rakta-business-core'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="rakta_cookie_domain"><?php _e('SSO Cookie Domain', 'rakta-business-core'); ?></label></th>
                            <td>
                                <input name="rakta_cookie_domain" type="text" id="rakta_cookie_domain" value="<?php echo esc_attr($cookie_domain); ?>" class="regular-text" placeholder=".raktabusiness.com" />
                                <p class="description"><?php _e('Root domain for sharing login sessions between WordPress and SaaS portal (e.g. .raktabusiness.com).', 'rakta-business-core'); ?></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="rakta_cache_ttl"><?php _e('Cache Duration (Seconds)', 'rakta-business-core'); ?></label></th>
                            <td>
                                <input name="rakta_cache_ttl" type="number" id="rakta_cache_ttl" value="<?php echo esc_attr($cache_ttl); ?>" class="small-text" min="0" step="30" />
                                <p class="description"><?php _e('How long digital card data is cached in WordPress transients (Default: 300s = 5 mins). Set to 0 to disable caching during testing.', 'rakta-business-core'); ?></p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div style="margin-top: 20px; display: flex; align-items: center; gap: 15px;">
                    <?php submit_button(__('Save Settings', 'rakta-business-core'), 'primary', 'submit', false); ?>
                    <button type="button" id="rakta-test-conn-btn" class="button button-secondary">
                        <?php _e('Test Supabase Connection', 'rakta-business-core'); ?>
                    </button>
                    <span id="rakta-test-status" style="font-weight: 600; font-size: 13px;"></span>
                </div>
            </form>

            <div style="margin-top: 30px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <h3 style="margin-top: 0; font-size: 16px;"><?php _e('Shortcodes Reference for Gutenberg & Elementor', 'rakta-business-core'); ?></h3>
                <ul style="list-style: disc; margin-left: 20px; font-size: 13px; line-height: 1.8;">
                    <li><code>[rakta_auth_nav]</code> &mdash; <?php _e('Dynamic header navigation widget (Sign In / Register vs Account Dashboard & Sign Out).', 'rakta-business-core'); ?></li>
                    <li><code>[rakta_auth_modal trigger_text="Sign In"]</code> &mdash; <?php _e('Button triggering popup Supabase authentication modal.', 'rakta-business-core'); ?></li>
                    <li><code>[rakta_login_form redirect="/dashboard"]</code> &mdash; <?php _e('Inline login card directly connected to Supabase Auth.', 'rakta-business-core'); ?></li>
                    <li><code>[rakta_register_form redirect="/dashboard/cards/create"]</code> &mdash; <?php _e('Inline registration card with password strength validation.', 'rakta-business-core'); ?></li>
                    <li><code>[rakta_card slug="sudheer-borra"]</code> &mdash; <?php _e('Embeds interactive card preview with instant vCard download and WhatsApp lead action.', 'rakta-business-core'); ?></li>
                    <li><code>[rakta_lead_form card_slug="sudheer-borra"]</code> &mdash; <?php _e('Renders lead capture form synchronizing enquiries directly to Supabase CRM.', 'rakta-business-core'); ?></li>
                    <li><code>[rakta_app_cta text="Create Your Card" plan="pro"]</code> &mdash; <?php _e('Renders high-converting CTA button pointing directly to your SaaS registration portal.', 'rakta-business-core'); ?></li>
                </ul>
            </div>


            <script>
            document.addEventListener('DOMContentLoaded', function() {
                var testBtn = document.getElementById('rakta-test-conn-btn');
                var statusSpan = document.getElementById('rakta-test-status');

                if (testBtn) {
                    testBtn.addEventListener('click', function() {
                        var url = document.getElementById('rakta_supabase_url').value;
                        var key = document.getElementById('rakta_supabase_anon_key').value;

                        if (!url || !key) {
                            statusSpan.style.color = '#dc2626';
                            statusSpan.innerText = 'Please enter both Supabase URL and Anon Key.';
                            return;
                        }

                        testBtn.disabled = true;
                        statusSpan.style.color = '#64748b';
                        statusSpan.innerText = 'Testing connection...';

                        var data = new FormData();
                        data.append('action', 'rakta_test_connection');
                        data.append('url', url);
                        data.append('key', key);
                        data.append('nonce', '<?php echo wp_create_nonce("rakta_admin_test"); ?>');

                        fetch(ajaxurl, {
                            method: 'POST',
                            body: data
                        })
                        .then(function(r) { return r.json(); })
                        .then(function(res) {
                            testBtn.disabled = false;
                            if (res.success) {
                                statusSpan.style.color = '#16a34a';
                                statusSpan.innerText = '✓ Connection successful! ' + res.data.message;
                            } else {
                                statusSpan.style.color = '#dc2626';
                                statusSpan.innerText = '✕ ' + (res.data?.message || 'Connection failed.');
                            }
                        })
                        .catch(function(err) {
                            testBtn.disabled = false;
                            statusSpan.style.color = '#dc2626';
                            statusSpan.innerText = 'Network error during test.';
                        });
                    });
                }
            });
            </script>
        </div>
        <?php
    }

    /**
     * AJAX: Test Supabase Connection
     */
    public function ajax_test_connection() {
        check_ajax_referer('rakta_admin_test', 'nonce');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }

        $url = sanitize_text_field($_POST['url'] ?? '');
        $key = sanitize_text_field($_POST['key'] ?? '');

        $result = Rakta_Supabase_Client::test_connection($url, $key);
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }

    /**
     * AJAX: Handle Lead Submissions from WordPress pages
     */
    public function ajax_submit_lead() {
        check_ajax_referer('rakta_lead_nonce', 'nonce');

        $card_slug = sanitize_text_field($_POST['card_slug'] ?? '');
        $name      = sanitize_text_field($_POST['name'] ?? '');
        $phone     = sanitize_text_field($_POST['phone'] ?? '');
        $email     = sanitize_email($_POST['email'] ?? '');
        $message   = sanitize_textarea_field($_POST['message'] ?? '');

        if (empty($name) || empty($phone)) {
            wp_send_json_error(['message' => __('Please provide your Name and Mobile Number.', 'rakta-business-core')]);
        }

        $client = new Rakta_Supabase_Client();
        $response = $client->submit_lead($card_slug, $name, $phone, $email, $message);

        if ($response['success']) {
            wp_send_json_success(['message' => __('Your enquiry has been sent successfully! The business team will contact you shortly.', 'rakta-business-core')]);
        } else {
            wp_send_json_error(['message' => $response['message'] ?? __('Failed to send enquiry. Please try again.', 'rakta-business-core')]);
        }
    }
}

// Boot plugin
add_action('plugins_loaded', ['Rakta_Business_Core', 'instance']);
