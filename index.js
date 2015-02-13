var m = window ? window.m : require('mithril');
if (!m && require) m = require('mithril');

var authonice = module.exports = {
  token: m.prop(localStorage.token),

  // is the user logged in?
  loggedIn: function(){
  	return !!authonice.token();
  },
  
  // trade credentials for a token
  login: function(email, password){
    return m.request({
      method: 'POST',
      url: authonice.mountPoint + '/login',
      data: {email:email, password:password},
      unwrapSuccess: function(res) {
        localStorage.token = res.token;
        return res.token;
      }
    })
    .then(this.token);
  },
  
  // forget token
  logout: function(){
    authonice.token(false);
    delete localStorage.token;
  },

  // signup on the server for new login credentials
  register: function(email, password){
    return m.request({
      method: 'POST',
      url: authonice.mountPoint + '/register',
      data: {email:email, password:password}
    });
  },

  // ensure verify token is correct
  verify: function(token){
    return m.request({
      method: 'POST',
      url: authonice.mountPoint + '/verify',
      data: {token: token}
    });
  },

  // get current user object
  user: function(){
    return authonice.req(authonice.mountPoint + '/user');
  },

  // make an authenticated request
  req: function(options){
    if (typeof options == 'string'){
      options = {method:'GET', url:options};
    }
    var oldConfig = options.config || function(){};
    options.config = function(xhr) {
      xhr.setRequestHeader("authoniceorization", "Bearer " + authonice.token());
      oldConfig(xhr);
    };

    // try request, if auth error, redirect
    var deferred = m.deferred();
    m.request(options).then(deferred.resolve, function(err){
      if (err.status === 401){
        authonice.originalRoute = m.route();
        m.route(authonice.loginRoute);
      }
    });

    return deferred.promise;
  }
};

// configuration
authonice.mountPoint = '/auth';
authonice.loginRoute = '/login';