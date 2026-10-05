<?php
/**
 * Rakta Supabase API Client
 * Handles authenticated read/write with Supabase REST API and transient caching.
 */

if (!defined('ABSPATH')) {
    exit;
}

class Rakta_Supabase_Client {
    private $url;
    private $anon_key;
    private $cache_ttl;

    public function __construct() {
        $this->url       = rtrim(get_option('rakta_supabase_url', ''), '/');
        $this->anon_key  = get_option('rakta_supabase_anon_key', '');
        $this->cache_ttl = (int) get_option('rakta_cache_ttl', 300);
    }

    /**
     * Check if client is properly configured
     */
    public function is_configured() {
        return !empty($this->url) && !empty($this->anon_key) && strpos($this->url, 'supabase.co') !== false;
    }

    /**
     * Get default headers for Supabase REST API
     */
    private function get_headers() {
        return [
            'apikey'        => $this->anon_key,
            'Authorization' => 'Bearer ' . $this->anon_key,
            'Content-Type'  => 'application/json',
            'Prefer'        => 'return=representation'
        ];
    }

    /**
     * Test Supabase REST connectivity
     */
    public static function test_connection($url, $key) {
        $clean_url = rtrim($url, '/') . '/rest/v1/cards?select=id&limit=1';
        $res = wp_remote_get($clean_url, [
            'headers' => [
                'apikey'        => $key,
                'Authorization' => 'Bearer ' . $key,
                'Content-Type'  => 'application/json'
            ],
            'timeout' => 10
        ]);

        if (is_wp_error($res)) {
            return ['success' => false, 'message' => $res->get_error_message()];
        }

        $code = wp_remote_retrieve_response_code($res);
        if ($code >= 200 && $code < 300) {
            return ['success' => true, 'message' => 'Connected to Supabase REST engine.'];
        }

        $body = wp_remote_retrieve_body($res);
        $json = json_decode($body, true);
        return [
            'success' => false,
            'message' => $json['message'] ?? "HTTP Status $code received from Supabase."
        ];
    }

    /**
     * Fetch a card by slug with transient caching
     */
    public function get_card_by_slug($slug) {
        if (!$this->is_configured() || empty($slug)) {
            return null;
        }

        $transient_key = 'rakta_card_' . md5(sanitize_key($slug));
        if ($this->cache_ttl > 0) {
            $cached = get_transient($transient_key);
            if ($cached !== false) {
                return $cached;
            }
        }

        $endpoint = $this->url . '/rest/v1/cards?slug=eq.' . rawurlencode($slug) . '&is_active=eq.true&select=*,business:businesses(*)';
        $res = wp_remote_get($endpoint, [
            'headers' => $this->get_headers(),
            'timeout' => 10
        ]);

        if (is_wp_error($res)) {
            error_log('Rakta Supabase fetch error: ' . $res->get_error_message());
            return null;
        }

        $code = wp_remote_retrieve_response_code($res);
        if ($code !== 200) {
            return null;
        }

        $body = wp_remote_retrieve_body($res);
        $cards = json_decode($body, true);

        if (!empty($cards) && is_array($cards)) {
            $card = $cards[0];
            if ($this->cache_ttl > 0) {
                set_transient($transient_key, $card, $this->cache_ttl);
            }
            return $card;
        }

        return null;
    }

    /**
     * Submit lead enquiry to Supabase via RPC submit_card_lead
     */
    public function submit_lead($card_slug, $name, $phone, $email, $message) {
        if (!$this->is_configured()) {
            return ['success' => false, 'message' => 'Supabase connection is not configured in WordPress settings.'];
        }

        $endpoint = $this->url . '/rest/v1/rpc/submit_card_lead';
        $payload = json_encode([
            'p_card_slug' => $card_slug,
            'p_name'      => $name,
            'p_phone'     => $phone,
            'p_email'     => $email ?: null,
            'p_message'   => $message ?: null
        ]);

        $res = wp_remote_post($endpoint, [
            'headers' => $this->get_headers(),
            'body'    => $payload,
            'timeout' => 12
        ]);

        if (is_wp_error($res)) {
            return ['success' => false, 'message' => $res->get_error_message()];
        }

        $code = wp_remote_retrieve_response_code($res);
        $body = wp_remote_retrieve_body($res);
        $json = json_decode($body, true);

        if ($code >= 200 && $code < 300) {
            return ['success' => true, 'data' => $json];
        }

        return [
            'success' => false,
            'message' => $json['message'] ?? 'Failed to submit lead to database.'
        ];
    }
}
