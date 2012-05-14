/**
 * M.pgcookie provides a global persistent redis-like key => hash abstraction
 * on top of cookies allowing multiple values to be encoded per cookie
 * persistently. It uses the trusted $.cookie underneath.
 *
 */
M.provide("pgcookie", new function () {

  // Standard boilerplate for constructors
  var that = this;

  // -------------------------------------------- LIBRARY REQUIREMENTS
  if (!jQuery) throw "Jquery.js not installed. Required for M.cookie";
  if (!$.cookie) return l("jquery cookie not installed. Required for M.cookie");

  // -------------------------------------------- CORE LIBS

  // By design available on all pages, expiring in 100 years, defaults to
  // current domain.
  var persistentGlobalOptions = { expires:36500, path:'/' };

  /**
   * exists: Checks if a cookie exists with that name
   * This function particularly relies on the namespace function.
   *
   * @param cookieName
   * @return {Boolean}
   */
  that.exists = function (cookieName) {
    cookieName = namespaced(cookieName);
    return $.cookie(cookieName) !== null;
  };

  /**
   * Deletes a whole cookie, hash and all
   * @param cookieName
   */
  that.del = function (cookieName) {
    cookieName = namespaced(cookieName);
    $.cookie(cookieName, null, persistentGlobalOptions);
  };

  /**
   * hset: Hash set. It will take a cookie, key and value for setting
   * @param cookieName
   * @param cookieKey
   * @param cookieValue
   */

  that.hset = function (cookieName, cookieKey, cookieValue) {
    cookieName = namespaced(cookieName);
    var cookieObject = M.queryParams($.cookie(cookieName));
    cookieObject[cookieKey] = cookieValue;
    $.cookie(cookieName, $.param(cookieObject), persistentGlobalOptions);
  };

  /**
   * hget: Hash get. It will take a cookie, key and value for getting
   * @param cookieName
   * @param cookieKey
   * @return {*}
   */
  that.hget = function (cookieName, cookieKey) {
    cookieName = namespaced(cookieName);
    var cookieObject = M.queryParams($.cookie(cookieName));
    return cookieObject[cookieKey];
  };

  /**
   * hset: Hash set. It will take a cookie, key and value for setting
   * @param cookieName
   * @return {*}
   */

  that.hkeys = function (cookieName) {
    cookieName = namespaced(cookieName);
    var cookieObject = M.queryParams($.cookie(cookieName));
    return M.keys(cookieObject);
  };

  /**
   * hset: Hash set. It will take a cookie, key and value for setting
   * @param cookieName
   * @param cookieKey
   * @return {Boolean}
   */
  that.hexists = function (cookieName, cookieKey) {
    cookieName = namespaced(cookieName);
    var cookieValue = that.hget(cookieName, cookieKey);
    return cookieValue !== null && cookieValue !== undefined;
  };

  // Since cookies can be shadowed if a more specific path is specified we try
  // to give all cookies a unique namespace
  function namespaced(cookieName) {
    return "pgcookie." + cookieName;
  }


}());
