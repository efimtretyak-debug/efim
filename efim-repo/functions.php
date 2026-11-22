<?php
/**
 * EFIM Farm Technologies — тема.
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
define( 'EFIM_VER', '1.0.0' );

/* ---------- Настройки по умолчанию (меняются в Внешний вид → Настроить) ---------- */
function efim_defaults() {
	return array(
		'hero_title'  => 'Мы реально производим оборудование для ферм',
		'hero_text'   => 'Производство и продажа оборудования для животноводства. Подбираем, поставляем, монтируем и обслуживаем.',
		'hero_image'  => '',
		'phone'       => '+7 777 544 06 51',
		'whatsapp'    => '77775440651',
		'email'       => 'efim@efimfarmtechnologies.kz',
		'address'     => 'Тобыл, Тәуелсіздік 69/1',
		'map_query'   => 'тобыл тауелсыздык 69/1',
		'facebook'    => 'https://www.facebook.com/share/1Csv8hzAcr/',
		'youtube'     => 'https://youtube.com/@agralfarm4406',
		'instagram'   => 'https://www.instagram.com/agral_farm',
		'tiktok'      => 'https://www.tiktok.com/@timka2406',
	);
}
function efim_opt( $key ) {
	$d = efim_defaults();
	return get_theme_mod( 'efim_' . $key, isset( $d[ $key ] ) ? $d[ $key ] : '' );
}
function efim_wa_url() {
	$n = preg_replace( '/\D+/', '', efim_opt( 'whatsapp' ) );
	return $n ? 'https://wa.me/' . $n : '';
}
function efim_tel_url() {
	return 'tel:+' . preg_replace( '/\D+/', '', efim_opt( 'phone' ) );
}

/* ---------- Базовая настройка темы ---------- */
function efim_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'custom-logo', array( 'height' => 80, 'width' => 240, 'flex-width' => true, 'flex-height' => true ) );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
	add_theme_support( 'responsive-embeds' );
	register_nav_menus( array(
		'primary' => 'Главное меню',
		'footer'  => 'Меню в подвале',
	) );
	add_image_size( 'efim-card', 800, 600, true );
}
add_action( 'after_setup_theme', 'efim_setup' );

function efim_assets() {
	wp_enqueue_style( 'efim-fonts', 'https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Unbounded:wght@500;700&display=swap', array(), null );
	wp_enqueue_style( 'efim-style', get_stylesheet_uri(), array(), EFIM_VER );
	wp_enqueue_script( 'efim-main', get_template_directory_uri() . '/assets/main.js', array(), EFIM_VER, true );
}
add_action( 'wp_enqueue_scripts', 'efim_assets' );

/* ---------- Разделы в админке: Оборудование, Проекты, Заявки ---------- */
function efim_register_types() {
	register_post_type( 'efim_product', array(
		'labels' => array(
			'name' => 'Оборудование', 'singular_name' => 'Позиция', 'menu_name' => 'Оборудование',
			'add_new' => 'Добавить', 'add_new_item' => 'Добавить оборудование', 'edit_item' => 'Изменить',
			'all_items' => 'Всё оборудование', 'search_items' => 'Найти оборудование', 'not_found' => 'Ничего не найдено',
		),
		'public' => true, 'has_archive' => 'equipment', 'rewrite' => array( 'slug' => 'equipment' ),
		'menu_icon' => 'dashicons-hammer', 'menu_position' => 5, 'show_in_rest' => true,
		'supports' => array( 'title', 'editor', 'excerpt', 'thumbnail', 'page-attributes' ),
	) );
	register_taxonomy( 'efim_kind', 'efim_product', array(
		'labels' => array( 'name' => 'Тип', 'singular_name' => 'Тип', 'menu_name' => 'Тип (своё / дилерское)' ),
		'hierarchical' => true, 'public' => true, 'show_in_rest' => true, 'show_admin_column' => true,
		'rewrite' => array( 'slug' => 'kind' ),
	) );
	register_taxonomy( 'efim_brand', 'efim_product', array(
		'labels' => array( 'name' => 'Бренды', 'singular_name' => 'Бренд', 'menu_name' => 'Бренды', 'add_new_item' => 'Добавить бренд' ),
		'hierarchical' => true, 'public' => true, 'show_in_rest' => true, 'show_admin_column' => true,
		'rewrite' => array( 'slug' => 'brand' ),
	) );
	register_post_type( 'efim_project', array(
		'labels' => array(
			'name' => 'Проекты', 'singular_name' => 'Проект', 'menu_name' => 'Проекты',
			'add_new' => 'Добавить', 'add_new_item' => 'Добавить проект', 'edit_item' => 'Изменить', 'all_items' => 'Все проекты',
		),
		'public' => true, 'has_archive' => 'projects', 'rewrite' => array( 'slug' => 'projects' ),
		'menu_icon' => 'dashicons-building', 'menu_position' => 6, 'show_in_rest' => true,
		'supports' => array( 'title', 'editor', 'excerpt', 'thumbnail', 'page-attributes' ),
	) );
	register_post_type( 'efim_lead', array(
		'labels' => array( 'name' => 'Заявки', 'singular_name' => 'Заявка', 'menu_name' => 'Заявки', 'all_items' => 'Все заявки', 'not_found' => 'Заявок пока нет' ),
		'public' => false, 'show_ui' => true, 'show_in_menu' => true, 'menu_icon' => 'dashicons-email-alt', 'menu_position' => 7,
		'supports' => array( 'title', 'editor' ), 'capability_type' => 'post',
	) );
}
add_action( 'init', 'efim_register_types' );

