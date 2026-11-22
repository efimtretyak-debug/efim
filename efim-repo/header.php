<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip" href="#main">Перейти к содержимому</a>
<header class="site-header">
	<div class="wrap bar">
		<?php if ( has_custom_logo() ) : echo get_custom_logo(); else : ?>
			<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>">
				<strong>EFIM</strong><span>FARM TECHNOLOGIES</span>
			</a>
		<?php endif; ?>
		<button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Меню</button>
		<nav class="site-nav" id="site-nav" aria-label="Главное меню">
			<?php wp_nav_menu( array( 'theme_location' => 'primary', 'container' => false, 'menu_class' => 'menu', 'fallback_cb' => 'efim_fallback_menu' ) ); ?>
		</nav>
		<div class="hd-cta">
			<a class="hd-phone" href="<?php echo esc_url( efim_tel_url() ); ?>"><?php echo esc_html( efim_opt( 'phone' ) ); ?></a>
			<?php if ( efim_wa_url() ) : ?><a class="btn btn--sm" href="<?php echo esc_url( efim_wa_url() ); ?>">WhatsApp</a><?php endif; ?>
		</div>
	</div>
</header>
