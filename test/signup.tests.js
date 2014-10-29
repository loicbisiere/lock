/**
 * Mocha config
 */

mocha.timeout(60000);
mocha.ui('bdd');
mocha.reporter('html');
mocha.globals(['jQuery*', '__auth0jp*', 'Auth0*']);

/**
 * Test sign up
 */

describe('sign up', function () {

  beforeEach(function (done) {
    var self = this;
    this.options = {
      callbackURL: 'http://localhost:3000/',
      rememberLastLogin: false
    };


    if (!this.auth0) return onhidden();
    this.auth0.hide(onhidden);
    function onhidden() {
      self.auth0 = new Auth0Lock('0HP71GSd6PuoRYJ3DXKdiXCUUdGmBbup', 'mdocs.auth0.com');
      done();
    }
  });

  afterEach(function (done) {
    global.window.location.hash = '';
    global.window.Auth0 = null;
    this.auth0.hide(done)
  });

  describe('when requires_username is enabled', function() {

    beforeEach(function() {
      // Mock `_isUsernameRequired` so it asumes database has enabled
      // requires_username on it's configuration
      this.options._isUsernameRequired = function() { return true; };
    });

    it('should show username and email inputs', function (done) {
      this.auth0
      .once('signup ready', function() {
        expect($('#a0-signup_easy_email')).to.not.be.empty();
        expect($('#a0-signup_easy_username')).to.not.be.empty();
        done();
      })
      .showSignup(this.options);
    });

    it('should validate username when empty', function (done) {
      var auth0 = this.auth0;
      auth0
      .once('signup ready', function() {
        $('#a0-signup_easy_email').val('pepo@example.com');
        $('#a0-signup_easy_password').val('123');

        bean.fire($('.a0-signup form')[0], 'submit');

        expect($('.a0-username .a0-error-input')).to.not.be.empty();
        done();
      })
      .showSignup(this.options);
    });

    it('should validate username when invalid', function (done) {
      var auth0 = this.auth0;
      auth0
      .once('signup ready', function() {
        $('#a0-signup_easy_username').val('1.1.1.1');
        $('#a0-signup_easy_email').val('pepo@example.com');
        $('#a0-signup_easy_password').val('123');

        bean.fire($('.a0-signup form')[0], 'submit');

        expect($('.a0-username .a0-error-input')).to.not.be.empty();
        expect($('.a0-username .a0-error-input .a0-error-message')).to.not.be.empty();
        expect($('.a0-error-message').text()).to.equal(auth0.options.i18n.t('invalid'));
        done();
      })
      .showSignup(this.options);
    });

  });

  it('should show the loading pane', function (done) {
    var auth0 = this.auth0;

    auth0
    .once('signup ready', function () {
      $('#a0-signup_easy_email').val('pepo@example.com');
      $('#a0-signup_easy_password').val('123');
      auth0.once('loading ready', function () {
        expect($('#a0-lock h1').html()).to.be(auth0.options.i18n.t('signup:title'));
        done();
      });
      bean.fire($('.a0-signup form')[0], 'submit');
    })
    .showSignup(this.options);
  });

  it('should not change to loading when server returns error', function (done) {
    var auth0 = this.auth0;

    auth0
    .once('signup ready', function () {
      $('#a0-signup_easy_email').val('pepo@example.com');
      $('#a0-signup_easy_password').val('123');
      bean.fire($('.a0-signup form')[0], 'submit');
    })
    .once('_error', function () {
      expect($('.a0-error').html()).to.be(auth0.options.i18n.t('signup:serverErrorText'));
      done();
    })
    .showSignup(this.options);
  });


  it('should signin with social connection', function (done) {
    this.auth0.$auth0.login = function (options) {
      expect(options.connection).to.equal('google-oauth2');
      expect(options.username).to.be(undefined);
      done();
    };

    this.auth0
    .once('signup ready', function() {
      bean.fire($('.a0-signup [data-strategy="google-oauth2"]')[0], 'click');
    })
    .showSignup(this.options);
  });

});
