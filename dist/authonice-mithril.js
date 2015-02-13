!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.authonice=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"mithril":"mithril"}]},{},[1])(1)
});