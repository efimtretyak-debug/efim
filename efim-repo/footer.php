<footer class="site-footer">
	<div class="wrap">
		<div class="foot-grid">
			<div>
				<h4>Efim Farm Technologies</h4>
				<p>Производство и продажа оборудования для животноводства.</p>
			</div>
			<div>
				<h4>Оборудование</h4>
				<ul>
					<li><a href="<?php echo esc_url( get_post_type_archive_link( 'efim_product' ) ); ?>">Каталог</a></li>
					<li><a href="<?php echo esc_url( home_url( '/#brands' ) ); ?>">Бренды</a></li>
					<li><a href="<?php echo esc_url( get_post_type_archive_link( 'efim_project' ) ); ?>">Проекты</a></li>
				</ul>
			</div>
			<div>
				<h4>Клиентам</h4>
				<ul>
					<li><a href="<?php echo esc_url( home_url( '/#contact' ) ); ?>">Запросить коммерческое предложение</a></li>
					<li><a href="<?php echo esc_url( home_url( '/about/' ) ); ?>">О компании</a></li>
					<?php if ( get_privacy_policy_url() ) : ?><li><a href="<?php echo esc_url( get_privacy_policy_url() ); ?>">Политика конфиденциальности</a></li><?php endif; ?>
				</ul>
			</div>
			<div>
				<h4>Мы в сети</h4>
				<ul>
					<?php
					$soc = array( 'facebook' => 'Facebook', 'youtube' => 'YouTube', 'instagram' => 'Instagram', 'tiktok' => 'TikTok' );
					foreach ( $soc as $k => $label ) {
						$u = efim_opt( $k );
						if ( $u ) { echo '<li><a href="' . esc_url( $u ) . '" rel="noopener" target="_blank">' . esc_html( $label ) . '</a></li>'; }
					}
					if ( efim_wa_url() ) { echo '<li><a href="' . esc_url( efim_wa_url() ) . '" rel="noopener">WhatsApp</a></li>'; }
					?>
				</ul>
			</div>
		</div>
		<div class="foot-bottom">
			<span>© <?php echo esc_html( gmdate( 'Y' ) ); ?> Efim Farm Technologies</span>
			<span><?php echo esc_html( efim_opt( 'address' ) ); ?></span>
		</div>
	</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
