/**
 * Rakta Business OS - WordPress Frontend JavaScript
 */

(function($) {
  'use strict';

  $(document).ready(function() {
    // Intercept lead form submissions
    $(document).on('submit', '.rakta-ajax-lead-form', function(e) {
      e.preventDefault();

      var $form = $(this);
      var $btn = $form.find('.rakta-submit-btn');
      var $spinner = $form.find('.rakta-spinner');
      var $response = $form.find('.rakta-form-response');
      var cardSlug = $form.data('card-slug');

      var name = $form.find('input[name="name"]').val().trim();
      var phone = $form.find('input[name="phone"]').val().trim();
      var email = $form.find('input[name="email"]').val().trim();
      var message = $form.find('textarea[name="message"]').val().trim();

      if (!name || !phone) {
        $response
          .removeClass('success')
          .addClass('error')
          .html('Please fill in both your Name and Mobile Number.')
          .slideDown();
        return;
      }

      // Set loading state
      $btn.prop('disabled', true);
      $spinner.show();
      $response.hide();

      $.ajax({
        url: window.raktaConfig ? window.raktaConfig.ajaxUrl : '/wp-admin/admin-ajax.php',
        type: 'POST',
        data: {
          action: 'rakta_submit_lead',
          nonce: window.raktaConfig ? window.raktaConfig.nonce : '',
          card_slug: cardSlug,
          name: name,
          phone: phone,
          email: email,
          message: message
        },
        dataType: 'json',
        success: function(res) {
          $btn.prop('disabled', false);
          $spinner.hide();

          if (res.success) {
            $response
              .removeClass('error')
              .addClass('success')
              .html(res.data.message || 'Thank you! Your enquiry has been received.')
              .slideDown();

            // Clear inputs
            $form[0].reset();
          } else {
            $response
              .removeClass('success')
              .addClass('error')
              .html(res.data && res.data.message ? res.data.message : 'Something went wrong. Please try again.')
              .slideDown();
          }
        },
        error: function() {
          $btn.prop('disabled', false);
          $spinner.hide();
          $response
            .removeClass('success')
            .addClass('error')
            .html('Unable to connect to the server. Please check your internet connection.')
            .slideDown();
        }
      });
    });
  });
})(jQuery);
