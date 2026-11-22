<a class="tile" href="<?php the_permalink(); ?>">
	<?php if ( has_post_thumbnail() ) : ?>
		<div class="tile-img"><?php the_post_thumbnail( 'efim-card', array( 'loading' => 'lazy' ) ); ?></div>
	<?php else : ?>
		<div class="tile-img ph" aria-hidden="true"></div>
	<?php endif; ?>
	<div class="tile-body">
		<h3><?php the_title(); ?></h3>
		<?php if ( has_excerpt() ) : ?><p><?php echo esc_html( get_the_excerpt() ); ?></p><?php endif; ?>
	</div>
</a>
