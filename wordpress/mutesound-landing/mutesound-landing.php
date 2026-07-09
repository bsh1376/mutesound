<?php
/**
 * Plugin Name: MUTESOUND Landing Page
 * Description: MUTESOUND landing page shortcode for WordPress. Use [mutesound_landing] on a page.
 * Version: 1.0.0
 * Author: MUTESOUND
 * License: GPL-2.0-or-later
 */

if (!defined('ABSPATH')) {
    exit;
}

function mutesound_landing_shortcode() {
    $template_path = plugin_dir_path(__FILE__) . 'templates/landing.html';
    if (!file_exists($template_path)) {
        return '<p>MUTESOUND landing template is missing.</p>';
    }

    $html = file_get_contents($template_path);
    $base_url = esc_url(plugin_dir_url(__FILE__));

    $html = str_replace(
        array('src="assets/', 'src="uploads/', 'href="assets/'),
        array('src="' . $base_url . 'assets/', 'src="' . $base_url . 'uploads/', 'href="' . $base_url . 'assets/'),
        $html
    );

    $css_url = esc_url($base_url . 'assets/mutesound.css?ver=1.0.0');
    $js_url = esc_url($base_url . 'assets/mutesound.js?ver=1.0.0');
    $asset_base = wp_json_encode($base_url);

    return '<link rel="stylesheet" href="' . $css_url . '">' .
        $html .
        '<script>window.MUTESOUND_ASSET_BASE = ' . $asset_base . ';</script>' .
        '<script src="' . $js_url . '" defer></script>';
}

add_shortcode('mutesound_landing', 'mutesound_landing_shortcode');
