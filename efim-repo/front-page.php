<?php
get_header();
$own = new WP_Query( array(
	'post_type' => 'efim_product', 'posts_per_page' => 8,
	'orderby' => array( 'menu_order' => 'ASC', 'date' => 'DESC' ),
	'tax_query' => array( array( 'taxonomy' => 'efim_kind', 'field' => 'slug', 'terms' => 'own' ) ),
) );
$brands   = get_terms( array( 'taxonomy' => 'efim_brand', 'hide_empty' => false, 'orderby' => 'term_id' ) );
$projects = new WP_Query( array( 'post_type' => 'efim_project', 'posts_per_page' => 3 ) );
$hero_img = efim_opt( 'hero_image' );
?>
<main id="main">
	<section class="hero">
		<div class="wrap hero-grid">
			<div>
				<h1><?php echo esc_html( efim_opt( 'hero_title' ) ); ?></h1>
				<p><?php echo esc_html( efim_opt( 'hero_text' ) ); ?></p>
				<div class="hero-actions">
					<a class="btn" href="#contact">Запросить КП</a>
					<a class="btn btn--ghost" href="<?php echo esc_url( get_post_type_archive_link( 'efim_product' ) ); ?>">Смотреть оборудование</a>
				</div>
			</div>
			<div class="hero-art">
				<?php if ( $hero_img ) : ?>
					<img src="<?php echo esc_url( $hero_img ); ?>" alt="">
				<?php else : ?>
					<svg viewBox="0 0 520 420" role="img" aria-label="Стойловое оборудование">
						<path class="draw thin d1" pathLength="1" d="M20 384H500"/>
						<path class="draw d1" pathLength="1" d="M90 384V140"/>
						<path class="draw d1" pathLength="1" d="M200 384V140"/>
						<path class="draw d2" pathLength="1" d="M310 384V140"/>
						<path class="draw d2" pathLength="1" d="M420 384V140"/>
						<path class="draw d3" pathLength="1" d="M60 140H450"/>
						<path class="draw d3" pathLength="1" d="M60 250H450"/>
						<path class="draw hot" pathLength="1" d="M200 140Q255 30 310 140"/>
					</svg>
				<?php endif; ?>
			</div>
		</div>
	</section>

	<section class="sec" id="production">
		<div class="wrap">
			<div class="sec-row sec-head">
				<div>
					<h2>Производим сами</h2>
					<p>Оборудование собственного производства для ферм и комплексов.</p>
				</div>
				<a class="go" href="<?php echo esc_url( get_post_type_archive_link( 'efim_product' ) ); ?>">Весь каталог</a>
			</div>
			<?php if ( $own->have_posts() ) : ?>
				<div class="grid-tiles">
					<?php while ( $own->have_posts() ) : $own->the_post(); get_template_part( 'template-parts/tile' ); endwhile; wp_reset_postdata(); ?>
				</div>
			<?php endif; ?>
		</div>
	</section>

	<?php if ( $brands && ! is_wp_error( $brands ) ) : ?>
	<section class="sec sec--zinc" id="brands">
		<div class="wrap">
			<div class="sec-head">
				<h2>Официальные дилеры мировых производителей</h2>
				<p>Поставляем оборудование проверенных брендов и обеспечиваем сервис.</p>
			</div>
			<div class="brands">
				<?php foreach ( $brands as $t ) : ?>
					<a class="brand-row" href="<?php echo esc_url( get_term_link( $t ) ); ?>">
						<h3><?php echo esc_html( $t->name ); ?></h3>
						<p><?php echo esc_html( $t->description ); ?></p>
						<span class="go">Подробнее</span>
					</a>
				<?php endforeach; ?>
			</div>
		</div>
	</section>
	<?php endif; ?>

	<section class="sec">
		<div class="wrap">
			<div class="sec-head"><h2>Как мы работаем</h2></div>
			<div class="steps">
				<div class="step"><b>1</b><h3>Подбор</h3><p>Отдел продаж помогает подобрать оборудование под вашу ферму и задачи.</p></div>
				<div class="step"><b>2</b><h3>Поставка</h3><p>Снабжение и логистика отвечают за сроки, маршруты и комплектующие.</p></div>
				<div class="step"><b>3</b><h3>Монтаж и сервис</h3><p>Сервисный отдел монтирует, обслуживает и поддерживает оборудование.</p></div>
			</div>
		</div>
	</section>

	<?php if ( $projects->have_posts() ) : ?>
	<section class="sec sec--zinc">
		<div class="wrap">
			<div class="sec-row sec-head">
				<h2>Наши проекты</h2>
				<a class="go" href="<?php echo esc_url( get_post_type_archive_link( 'efim_project' ) ); ?>">Все проекты</a>
			</div>
			<div class="grid-tiles">
				<?php while ( $projects->have_posts() ) : $projects->the_post(); get_template_part( 'template-parts/tile' ); endwhile; wp_reset_postdata(); ?>
			</div>
		</div>
	</section>
	<?php endif; ?>

	<?php get_template_part( 'template-parts/contact' ); ?>
</main>
<?php get_footer(); ?>
