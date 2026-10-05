<?php
/**
 * Rakta Shortcodes Manager
 * Provides [rakta_card], [rakta_lead_form], and [rakta_app_cta]
 */

if (!defined('ABSPATH')) {
    exit;
}

class Rakta_Shortcodes {

    public static function init() {
        add_shortcode('rakta_card', [__CLASS__, 'render_card_shortcode']);
        add_shortcode('rakta_lead_form', [__CLASS__, 'render_lead_form_shortcode']);
        add_shortcode('rakta_app_cta', [__CLASS__, 'render_app_cta_shortcode']);
    }

    /**
     * [rakta_card slug="sudheer-borra" style="card"]
     */
    public static function render_card_shortcode($atts) {
        $atts = shortcode_atts([
            'slug'  => 'sudheer-borra',
            'style' => 'card', // card, badge, banner
        ], $atts, 'rakta_card');

        $slug = sanitize_text_field($atts['slug']);
        $client = new Rakta_Supabase_Client();
        $card = $client->get_card_by_slug($slug);

        // Fallback demo data if card is not yet in Supabase or in preview mode
        if (!$card) {
            $card = [
                'full_name'        => 'Sudheer Borra',
                'designation'      => 'Managing Director',
                'company_name'     => 'RUSHI Power Systems Pvt. Ltd.',
                'tagline'          => 'ISO 9001:2015 Certified Power Solutions',
                'phone'            => '+91 98490 12345',
                'email'            => 'sudheer@rushipower.com',
                'website'          => 'https://rushipower.com',
                'slug'             => $slug,
                'primary_color'    => '#E63946',
                'secondary_color'  => '#1D3557',
                'address'          => 'Secunderabad, Telangana, India',
                'views_count'      => 450,
                'scans_count'      => 180,
                'downloads_count'  => 95
            ];
        }

        $app_url = rtrim(get_option('rakta_app_url', 'https://app.raktabusiness.com'), '/');
        $card_url = $app_url . '/c/' . rawurlencode($card['slug']);
        $vcard_url = $app_url . '/c/' . rawurlencode($card['slug']) . '?download=vcard';
        $clean_phone = preg_replace('/[^0-9]/', '', $card['phone'] ?? '');
        $whatsapp_link = $clean_phone ? 'https://wa.me/' . $clean_phone . '?text=' . rawurlencode('Hello ' . $card['full_name'] . ', I connected via your Rakta Digital Business Card.') : '#';

        ob_start();
        ?>
        <div class="rakta-card-embed rakta-theme-<?php echo esc_attr($atts['style']); ?>" style="--rakta-card-primary: <?php echo esc_attr($card['primary_color'] ?? '#E63946'); ?>;">
            <div class="rakta-card-inner">
                <!-- Header Banner -->
                <div class="rakta-card-header" style="background: linear-gradient(135deg, <?php echo esc_attr($card['primary_color'] ?? '#E63946'); ?> 0%, <?php echo esc_attr($card['secondary_color'] ?? '#1D3557'); ?> 100%);">
                    <span class="rakta-badge-verified">✓ Verified Business</span>
                </div>

                <!-- Avatar and Profile Info -->
                <div class="rakta-card-body">
                    <div class="rakta-card-avatar">
                        <?php
                        $avatar_url = !empty($card['profile_image_url']) ? $card['profile_image_url'] : (!empty($card['profile_photo']) ? $card['profile_photo'] : '');
                        if (!empty($avatar_url)):
                        ?>
                            <img src="<?php echo esc_url($avatar_url); ?>" alt="<?php echo esc_attr($card['full_name']); ?>" />
                        <?php else: ?>
                            <div class="rakta-avatar-placeholder">
                                <?php echo esc_html(mb_substr($card['full_name'] ?? 'R', 0, 1)); ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <h3 class="rakta-card-name"><?php echo esc_html($card['full_name']); ?></h3>
                    <p class="rakta-card-designation"><?php echo esc_html($card['designation'] ?? ''); ?></p>
                    <p class="rakta-card-company"><?php echo esc_html($card['company_name'] ?? ($card['company'] ?? '')); ?></p>

                    <?php if (!empty($card['tagline'])): ?>
                        <div class="rakta-card-tagline"><?php echo esc_html($card['tagline']); ?></div>
                    <?php endif; ?>

                    <!-- Action Buttons -->
                    <div class="rakta-card-actions">
                        <?php if (!empty($card['phone'])): ?>
                            <a href="tel:<?php echo esc_attr($card['phone']); ?>" class="rakta-btn rakta-btn-call" title="Call">
                                📞 Call
                            </a>
                        <?php endif; ?>
                        <?php if ($clean_phone): ?>
                            <a href="<?php echo esc_url($whatsapp_link); ?>" target="_blank" rel="noopener noreferrer" class="rakta-btn rakta-btn-whatsapp" title="WhatsApp">
                                💬 WhatsApp
                            </a>
                        <?php endif; ?>
                        <?php if (!empty($card['email'])): ?>
                            <a href="mailto:<?php echo esc_attr($card['email']); ?>" class="rakta-btn rakta-btn-email" title="Email">
                                ✉️ Email
                            </a>
                        <?php endif; ?>
                    </div>

                    <!-- Direct Save vCard / Live View -->
                    <div class="rakta-card-cta-row">
                        <a href="<?php echo esc_url($card_url); ?>" target="_blank" rel="noopener noreferrer" class="rakta-btn rakta-btn-primary">
                            Open Full Digital Card &rarr;
                        </a>
                    </div>
                </div>

                <!-- Card Footer -->
                <div class="rakta-card-footer">
                    <span>Powered by <strong>Rakta Business OS</strong></span>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * [rakta_lead_form card_slug="sudheer-borra" title="Get in Touch"]
     */
    public static function render_lead_form_shortcode($atts) {
        $atts = shortcode_atts([
            'card_slug' => 'sudheer-borra',
            'title'     => 'Send Us an Enquiry',
            'subtitle'  => 'Share your requirements and our team will get back to you directly on WhatsApp or Call.'
        ], $atts, 'rakta_lead_form');

        $slug = sanitize_text_field($atts['card_slug']);

        ob_start();
        ?>
        <div class="rakta-lead-form-box" id="rakta-lead-form-<?php echo esc_attr($slug); ?>">
            <?php if (!empty($atts['title'])): ?>
                <h3 class="rakta-lead-title"><?php echo esc_html($atts['title']); ?></h3>
            <?php endif; ?>
            <?php if (!empty($atts['subtitle'])): ?>
                <p class="rakta-lead-subtitle"><?php echo esc_html($atts['subtitle']); ?></p>
            <?php endif; ?>

            <form class="rakta-ajax-lead-form" data-card-slug="<?php echo esc_attr($slug); ?>">
                <div class="rakta-form-row">
                    <label class="rakta-label"><?php _e('Your Full Name *', 'rakta-business-core'); ?></label>
                    <input type="text" name="name" class="rakta-input" placeholder="e.g. Ramesh Kumar" required />
                </div>

                <div class="rakta-form-row">
                    <label class="rakta-label"><?php _e('Mobile Number (WhatsApp) *', 'rakta-business-core'); ?></label>
                    <input type="tel" name="phone" class="rakta-input" placeholder="e.g. +91 98765 43210" required />
                </div>

                <div class="rakta-form-row">
                    <label class="rakta-label"><?php _e('Email Address', 'rakta-business-core'); ?></label>
                    <input type="email" name="email" class="rakta-input" placeholder="e.g. ramesh@example.com" />
                </div>

                <div class="rakta-form-row">
                    <label class="rakta-label"><?php _e('Message / Requirement', 'rakta-business-core'); ?></label>
                    <textarea name="message" class="rakta-textarea" rows="3" placeholder="Tell us how we can help you..."></textarea>
                </div>

                <div class="rakta-form-row">
                    <button type="submit" class="rakta-submit-btn">
                        <span><?php _e('Send Enquiry', 'rakta-business-core'); ?></span>
                        <span class="rakta-spinner" style="display: none;">⏳</span>
                    </button>
                </div>

                <div class="rakta-form-response" style="display: none;"></div>
            </form>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * [rakta_app_cta text="Start Free Trial" plan="pro" class="custom-class"]
     */
    public static function render_app_cta_shortcode($atts) {
        $atts = shortcode_atts([
            'text'  => 'Create Your Digital Card',
            'plan'  => 'free',
            'class' => ''
        ], $atts, 'rakta_app_cta');

        $app_url = rtrim(get_option('rakta_app_url', 'https://app.raktabusiness.com'), '/');
        $target_url = $app_url . '/register' . ($atts['plan'] ? '?plan=' . urlencode($atts['plan']) : '');

        return sprintf(
            '<a href="%s" class="rakta-app-cta-btn %s" target="_blank" rel="noopener noreferrer">%s &rarr;</a>',
            esc_url($target_url),
            esc_attr($atts['class']),
            esc_html($atts['text'])
        );
    }
}
