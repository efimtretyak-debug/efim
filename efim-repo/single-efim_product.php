<?php get_header(); while ( have_posts() ) : the_post();
	$brands = get_the_terms( get_the_ID(), 'efim_brand' );
	$kinds  = get_the_terms( get_the_ID(), 'efim_kind' );
	$meta   = array();
	if ( $kinds && ! is_wp_error( $kinds ) ) { $meta[] = $kinds[0]->name; }
	if ( $brands && ! is_wp_error( $brands ) ) { $meta[] = 'Бренд: ' . $brands[0]->name; }
?>
<main id="main">
	<section class="sec">
		<div class="wrap">
			<nav class="crumbs" aria-label="Навигация"><a href="<?php echo esc_url( home_url( '/' ) ); ?>">Главная</a> / <a href="<?php echo esc_url( get_post_type_archive_link( 'efim_product' ) ); ?>">Оборудование</a></nav>
			<div class="single-grid">
				<?php if ( has_post_thumbnail() ) : ?>
					<div class="single-media"><?php the_post_thumbnail( 'large' ); ?></div>
				<?php else : ?>
					<div class="single-media ph" aria-hidden="true"></div>
				<?php endif; ?>
				<div>
					<h1 class="h-page"><?php the_title(); ?></h1>
					<?php if ( $meta ) : ?><p class="meta"><?php echo esc_html( implode( ' · ', $meta ) ); ?></p><?php endif; ?>
					<?php if ( has_excerpt() ) : ?><p class="lead-p"><?php echo esc_html( get_the_excerpt() ); ?></p><?php endif; ?>
					<div class="prose"><?php the_content(); ?></div>
					<p><a class="btn" href="#contact">Запросить КП на эту позицию</a></p>
				</div>
			</div>
		</div>
	</section>
	<?php get_template_part( 'template-parts/contact' ); ?>
</main>
<?php endwhile; get_footer(); ?>
