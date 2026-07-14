<?php
/**
 * Plugin Name: MUTESOUND Landing Page
 * Description: MUTESOUND landing page shortcode and front page renderer for WordPress.
 * Version: 1.0.3
 * Author: MUTESOUND
 * License: GPL-2.0-or-later
 */

if (!defined('ABSPATH')) {
    exit;
}

const MUTESOUND_LANDING_VERSION = '1.0.3';

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

function mutesound_landing_render_full_page() {
    if (!mutesound_landing_is_full_page_request()) {
        return;
    }

    $html = mutesound_landing_template_html();
    if ($html === '') {
        return;
    }

    $base_url = esc_url(plugin_dir_url(__FILE__));
    $css_url = esc_url($base_url . 'assets/mutesound.css?ver=' . MUTESOUND_LANDING_VERSION);
    $js_url = esc_url($base_url . 'assets/mutesound.js?ver=' . MUTESOUND_LANDING_VERSION);
    $hero_url = esc_url($base_url . 'uploads/KakaoTalk_20260630_155149554.jpg');
    $og_url = esc_url($base_url . 'assets/og-image.png');
    $canonical_url = esc_url(home_url('/'));
    $asset_base = wp_json_encode($base_url);
    $charset = esc_attr(get_bloginfo('charset'));

    status_header(200);
    header('Content-Type: text/html; charset=' . $charset);

    echo '<!doctype html><html lang="ko"><head>';
    echo '<meta charset="' . $charset . '">';
    echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<title>MUTESOUND | 음악 학원 · 연습실 전문 방음 시공</title>';
    echo '<meta name="description" content="지상층 드럼 방음까지 가능한 국내 소수 전문 업체. 현장 실측 기반 차음 설계로 -60dB 이상의 방음 성능을 구현합니다.">';
    echo '<link rel="canonical" href="' . $canonical_url . '">';
    echo '<meta property="og:type" content="website">';
    echo '<meta property="og:url" content="' . $canonical_url . '">';
    echo '<meta property="og:title" content="MUTESOUND · 음악 학원 · 연습실 전문 방음 시공">';
    echo '<meta property="og:description" content="지상층 드럼 방음까지 가능한 국내 소수 전문 업체. 현장 실측 기반 차음 설계로 -60dB 이상의 방음 성능을 구현합니다.">';
    echo '<meta property="og:image" content="' . $og_url . '">';
    echo '<meta name="twitter:card" content="summary_large_image">';
    echo '<meta name="twitter:title" content="MUTESOUND · 음악 학원 · 연습실 전문 방음 시공">';
    echo '<meta name="twitter:description" content="지상층 드럼 방음까지 가능한 국내 소수 전문 업체. 현장 실측 기반 차음 설계로 -60dB 이상의 방음 성능을 구현합니다.">';
    echo '<meta name="twitter:image" content="' . $og_url . '">';
    echo '<link rel="preload" as="image" href="' . $hero_url . '" fetchpriority="high">';
    echo '<link rel="stylesheet" href="' . $css_url . '">';
    echo '<style>html,body{margin:0;padding:0;background:#f7f9fb;}body{font-family:Pretendard,system-ui,-apple-system,BlinkMacSystemFont,sans-serif;}</style>';
    echo '</head><body>';
    echo $html;
    echo '<script>window.MUTESOUND_ASSET_BASE = ' . $asset_base . ';</script>';
    echo '<script src="' . $js_url . '" defer></script>';
    echo '</body></html>';
    exit;
}

add_action('template_redirect', 'mutesound_landing_render_full_page', 0);
