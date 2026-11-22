<?php get_header(); ?>
<main id="main">
	<section class="sec">
		<div class="wrap">
			<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
				<article>
					<h1 class="h-page"><?php the_title(); ?></h1>
					<?php if ( has_post_thumbnail() && is_singular() ) : ?><div class="single-media" style="margin-bottom:28px;max-width:720px"><?php the_post_thumbnail( 'large' ); ?></div><?php endif; ?>
					<div class="prose"><?php is_singular() ? the_content() : the_excerpt(); ?></div>
				</article>
			<?php endwhile; the_posts_pagination(); else : ?>
				<h1 class="h-page">Страница не найдена</h1>
				<p><a class="go" href="<?php echo esc_url( home_url( '/' ) ); ?>">Перейти на главную</a></p>
			<?php endif; ?>
		</div>
	</section>
	<?php if ( is_singular( 'efim_project' ) ) { get_template_part( 'template-parts/contact' ); } ?>
</main>
<?php get_footer(); ?>
