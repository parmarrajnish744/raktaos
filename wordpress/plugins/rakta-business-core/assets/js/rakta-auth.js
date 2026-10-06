/**
 * Rakta Business OS - WordPress Client-Side Supabase Auth
 * Unifies marketing pages with SaaS portal with zero password synchronization
 * and zero duplicate WordPress database authentication.
 */

(function($) {
  'use strict';

  var config = window.raktaAuthConfig || {};
  var supabaseClient = null;

  // Cross-domain cookie helper
  function setSessionCookie(key, value) {
    var isProd = window.location.hostname.indexOf('raktabusiness.com') !== -1;
    var domain = isProd ? '; domain=.raktabusiness.com' : '';
    var secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = key + '=' + encodeURIComponent(value) + '; path=/; max-age=2592000; SameSite=Lax' + secure + domain;
  }

  function clearSessionCookie(key) {
    var isProd = window.location.hostname.indexOf('raktabusiness.com') !== -1;
    var domain = isProd ? '; domain=.raktabusiness.com' : '';
    document.cookie = key + '=; path=/; max-age=0; SameSite=Lax' + domain;
  }

  // Initialize Supabase Client
  function initSupabase() {
    if (window.supabase && config.url && config.anonKey) {
      supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
          storageKey: 'rakta_supabase_auth_session'
        }
      });
      return true;
    }
    return false;
  }

  // Refresh Navbar Widgets based on active session
  function updateNavWidgets(session) {
    var $navs = $('.rakta-auth-nav-container');
    if (!$navs.length) return;

    if (session && session.user) {
      var user = session.user;
      var name = user.user_metadata && user.user_metadata.name ? user.user_metadata.name : (user.email ? user.email.split('@')[0] : 'Account');
      $navs.find('.rakta-nav-guest').hide();
      $navs.find('.rakta-nav-user').css('display', 'flex');
      $navs.find('.rakta-user-name-display').text('Hi, ' + name);
    } else {
      $navs.find('.rakta-nav-user').hide();
      $navs.find('.rakta-nav-guest').css('display', 'flex');
    }
  }

  // Show notice inside an auth card
  function showCardNotice($card, type, message, actionHtml) {
    var $notice = $card.find('.rakta-auth-notice');
    $notice
      .removeClass('notice-error notice-success notice-warning')
      .addClass('notice-' + type)
      .html('<div class="rakta-notice-text">' + message + '</div>' + (actionHtml || ''))
      .slideDown();
  }

  function hideCardNotice($card) {
    $card.find('.rakta-auth-notice').slideUp().empty();
  }

  $(document).ready(function() {
    // 1. Initialize Supabase
    if (!initSupabase()) {
      console.warn('Rakta Auth: Supabase client not initialized. Ensure URL and Anon Key are set.');
      return;
    }

    // 2. Check initial session and update nav
    supabaseClient.auth.getSession().then(function(res) {
      if (res.data && res.data.session) {
        updateNavWidgets(res.data.session);
      }
    });

    // 3. Listen to auth state changes
    supabaseClient.auth.onAuthStateChange(function(event, session) {
      updateNavWidgets(session);
      if (event === 'SIGNED_IN' && session) {
        setSessionCookie('rakta_supabase_auth_session', JSON.stringify(session));
      } else if (event === 'SIGNED_OUT') {
        clearSessionCookie('rakta_supabase_auth_session');
      }
    });

    // 4. Modal Open/Close handlers
    var $modal = $('#rakta-global-auth-modal');

    $(document).on('click', '.rakta-open-auth-modal-btn, .rakta-open-login-btn', function(e) {
      e.preventDefault();
      if ($modal.length) {
        $modal.fadeIn(200);
        $modal.find('.rakta-tab-btn[data-tab="login"]').trigger('click');
      } else {
        window.location.href = (config.appUrl || 'https://app.raktabusiness.com') + '/login';
      }
    });

    $(document).on('click', '.rakta-open-register-btn', function(e) {
      e.preventDefault();
      if ($modal.length) {
        $modal.fadeIn(200);
        $modal.find('.rakta-tab-btn[data-tab="register"]').trigger('click');
      } else {
        window.location.href = (config.appUrl || 'https://app.raktabusiness.com') + '/register';
      }
    });

    $(document).on('click', '.rakta-modal-close, .rakta-modal-backdrop', function(e) {
      if (e.target === this) {
        $modal.fadeOut(150);
      }
    });

    // 5. Tab Switching
    $(document).on('click', '.rakta-tab-btn', function() {
      var tab = $(this).data('tab');
      var $card = $(this).closest('.rakta-auth-card');
      hideCardNotice($card);

      $card.find('.rakta-tab-btn').removeClass('active');
      $(this).addClass('active');

      $card.find('.rakta-auth-form').hide();
      if (tab === 'login') {
        $card.find('.rakta-form-login').fadeIn(150);
      } else if (tab === 'register') {
        $card.find('.rakta-form-register').fadeIn(150);
      }
    });

    $(document).on('click', '.rakta-switch-to-forgot', function() {
      var $card = $(this).closest('.rakta-auth-card');
      hideCardNotice($card);
      $card.find('.rakta-tab-btn').removeClass('active');
      $card.find('.rakta-auth-form').hide();
      $card.find('.rakta-form-forgot').fadeIn(150);
    });

    $(document).on('click', '.rakta-switch-to-login', function() {
      var $card = $(this).closest('.rakta-auth-card');
      $card.find('.rakta-tab-btn[data-tab="login"]').trigger('click');
    });

    // 6. Sign In Submission
    $(document).on('submit', '.rakta-form-login', function(e) {
      e.preventDefault();
      var $form = $(this);
      var $card = $form.closest('.rakta-auth-card');
      var $btn = $form.find('.rakta-btn-submit');
      var $spinner = $form.find('.rakta-auth-spinner');
      var redirect = $card.data('redirect') || '/dashboard';

      var email = $form.find('input[name="email"]').val().trim();
      var password = $form.find('input[name="password"]').val();

      if (!email || !password) return;

      hideCardNotice($card);
      $btn.prop('disabled', true);
      $spinner.show();

      supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      }).then(function(res) {
        $btn.prop('disabled', false);
        $spinner.hide();

        if (res.error) {
          var errorMsg = res.error.message || 'Invalid email or password.';
          if (errorMsg.toLowerCase().indexOf('email not confirmed') !== -1) {
            var resendBtn = '<button type="button" class="rakta-resend-btn" data-email="' + encodeURIComponent(email) + '" style="margin-top: 8px; font-size: 12px; font-weight: 700; color: #b45309; text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0;">Click here to resend verification email &rarr;</button>';
            showCardNotice($card, 'warning', 'Your email address is not verified yet. Please check your inbox.', resendBtn);
          } else {
            showCardNotice($card, 'error', errorMsg);
          }
          return;
        }

        // Success: Handle session handoff & redirect to SaaS
        showCardNotice($card, 'success', 'Signed in successfully! Redirecting...');
        var session = res.data.session;
        setSessionCookie('rakta_supabase_auth_session', JSON.stringify(session));

        var appUrl = config.appUrl || 'https://app.raktabusiness.com';
        var isCrossDomain = window.location.hostname.indexOf('raktabusiness.com') === -1;

        setTimeout(function() {
          if (isCrossDomain && session) {
            // Secure URL hash handoff for cross-domain / local dev
            window.location.href = appUrl + '/auth/callback#access_token=' + encodeURIComponent(session.access_token) + '&refresh_token=' + encodeURIComponent(session.refresh_token) + '&type=sso';
          } else {
            // Direct redirect (cookie provides instant session)
            window.location.href = appUrl + redirect;
          }
        }, 600);
      }).catch(function(err) {
        $btn.prop('disabled', false);
        $spinner.hide();
        showCardNotice($card, 'error', err.message || 'An unexpected error occurred.');
      });
    });

    // 7. Register Submission
    $(document).on('submit', '.rakta-form-register', function(e) {
      e.preventDefault();
      var $form = $(this);
      var $card = $form.closest('.rakta-auth-card');
      var $btn = $form.find('.rakta-btn-submit');
      var $spinner = $form.find('.rakta-auth-spinner');
      var redirect = $card.data('redirect') || '/dashboard/cards/create';

      var name = $form.find('input[name="name"]').val().trim();
      var email = $form.find('input[name="email"]').val().trim();
      var password = $form.find('input[name="password"]').val();

      if (!name || !email || !password) return;
      if (password.length < 6) {
        showCardNotice($card, 'error', 'Password must be at least 6 characters.');
        return;
      }

      hideCardNotice($card);
      $btn.prop('disabled', true);
      $spinner.show();

      var callbackUrl = (config.appUrl || 'https://app.raktabusiness.com') + '/auth/callback?type=signup';

      supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { name: name, role: 'USER' },
          emailRedirectTo: callbackUrl
        }
      }).then(function(res) {
        $btn.prop('disabled', false);
        $spinner.hide();

        if (res.error) {
          showCardNotice($card, 'error', res.error.message);
          return;
        }

        if (res.data.session) {
          // Auto-confirmed environment
          showCardNotice($card, 'success', 'Account created! Redirecting to card builder...');
          var session = res.data.session;
          setSessionCookie('rakta_supabase_auth_session', JSON.stringify(session));
          setTimeout(function() {
            window.location.href = (config.appUrl || 'https://app.raktabusiness.com') + redirect;
          }, 800);
        } else {
          // Email confirmation required
          showCardNotice($card, 'success', 'Account created! Please check your inbox at <strong>' + $('<div>').text(email).html() + '</strong> and confirm your email to activate your account.');
          $form[0].reset();
        }
      }).catch(function(err) {
        $btn.prop('disabled', false);
        $spinner.hide();
        showCardNotice($card, 'error', err.message || 'Registration failed.');
      });
    });

    // 8. Forgot Password Submission
    $(document).on('submit', '.rakta-form-forgot', function(e) {
      e.preventDefault();
      var $form = $(this);
      var $card = $form.closest('.rakta-auth-card');
      var $btn = $form.find('.rakta-btn-submit');
      var $spinner = $form.find('.rakta-auth-spinner');

      var email = $form.find('input[name="email"]').val().trim();
      if (!email) return;

      hideCardNotice($card);
      $btn.prop('disabled', true);
      $spinner.show();

      var callbackUrl = (config.appUrl || 'https://app.raktabusiness.com') + '/auth/callback?type=recovery';

      supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: callbackUrl
      }).then(function(res) {
        $btn.prop('disabled', false);
        $spinner.hide();

        if (res.error) {
          showCardNotice($card, 'error', res.error.message);
          return;
        }

        showCardNotice($card, 'success', 'Recovery link sent! Check your inbox for instructions to reset your password.');
        $form[0].reset();
      }).catch(function(err) {
        $btn.prop('disabled', false);
        $spinner.hide();
        showCardNotice($card, 'error', err.message || 'Password reset request failed.');
      });
    });

    // 9. Resend Verification Button Handler
    $(document).on('click', '.rakta-resend-btn', function() {
      var email = decodeURIComponent($(this).data('email') || '');
      var $card = $(this).closest('.rakta-auth-card');
      if (!email) return;

      $(this).text('Sending verification email...');
      var callbackUrl = (config.appUrl || 'https://app.raktabusiness.com') + '/auth/callback?type=signup';

      supabaseClient.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: callbackUrl
        }
      }).then(function(res) {
        if (res.error) {
          showCardNotice($card, 'error', res.error.message);
        } else {
          showCardNotice($card, 'success', 'Verification email resent! Please check your inbox.');
        }
      });
    });

    // 10. Logout Button Handler
    $(document).on('click', '.rakta-logout-btn', function(e) {
      e.preventDefault();
      supabaseClient.auth.signOut().then(function() {
        clearSessionCookie('rakta_supabase_auth_session');
        updateNavWidgets(null);
      });
    });
  });
})(jQuery);
