<?php
get_header();
$is_prod = is_post_type_archive( 'efim_product' ) || is_tax( array( 'efim_kind', 'efim_brand' ) );
if ( is_tax() ) { $title = single_term_title( '', false ); }
elseif ( is_post_type_archive() ) { $title = post_type_archive_title( '', false ); }
else { $title = wp_strip_all_tags( get_the_archive_title() ); }
?>
<main id="main">
	<section class="sec">
		<div class="wrap">
			<header class="sec-head">
				<h1 class="h-page"><?php echo esc_html( $title ); ?></h1>
				<?php if ( is_tax() && term_description() ) : ?><p><?php echo wp_kses_post( term_description() ); ?></p><?php endif; ?>
			</header>
			<?php if ( $is_prod ) :
				$cur = get_queried_object();
				$cur_id = ( $cur && isset( $cur->term_id ) ) ? $cur->term_id : 0;
				$kinds  = get_terms( array( 'taxonomy' => 'efim_kind', 'hide_empty' => true ) );
				$brs    = get_terms( array( 'taxonomy' => 'efim_brand', 'hide_empty' => true ) );
			?>
				<div class="chips">
					<a href="<?php echo esc_url( get_post_type_archive_link( 'efim_product' ) ); ?>" class="<?php echo $cur_id ? '' : 'on'; ?>">Всё</a>
					<?php foreach ( array_merge( (array) $kinds, (array) $brs ) as $t ) : if ( is_wp_error( $t ) || ! is_object( $t ) ) { continue; } ?>
						<a href="<?php echo esc_url( get_term_link( $t ) ); ?>" class="<?php echo ( $cur_id === $t->term_id ) ? 'on' : ''; ?>"><?php echo esc_html( $t->name ); ?></a>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>

			<?php if ( have_posts() ) : ?>
				<div class="grid-tiles">
					<?php while ( have_posts() ) : the_post(); get_template_part( 'template-parts/tile' ); endwhile; ?>
				</div>
				<?php the_posts_pagination( array( 'mid_size' => 1, 'prev_text' => 'Назад', 'next_text' => 'Далее' ) ); ?>
			<?php else : ?>
				<p>Здесь пока ничего нет. Запросите коммерческое предложение, и мы подберём оборудование под вашу задачу.</p>
			<?php endif; ?>
		</div>
	</section>
	<?php get_template_part( 'template-parts/contact' ); ?>
</main>
<?php get_footer(); ?>