/* ---------- Настройки в «Внешний вид → Настроить» ---------- */
function efim_customize( $wp ) {
	$wp->add_section( 'efim_company', array( 'title' => 'EFIM: главная и контакты', 'priority' => 30 ) );
	$fields = array(
		'hero_title' => array( 'Заголовок на главной', 'text' ),
		'hero_text'  => array( 'Текст под заголовком', 'textarea' ),
		'phone'      => array( 'Телефон (как показывать)', 'text' ),
		'whatsapp'   => array( 'WhatsApp (только цифры, с кодом страны)', 'text' ),
		'email'      => array( 'Эл. почта для заявок', 'text' ),
		'address'    => array( 'Адрес', 'text' ),
		'map_query'  => array( 'Адрес для карты Google', 'text' ),
		'facebook'   => array( 'Facebook (ссылка)', 'text' ),
		'youtube'    => array( 'YouTube (ссылка)', 'text' ),
		'instagram'  => array( 'Instagram (ссылка)', 'text' ),
		'tiktok'     => array( 'TikTok (ссылка)', 'text' ),
	);
	$d = efim_defaults();
	foreach ( $fields as $k => $f ) {
		$wp->add_setting( 'efim_' . $k, array( 'default' => $d[ $k ], 'sanitize_callback' => 'sanitize_text_field' ) );
		$wp->add_control( 'efim_' . $k, array( 'label' => $f[0], 'section' => 'efim_company', 'type' => $f[1] ) );
	}
	$wp->add_setting( 'efim_hero_image', array( 'default' => '', 'sanitize_callback' => 'esc_url_raw' ) );
	$wp->add_control( new WP_Customize_Image_Control( $wp, 'efim_hero_image', array(
		'label' => 'Фото на главной (если не задано — рисунок)', 'section' => 'efim_company',
	) ) );
}
add_action( 'customize_register', 'efim_customize' );

/* ---------- Меню по умолчанию ---------- */
function efim_fallback_menu() {
	$items = array(
		array( home_url( '/#production' ), 'Производство' ),
		array( get_post_type_archive_link( 'efim_product' ), 'Оборудование' ),
		array( home_url( '/#brands' ), 'Бренды' ),
		array( get_post_type_archive_link( 'efim_project' ), 'Проекты' ),
		array( home_url( '/about/' ), 'О компании' ),
		array( home_url( '/#contact' ), 'Контакты' ),
	);
	echo '<ul class="menu">';
	foreach ( $items as $i ) {
		if ( $i[0] ) { echo '<li><a href="' . esc_url( $i[0] ) . '">' . esc_html( $i[1] ) . '</a></li>'; }
	}
	echo '</ul>';
}

/* ---------- Заявки с сайта ---------- */
function efim_handle_lead() {
	$back = wp_get_referer() ? wp_get_referer() : home_url( '/' );
	$back = remove_query_arg( array( 'lead' ), $back );
	$fail = add_query_arg( 'lead', 'error', $back ) . '#contact';

	$name    = sanitize_text_field( wp_unslash( isset( $_POST['name'] ) ? $_POST['name'] : '' ) );
	$phone   = sanitize_text_field( wp_unslash( isset( $_POST['phone'] ) ? $_POST['phone'] : '' ) );
	$message = sanitize_textarea_field( wp_unslash( isset( $_POST['message'] ) ? $_POST['message'] : '' ) );
	$product = sanitize_text_field( wp_unslash( isset( $_POST['product'] ) ? $_POST['product'] : '' ) );

	if ( ! empty( $_POST['website'] ) ) { wp_safe_redirect( $fail ); exit; } // ловушка для ботов
	if ( '' === $name || strlen( preg_replace( '/\D+/', '', $phone ) ) < 9 || empty( $_POST['consent'] ) ) {
		wp_safe_redirect( $fail ); exit;
	}

	$body = "Имя: $name\nТелефон: $phone\n" . ( $product ? "Позиция: $product\n" : '' ) . ( $message ? "Сообщение: $message\n" : '' );
	$id   = wp_insert_post( array(
		'post_type' => 'efim_lead', 'post_status' => 'private',
		'post_title' => $name . ' — ' . $phone, 'post_content' => $body,
	) );

	// Точка подключения для Telegram-бота и других интеграций.
	do_action( 'efim_new_lead', array( 'name' => $name, 'phone' => $phone, 'message' => $message, 'product' => $product, 'text' => $body ), $id );

	$to = is_email( efim_opt( 'email' ) ) ? efim_opt( 'email' ) : get_option( 'admin_email' );
	wp_mail( $to, 'Новая заявка с сайта: ' . $name, $body );

	wp_safe_redirect( add_query_arg( 'lead', 'ok', $back ) . '#contact' );
	exit;
}
add_action( 'admin_post_nopriv_efim_lead', 'efim_handle_lead' );
add_action( 'admin_post_efim_lead', 'efim_handle_lead' );

