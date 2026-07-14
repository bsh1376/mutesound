<?php
/**
 * Plugin Name: MUTESOUND Landing Page
 * Description: MUTESOUND landing page shortcode and front page renderer for WordPress.
 * Version: 1.0.6
 * Requires at least: 6.3
 * Author: MUTESOUND
 * License: GPL-2.0-or-later
 */

if (!defined('ABSPATH')) {
    exit;
}

const MUTESOUND_LANDING_VERSION = '1.0.6';
const MUTESOUND_LANDING_TITLE = 'MUTESOUND | 드럼·음악 학원·연습실 방음 시공';
const MUTESOUND_LANDING_DESCRIPTION = '드럼·음악 학원·개인 연습실을 위한 맞춤형 방음 시공. 현장 진단부터 설계, 시공, 사후관리까지 MUTESOUND가 함께합니다.';

function mutesound_landing_template_html() {
    $template_path = plugin_dir_path(__FILE__) . 'templates/landing.html';
    if (!file_exists($template_path)) {
        return '';
    }

    $html = file_get_contents($template_path);
    $base_url = esc_url(plugin_dir_url(__FILE__));

    return str_replace(
        array('src="assets/', 'src="uploads/', 'href="assets/'),
        array('src="' . $base_url . 'assets/', 'src="' . $base_url . 'uploads/', 'href="' . $base_url . 'assets/'),
        $html
    );
}

function mutesound_landing_shortcode() {
    $html = mutesound_landing_template_html();
    if ($html === '') {
        return '<p>MUTESOUND landing template is missing.</p>';
    }

    $base_url = esc_url(plugin_dir_url(__FILE__));
    $css_url = esc_url($base_url . 'assets/mutesound.css?ver=' . MUTESOUND_LANDING_VERSION);
    $js_url = esc_url($base_url . 'assets/mutesound.js?ver=' . MUTESOUND_LANDING_VERSION);
    $asset_base = wp_json_encode($base_url);

    return '<link rel="stylesheet" href="' . $css_url . '">' .
        $html .
        '<script>window.MUTESOUND_ASSET_BASE = ' . $asset_base . ';</script>' .
        '<script src="' . $js_url . '" defer></script>';
}

add_shortcode('mutesound_landing', 'mutesound_landing_shortcode');

function mutesound_landing_is_full_page_request() {
    if (is_admin() || wp_doing_ajax()) {
        return false;
    }

    return is_front_page() || is_page('mutesound-landing');
}

function mutesound_landing_document_title($title) {
    return mutesound_landing_is_full_page_request() ? MUTESOUND_LANDING_TITLE : $title;
}

add_filter('pre_get_document_title', 'mutesound_landing_document_title', 99);

function mutesound_landing_prepare_wordpress_head() {
    remove_action('wp_head', 'wp_generator');
    remove_action('wp_head', 'rsd_link');
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'wp_shortlink_wp_head', 10);
    remove_action('wp_head', 'rel_canonical');
    remove_action('wp_head', '_wp_render_title_tag', 1);
    remove_action('rank_math/head', '_wp_render_title_tag', 1);
}

function mutesound_landing_print_fallback_meta($canonical_url, $og_url) {
    echo '<meta name="description" content="' . esc_attr(MUTESOUND_LANDING_DESCRIPTION) . '">';
    echo '<link rel="canonical" href="' . $canonical_url . '">';
    echo '<meta property="og:type" content="website">';
    echo '<meta property="og:url" content="' . $canonical_url . '">';
    echo '<meta property="og:title" content="' . esc_attr(MUTESOUND_LANDING_TITLE) . '">';
    echo '<meta property="og:description" content="' . esc_attr(MUTESOUND_LANDING_DESCRIPTION) . '">';
    echo '<meta property="og:image" content="' . $og_url . '">';
    echo '<meta name="twitter:card" content="summary_large_image">';
    echo '<meta name="twitter:title" content="' . esc_attr(MUTESOUND_LANDING_TITLE) . '">';
    echo '<meta name="twitter:description" content="' . esc_attr(MUTESOUND_LANDING_DESCRIPTION) . '">';
    echo '<meta name="twitter:image" content="' . $og_url . '">';
}

function mutesound_landing_render_full_page() {
    if (!mutesound_landing_is_full_page_request()) {
        return;
    }

    $html = mutesound_landing_template_html();
    if ($html === '') {
        return;
    }

    $base_url = esc_url(plugin_dir_url(__FILE__));
    $css_url = $base_url . 'assets/mutesound.css';
    $js_url = $base_url . 'assets/mutesound.js';
    $hero_url = esc_url($base_url . 'uploads/KakaoTalk_20260630_155149554.jpg');
    $og_url = esc_url($base_url . 'assets/og-image.png');
    $canonical_url = esc_url(home_url('/'));
    $asset_base = wp_json_encode($base_url);
    $charset = esc_attr(get_bloginfo('charset'));

    wp_enqueue_style('mutesound-landing', $css_url, array(), MUTESOUND_LANDING_VERSION);
    wp_enqueue_script(
        'mutesound-landing',
        $js_url,
        array(),
        MUTESOUND_LANDING_VERSION,
        array('strategy' => 'defer', 'in_footer' => true)
    );
    wp_add_inline_script('mutesound-landing', 'window.MUTESOUND_ASSET_BASE = ' . $asset_base . ';', 'before');
    mutesound_landing_prepare_wordpress_head();

    status_header(200);
    header('Content-Type: text/html; charset=' . $charset);

    echo '<!doctype html><html lang="ko"><head>';
    echo '<meta charset="' . $charset . '">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<link rel="preload" as="image" href="' . $hero_url . '" fetchpriority="high">';
    echo '<title>' . esc_html(wp_get_document_title()) . '</title>';
    if (!defined('RANK_MATH_VERSION')) {
        mutesound_landing_print_fallback_meta($canonical_url, $og_url);
    }
    wp_head();
    echo '<style>html,body{margin:0;padding:0;background:#f7f9fb;}body{font-family:Pretendard,system-ui,-apple-system,BlinkMacSystemFont,sans-serif;}</style>';
    echo '</head><body>';
    wp_body_open();
    echo $html;
    wp_footer();
    echo '</body></html>';
    exit;
}

add_action('template_redirect', 'mutesound_landing_render_full_page', 0);
