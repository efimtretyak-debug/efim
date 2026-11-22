<?php
$product = is_singular( 'efim_product' ) ? get_the_title() : sanitize_text_field( wp_unslash( isset( $_GET['product'] ) ? $_GET['product'] : '' ) );
$status  = sanitize_key( isset( $_GET['lead'] ) ? $_GET['lead'] : '' );
$privacy = get_privacy_policy_url();
?>
<section class="sec sec--zinc" id="contact">
	<div class="wrap contact">
		<div>
			<h2>Запросить коммерческое предложение</h2>
			<p>Расскажите, что нужно для фермы, и мы подберём оборудование и пришлём предложение.</p>
			<dl>
				<dt>Телефон и WhatsApp</dt>
				<dd><a href="<?php echo esc_url( efim_tel_url() ); ?>"><?php echo esc_html( efim_opt( 'phone' ) ); ?></a></dd>
				<dt>Эл. почта</dt>
				<dd><a href="mailto:<?php echo esc_attr( efim_opt( 'email' ) ); ?>"><?php echo esc_html( efim_opt( 'email' ) ); ?></a></dd>
				<dt>Адрес</dt>
				<dd><?php echo esc_html( efim_opt( 'address' ) ); ?></dd>
			</dl>
			<?php if ( efim_opt( 'map_query' ) ) : ?>
				<iframe title="Карта" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
					src="<?php echo esc_url( 'https://maps.google.com/maps?q=' . rawurlencode( efim_opt( 'map_query' ) ) . '&z=12&output=embed' ); ?>"></iframe>
			<?php endif; ?>
		</div>
		<div class="panel">
			<h3>Заявка</h3>
			<?php if ( 'ok' === $status ) : ?>
				<p class="notice ok" role="status">Заявка отправлена. Мы свяжемся с вами в рабочее время.</p>
			<?php elseif ( 'error' === $status ) : ?>
				<p class="notice err" role="alert">Не удалось отправить. Проверьте имя, телефон и отметьте согласие на обработку данных.</p>
			<?php endif; ?>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="efim_lead">
				<div class="hp" aria-hidden="true"><label>Сайт <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
				<div class="field"><label for="lf-name">Имя</label><input type="text" id="lf-name" name="name" required autocomplete="name"></div>
				<div class="field"><label for="lf-phone">Телефон</label><input type="tel" id="lf-phone" name="phone" required autocomplete="tel" placeholder="+7"></div>
				<div class="field"><label for="lf-product">Что нужно</label><input type="text" id="lf-product" name="product" value="<?php echo esc_attr( $product ); ?>" placeholder="Например: хэдлоки на 200 голов"></div>
				<div class="field"><label for="lf-msg">Комментарий</label><textarea id="lf-msg" name="message"></textarea></div>
				<label class="check"><input type="checkbox" name="consent" value="1" required>
					<span>Согласен на обработку персональных данных<?php if ( $privacy ) : ?> (<a href="<?php echo esc_url( $privacy ); ?>">политика конфиденциальности</a>)<?php endif; ?></span></label>
				<button class="btn" type="submit">Отправить заявку</button>
			</form>
		</div>
	</div>
</section>