/* ---------- Стартовое наполнение при первой активации темы ---------- */
function efim_seed() {
	if ( get_option( 'efim_seeded' ) ) { flush_rewrite_rules(); return; }

	foreach ( array( 'own' => 'Собственное производство', 'dealer' => 'Дилерское оборудование' ) as $slug => $name ) {
		if ( ! term_exists( $slug, 'efim_kind' ) ) { wp_insert_term( $name, 'efim_kind', array( 'slug' => $slug ) ); }
	}

	$own = array(
		'Стойловое оборудование'        => 'Комфортные ограждения, перегородки, калитки и другое стойловое оборудование.',
		'Индивидуальные клетки для телят' => 'Клетки для содержания телят.',
		'Скреперные системы'            => 'Скреперные системы для навозоудаления.',
		'Групповые боксы'               => 'Групповые боксы для молодняка и родильного отделения.',
		'Ветеринарные станки'           => 'Станки разных модификаций.',
		'Световентиляционный конёк'     => 'Изготавливаем индивидуально под каждое здание.',
		'Хэдлоки'                       => 'Самофиксирующая кормовая решётка (хэдлок) для КРС.',
		'Групповые поилки'              => 'Групповые поилки с подогревом.',
	);
	$order = 1;
	foreach ( $own as $title => $text ) {
		$id = wp_insert_post( array( 'post_type' => 'efim_product', 'post_status' => 'publish', 'post_title' => $title, 'post_excerpt' => $text, 'menu_order' => $order++ ) );
		if ( $id && ! is_wp_error( $id ) ) { wp_set_object_terms( $id, 'own', 'efim_kind' ); }
	}

	$brands = array(
		array( 'Faresin', 'Смесители-кормораздатчики Faresin', 'Самоходные и прицепные смесители-кормораздатчики для животноводческих ферм.' ),
		array( 'Dairymaster', 'Доильные залы Dairymaster', 'Доильное оборудование, кормление, автоматические скреперы, танки охлаждения молока, мониторинг здоровья и фертильности животных.' ),
		array( 'Kraiburg', 'Резиновые маты Kraiburg', 'Резиновые покрытия для комфорта и благополучия животных.' ),
		array( 'Eisele', 'Насосы и сепараторы навоза Eisele', 'Насосы и оборудование для удаления и сепарации навоза, в том числе для биогазовых установок.' ),
		array( 'Dinamica Generale', 'Контроль кормов Dinamica Generale', 'Датчики взвешивания, NIR-анализаторы, трекеры данных и программное обеспечение для управления кормами.' ),
		array( 'Urban', 'Выпойка телят Urban', 'Мобильное и автоматизированное кормление телят и ягнят, поилка Alma Pro.' ),
		array( 'MWS', 'Режущие ножи MWS для кормосмесителей', 'Ножи для смесителей Siloking, Kuhn, BVL, Faresin, Triolet, АКМ, КИС и других. Всегда в наличии.' ),
	);
	foreach ( $brands as $b ) {
		if ( ! term_exists( $b[0], 'efim_brand' ) ) { wp_insert_term( $b[0], 'efim_brand', array( 'description' => $b[2] ) ); }
		$id = wp_insert_post( array( 'post_type' => 'efim_product', 'post_status' => 'publish', 'post_title' => $b[1], 'post_excerpt' => $b[2], 'menu_order' => $order++ ) );
		if ( $id && ! is_wp_error( $id ) ) {
			wp_set_object_terms( $id, 'dealer', 'efim_kind' );
			wp_set_object_terms( $id, $b[0], 'efim_brand' );
		}
	}

	if ( ! get_page_by_path( 'about' ) ) {
		wp_insert_post( array(
			'post_type' => 'page', 'post_status' => 'publish', 'post_title' => 'О компании', 'post_name' => 'about',
			'post_content' => '<p>Efim Farm Technologies производит и поставляет оборудование для животноводства. Отделы продаж, снабжения, логистики и сервиса помогают подобрать оборудование, поставить его на ферму, смонтировать и обслуживать.</p>',
		) );
	}
	update_option( 'efim_seeded', 1 );
	flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'efim_seed' );
