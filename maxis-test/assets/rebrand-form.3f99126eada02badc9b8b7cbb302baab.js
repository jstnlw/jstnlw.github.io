/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */
(function(factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        var g = window.Granite = window.Granite || {};
        g.Sling = factory();
    }
}(function() {
    "use strict";

    /**
     * A helper class providing a set of Sling-related utilities.
     * @static
     * @singleton
     * @class Granite.Sling
     */
    return {
        /**
         * The selector for infinite hierarchy depth when retrieving repository content.
         * @static
         * @final
         * @type String
         */
        SELECTOR_INFINITY: ".infinity",

        /**
         * The parameter name for the used character set.
         * @static
         * @final
         * @type String
         */
        CHARSET: "_charset_",

        /**
         * The parameter name for the status.
         * @static
         * @final
         * @type String
         */
        STATUS: ":status",

        /**
         * The parameter value for the status type "browser".
         * @static
         * @final
         * @type String
         */
        STATUS_BROWSER: "browser",

        /**
         * The parameter name for the operation.
         * @static
         * @final
         * @type String
         */
        OPERATION: ":operation",

        /**
         * The parameter value for the delete operation.
         * @static
         * @final
         * @type String
         */
        OPERATION_DELETE: "delete",

        /**
         * The parameter value for the move operation.
         * @static
         * @final
         * @type String
         */
        OPERATION_MOVE: "move",

        /**
         * The parameter name suffix for deleting.
         * @static
         * @final
         * @type String
         */
        DELETE_SUFFIX: "@Delete",

        /**
         * The parameter name suffix for setting a type hint.
         * @static
         * @final
         * @type String
         */
        TYPEHINT_SUFFIX: "@TypeHint",

        /**
         * The parameter name suffix for copying.
         * @static
         * @final
         * @type String
         */
        COPY_SUFFIX: "@CopyFrom",

        /**
         * The parameter name suffix for moving.
         * @static
         * @final
         * @type String
         */
        MOVE_SUFFIX: "@MoveFrom",

        /**
         * The parameter name for the ordering.
         * @static
         * @final
         * @type String
         */
        ORDER: ":order",

        /**
         * The parameter name for the replace flag.
         * @static
         * @final
         * @type String
         */
        REPLACE: ":replace",

        /**
         * The parameter name for the destination flag.
         * @static
         * @final
         * @type String
         */
        DESTINATION: ":dest",

        /**
         * The parameter name for the save parameter prefix.
         * @static
         * @final
         * @type String
         */
        SAVE_PARAM_PREFIX: ":saveParamPrefix",

        /**
         * The parameter name for input fields that should be ignored by Sling.
         * @static
         * @final
         * @type String
         */
        IGNORE_PARAM: ":ignore",

        /**
         * The parameter name for login requests.
         * @static
         * @final
         * @type String
         */
        REQUEST_LOGIN_PARAM: "sling:authRequestLogin",

        /**
         * The login URL.
         * @static
         * @final
         * @type String
         */
        LOGIN_URL: "/system/sling/login.html",

        /**
         * The logout URL.
         * @static
         * @final
         * @type String
         */
        LOGOUT_URL: "/system/sling/logout.html"
    };
}));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */
(function(factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        var g = window.Granite = window.Granite || {};
        g.Util = factory();
    }
}(function() {
    "use strict";

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#Polyfill
    var isArray = function(arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
    };

    /**
     * A helper class providing a set of general utilities.
     * @static
     * @singleton
     * @class Granite.Util
     */
    return {
        /**
         * Replaces occurrences of <code>{n}</code> in the specified text with the texts from the snippets.
         *
         * @example
         * var text = Granite.Util.patchText("{0} has signed in.", "Jack");
         * // text = "Jack has signed in."
         * var text2 = Granite.Util.patchText("{0} {1} has signed in from {2}.", ["Jack", "McFarland", "x.x.x.x"]);
         * // text2 = "Jack McFarland has signed in from x.x.x.x."
         *
         * @param {String} text The text.
         * @param {String|String[]} snippets The text(s) replacing <code>{n}</code>.
         * @returns {String} The patched text.
         */
        patchText: function(text, snippets) {
            if (snippets) {
                if (!isArray(snippets)) {
                    text = text.replace("{0}", snippets);
                } else {
                    for (var i = 0; i < snippets.length; i++) {
                        text = text.replace(("{" + i + "}"), snippets[i]);
                    }
                }
            }
            return text;
        },

        /**
         * Returns the top most accessible window.
         * Check {@link .setIFrameMode} to avoid security exception message on WebKit browsers
         * if this method is called in an iFrame included in a window from different domain.
         *
         * @returns {Window} The top window.
         */
        getTopWindow: function() {
            var win = window;
            if (this.iFrameTopWindow) {
                return this.iFrameTopWindow;
            }
            try {
                // try to access parent
                // win.parent.location.href throws an exception if not authorized (e.g. different location in a portlet)
                while (win.parent && win !== win.parent && win.parent.location.href) {
                    win = win.parent;
                }
            } catch (error) {
                // ignored
            }
            return win;
        },

        /**
         * Allows to define if Granite.Util is running in an iFrame and parent window is in another domain
         * (and optionally define what would be the top window in that case.
         * This is necessary to use {@link .getTopWindow} in a iFrame on WebKit based browsers because
         * {@link .getTopWindow} iterates on parent windows to find the top one which triggers a security exception
         * if one parent window is in a different domain. Exception cannot be caught but is not breaking the JS
         * execution.
         *
         * @param {Window} [topWindow=window] The iFrame top window. Must be running on the same host to avoid
         * security exception.
         */
        setIFrameMode: function(topWindow) {
            this.iFrameTopWindow = topWindow || window;
        },

        /**
         * Applies default properties if non-existent into the base object.
         * Child objects are merged recursively.
         * REMARK:
         *   - objects are recursively merged
         *   - simple type object properties are copied over the base
         *   - arrays are cloned and override the base (no value merging)
         *
         * @param {Object} base The object.
         * @param {...Object} pass The objects to be copied onto the base.
         * @returns {Object} The base object with defaults.
         */
        applyDefaults: function() {
            var override;
            var base = arguments[0] || {};

            for (var i = 1; i < arguments.length; i++) {
                override = arguments[i];

                for (var name in override) {
                    var value = override[name];

                    if (override.hasOwnProperty(name) && value !== undefined) {
                        if (value !== null && typeof value === "object" && !(value instanceof Array)) {
                            // nested object
                            base[name] = this.applyDefaults(base[name], value);
                        } else if (value instanceof Array) {
                            // override array
                            base[name] = value.slice(0);
                        } else {
                            // simple type
                            base[name] = value;
                        }
                    }
                }
            }

            return base;
        },

        /**
         * Returns the keycode from the given event.
         * It is a normalized value over variation of browsers' inconsistencies.
         *
         * @param {UIEvent} event The event.
         * @returns {Number} The keycode.
         */
        getKeyCode: function(event) {
            return event.keyCode ? event.keyCode : event.which;
        }
    };
}));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */
/* global CQURLInfo:false, G_XHR_HOOK:false */
/* eslint strict: 0 */
(function(factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory(require("@granite/util"), require("jquery"));
    } else {
        window.Granite.HTTP = factory(Granite.Util, jQuery);
    }
}(function(util, $) {
    /**
     * A helper class providing a set of HTTP-related utilities.
     * @static
     * @singleton
     * @class Granite.HTTP
     */
    return (function() {
        /**
         * The context path used on the server.
         * May only be set by {@link #detectContextPath}.
         * @type String
         */
        var contextPath = null;

        /**
         * The regular expression to detect the context path used
         * on the server using the URL of this script.
         * @readonly
         * @type RegExp
         */
        // eslint-disable-next-line max-len
        var SCRIPT_URL_REGEXP = /^(?:http|https):\/\/[^/]+(\/.*)\/(?:etc\.clientlibs|etc(\/.*)*\/clientlibs|libs(\/.*)*\/clientlibs|apps(\/.*)*\/clientlibs|etc\/designs).*\.js(\?.*)?$/;

        /**
         * The regular expression to match `#` and other non-ASCII characters in a URI.
         * @readonly
         * @type RegExp
         */
        var ENCODE_PATH_REGEXP = /[^\w-.~%:/?[\]@!$&'()*+,;=]/;

        /**
         * The regular expression to parse URI.
         * @readonly
         * @type RegExp
         * @see https://tools.ietf.org/html/rfc3986#appendix-B
         */
        var URI_REGEXP = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

        /**
         * Indicates after a session timeout if a refresh has already been triggered
         * in order to avoid multiple alerts.
         * @type String
         */
        var loginRedirected = false;

        var self = {};

        /**
         * Returns the scheme and authority (userinfo, host, port) components of the given URI;
         * or an empty string if the URI does not have the components.
         *
         * This method assumes the URI is valid.
         *
         * e.g. `scheme://userinfo@host:80/path?query#fragment` -> `scheme://userinfo@host:80`
         *
         * @param {String} uri The URI
         * @returns {String} The scheme and authority components
         */
        self.getSchemeAndAuthority = function(uri) {
            if (!uri) {
                return "";
            }

            var result = URI_REGEXP.exec(uri);

            if (result === null) {
                return "";
            }

            return [ result[1], result[3] ].join("");
        };

        /**
         * Returns the context path used on the server.
         *
         * @returns {String} The context path
         */
        self.getContextPath = function() {
            // Keep cache of calculated path.
            if (contextPath === null) {
                contextPath = self.detectContextPath();
            }
            return contextPath;
        };

        /**
         * Detects the context path used on the server.
         *
         * @returns {String} The context path
         * @private
         */
        self.detectContextPath = function() {
            try {
                if (window.CQURLInfo) {
                    contextPath = CQURLInfo.contextPath || "";
                } else {
                    var scripts = document.getElementsByTagName("script");
                    for (var i = 0; i < scripts.length; i++) {
                        var result = SCRIPT_URL_REGEXP.exec(scripts[i].src);
                        if (result) {
                            contextPath = result[1];
                            return contextPath;
                        }
                    }
                    contextPath = "";
                }
            } catch (e) {
                // ignored
            }

            return contextPath;
        };

        /**
         * Makes sure the specified relative URL starts with the context path
         * used on the server. If an absolute URL is passed, it will be returned
         * as-is.
         *
         * @param {String} url The URL
         * @returns {String} The externalized URL
         */
        self.externalize = function(url) {
            try {
                if (url.indexOf("/") === 0 && self.getContextPath() && url.indexOf(self.getContextPath() + "/") !== 0) {
                    url = self.getContextPath() + url;
                }
            } catch (e) {
                // ignored
            }
            return url;
        };

        /**
         * Removes scheme, authority and context path from the specified
         * absolute URL if it has the same scheme and authority as the
         * specified document (or the current one). If a relative URL is passed,
         * the context path will be stripped if present.
         *
         * @param {String} url The URL
         * @param {String} doc (optional) The document
         * @returns {String} The internalized URL
         */
        self.internalize = function(url, doc) {
            if (url.charAt(0) === "/") {
                if (contextPath === url) {
                    return "";
                } else if (contextPath && url.indexOf(contextPath + "/") === 0) {
                    return url.substring(contextPath.length);
                } else {
                    return url;
                }
            }

            if (!doc) {
                doc = document;
            }
            var docHost = self.getSchemeAndAuthority(doc.location.href);
            var urlHost = self.getSchemeAndAuthority(url);
            if (docHost === urlHost) {
                return url.substring(urlHost.length + (contextPath ? contextPath.length : 0));
            } else {
                return url;
            }
        };

        /**
         * Removes all parts but the path from the specified URL.
         * <p>Examples:<pre><code>
         /x/y.sel.html?param=abc => /x/y
         </code></pre>
         * <pre><code>
         http://www.day.com/foo/bar.html => /foo/bar
         </code></pre><p>
         *
         * @param {String} url The URL, may be empty. If empty <code>window.location.href</code> is taken.
         * @returns {String} The path
         */
        self.getPath = function(url) {
            if (!url) {
                if (window.CQURLInfo && CQURLInfo.requestPath) {
                    return CQURLInfo.requestPath;
                } else {
                    url = window.location.pathname;
                }
            } else {
                url = self.removeParameters(url);
                url = self.removeAnchor(url);
            }

            url = self.internalize(url);
            var i = url.indexOf(".", url.lastIndexOf("/"));
            if (i !== -1) {
                url = url.substring(0, i);
            }
            return url;
        };

        /**
         * Removes the fragment component from the given URI.
         *
         * This method assumes the URI is valid.
         *
         * e.g. `scheme://userinfo@host:80/path?query#fragment` -> `scheme://userinfo@host:80/path?query`
         *
         * @param {String} uri The URI
         * @returns {String} The URI without fragment component
         */
        self.removeAnchor = function(uri) {
            var fragmentIndex = uri.indexOf("#");
            if (fragmentIndex >= 0) {
                return uri.substring(0, fragmentIndex);
            } else {
                return uri;
            }
        };

        /**
         * Removes the query component and its subsequent fragment component from the given URI.
         * i.e. When query component exists, the subsequent fragment component is also removed.
         * However, when query component doesn't exist, fragment component is not removed.
         *
         * The assumption here is that the usages of `#` before the `?` are intended as part of the path component
         * that need to be encoded separately.
         * This assumption is made because `c.d.cq.commons.jcr.JcrUtil#isValidName` allows `#`.
         *
         * e.g. `scheme://userinfo@host:80/path#with#hash?query#fragment` -> `scheme://userinfo@host:80/path#with#hash`
         *
         * @param {String} uri The URL
         * @returns {String} The URI without the query component and its subsequent fragment component
         */
        self.removeParameters = function(uri) {
            var queryIndex = uri.indexOf("?");
            if (queryIndex >= 0) {
                return uri.substring(0, queryIndex);
            } else {
                return uri;
            }
        };

        /**
         * Encodes the path component of the given URI if it is not already encoded.
         * See {@link #encodePath} for the details of the encoding.
         *
         * e.g. `scheme://userinfo@host:80/path#with#hash?query#fragment`
         * -> `scheme://userinfo@host:80/path%23with%23hash?query#fragment`
         *
         * @param {String} uri The URI to encode
         * @returns {String} The encoded URI
         */
        self.encodePathOfURI = function(uri) {
            var DELIMS = [ "?", "#" ];

            var parts = [ uri ];
            var delim;
            for (var i = 0, ln = DELIMS.length; i < ln; i++) {
                delim = DELIMS[i];
                if (uri.indexOf(delim) >= 0) {
                    parts = uri.split(delim);
                    break;
                }
            }

            if (ENCODE_PATH_REGEXP.test(parts[0])) {
                parts[0] = self.encodePath(parts[0]);
            }

            return parts.join(delim);
        };

        /**
         * Encodes the given URI using `encodeURI`.
         *
         * This method is used to encode URI components from the scheme component up to the path component (inclusive).
         * Therefore, `?` and `#` are also encoded in addition.
         *
         * However `[` and `]` are not encoded.
         * The assumption here is that the usages of `[` and `]` are only at the host component (for IPv6),
         * not at the path component.
         * This assumption is made because `c.d.cq.commons.jcr.JcrUtil#isValidName` disallows `[` and `]`.
         *
         * Examples
         *
         * * `scheme://userinfo@host:80/path?query#fragment` -> `scheme://userinfo@host:80/path%3Fquery%23fragment`
         * * `http://[2001:db8:85a3:8d3:1319:8a2e:370:7348]/` -> `http://[2001:db8:85a3:8d3:1319:8a2e:370:7348]/`
         *
         * @param {String} uri The URI to encode
         * @returns {String} The encoded URI
         */
        self.encodePath = function(uri) {
            uri = encodeURI(uri);

            // Decode back `%5B` and `%5D`.
            // The `[` and `]` are not valid characters at the path component and need to be encoded,
            // which `encodeURI` does correctly.
            // However as mentioned in the doc, they are assumed to be used for authority component only.
            uri = uri.replace(/%5B/g, "[").replace(/%5D/g, "]");

            uri = uri.replace(/\?/g, "%3F");
            uri = uri.replace(/#/g, "%23");

            return uri;
        };

        /**
         * Handles login redirection if needed.
         */
        self.handleLoginRedirect = function() {
            if (!loginRedirected) {
                loginRedirected = true;
                alert(Granite.I18n.get("Your request could not be completed because you have been signed out."));

                var l = util.getTopWindow().document.location;
                l.href = self.externalize("/") + "?resource=" + encodeURIComponent(l.pathname + l.search + l.hash);
            }
        };

        /**
         * Gets the XHR hooked URL if called in a portlet context
         *
         * @param {String} url The URL to get
         * @param {String} method The method to use to retrieve the XHR hooked URL
         * @param {Object} params The parameters
         * @returns {String} The XHR hooked URL if available, the provided URL otherwise
         */
        self.getXhrHook = function(url, method, params) {
            method = method || "GET";
            if (window.G_XHR_HOOK && typeof G_XHR_HOOK === "function") {
                var p = {
                    "url": url,
                    "method": method
                };
                if (params) {
                    p["params"] = params;
                }
                return G_XHR_HOOK(p);
            }
            return null;
        };

        /**
         * Evaluates and returns the body of the specified response object.
         * Alternatively, a URL can be specified, in which case it will be
         * requested using a synchornous {@link #get} in order to acquire
         * the response object.
         *
         * @param {Object|String} response The response object or URL
         * @returns {Object} The evaluated response body
         * @since 5.3
         */
        self.eval = function(response) {
            if (typeof response !== "object") {
                response = $.ajax({
                    url: response,
                    type: "get",
                    async: false
                });
            }
            try {
                // support responseText for backward compatibility (pre 5.3)
                // eslint-disable-next-line no-eval
                return eval("(" + (response.body ? response.body
                    : response.responseText) + ")");
            } catch (e) {
                // ignored
            }
            return null;
        };

        return self;
    }());
}));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */
(function(factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory(require("@granite/http"));
    } else {
        window.Granite.I18n = factory(window.Granite.HTTP);
    }
}(function(HTTP) {
    "use strict";

    /**
     * A helper class providing a set of utilities related to internationalization (i18n).
     *
     * <h3>Locale Priorities</h3>
     * <p>The locale is read based on the following priorities:</p>
     * <ol>
     *   <li>manually specified locale</li>
     *   <li><code>document.documentElement.lang</code></li>
     *   <li><code>Granite.I18n.LOCALE_DEFAULT</code></li>
     * </ol>
     *
     * <h3>Dictionary Priorities</h3>
     * <p>The dictionary URL is read based on the following priorities:</p>
     * <ol>
     *   <li>manually specified URL (<code>urlPrefix</code, <code>urlSuffix</code>)</li>
     *   <li><code>data-i18n-dictionary-src</code> attribute at &lt;html&gt; element,
     *       which has the type of <a href="http://tools.ietf.org/html/rfc6570">URI Template</a> string</li>
     *   <li>The URL resolved from default <code>urlPrefix</code> and <code>urlSuffix</code></li>
     * </ol>
     *
     * <h3>URI Template of data-i18n-dictionary-src</h3>
     * <p>It expects the variable named <code>locale</code>,
     * which will be fetched from the locale (based on priorities above).
     * E.g. <code>&lt;html lang="en" data-i18n-dictionary-src="/libs/cq/i18n/dict.{+locale}.json"&gt;</code>.</p>
     *
     * @static
     * @class Granite.I18n
     */
    return (function() {
        /**
         * The map where the dictionaries are stored under their locale.
         * @type Object
         */
        var dicts = {};

        /**
         * The prefix for the URL used to request dictionaries from the server.
         * @type String
         */
        var urlPrefix = "/libs/cq/i18n/dict.";

        /**
         * The suffix for the URL used to request dictionaries from the server.
         * @type String
         */
        var urlSuffix = ".json";

        /**
         * The manually specified locale as a String or a function that returns the locale as a string.
         * @type String
         */
        var manualLocale = undefined;

        /**
         * If the current locale represents pseudo translations.
         * In that case the dictionary is expected to provide just a special
         * translation pattern to automatically convert all original strings.
         */
        var pseudoTranslations = false;

        var languages = null;

        var self = {};

        /**
         * Indicates if the dictionary parameters are specified manually.
         */
        var manualDictionary = false;

        var getDictionaryUrl = function(locale) {
            if (manualDictionary) {
                return urlPrefix + locale + urlSuffix;
            }

            var dictionarySrc;
            var htmlEl = document.querySelector("html");
            if (htmlEl) {
                dictionarySrc = htmlEl.getAttribute("data-i18n-dictionary-src");
            }

            if (!dictionarySrc) {
                return urlPrefix + locale + urlSuffix;
            }

            // dictionarySrc is a URITemplate
            // Use simple string replacement for now; for more complicated scenario, please use Granite.URITemplate
            return dictionarySrc.replace("{locale}", encodeURIComponent(locale)).replace("{+locale}", locale);
        };

        var patchText = function(text, snippets) {
            if (snippets) {
                if (Array.isArray(snippets)) {
                    for (var i = 0; i < snippets.length; i++) {
                        text = text.replace("{" + i + "}", snippets[i]);
                    }
                } else {
                    text = text.replace("{0}", snippets);
                }
            }
            return text;
        };

        /**
         * The default locale (en).
         * @readonly
         * @type String
         */
        self.LOCALE_DEFAULT = "en";

        /**
         * The language code for pseudo translations.
         * @readonly
         * @type String
         */
        self.PSEUDO_LANGUAGE = "zz";

        /**
         * The dictionary key for pseudo translation pattern.
         * @readonly
         * @type String
         */
        self.PSEUDO_PATTERN_KEY = "_pseudoPattern_";

        /**
         * Initializes I18n with the given config options:
         * <ul>
         * <li>locale: the current locale (defaults to "en")</li>
         * <li>urlPrefix: the prefix for the URL used to request dictionaries from
         * the server (defaults to "/libs/cq/i18n/dict.")</li>
         * <li>urlSuffix: the suffix for the URL used to request dictionaries from
         * the server (defaults to ".json")</li>
         * </ul>
         * Sample config. The dictioniary would be requested from
         * "/apps/i18n/dict.fr.json":
         <code><pre>{
         "locale": "fr",
         "urlPrefix": "/apps/i18n/dict.",
         "urlSuffix": ".json"
         }</pre></code>
         *
         * @param {Object} config The config
         */
        self.init = function(config) {
            config  = config || {};

            this.setLocale(config.locale);
            this.setUrlPrefix(config.urlPrefix);
            this.setUrlSuffix(config.urlSuffix);
        };

        /**
         * Sets the current locale.
         *
         * @param {String|Function} locale The locale or a function that returns the locale as a string
         */
        self.setLocale = function(locale) {
            if (!locale) {
                return;
            }
            manualLocale = locale;
        };

        /**
         * Returns the current locale based on the priorities.
         *
         * @returns {String} The locale
         */
        self.getLocale = function() {
            if (typeof manualLocale === "function") {
                // execute function first time only and store result in currentLocale
                manualLocale = manualLocale();
            }
            return manualLocale || document.documentElement.lang || self.LOCALE_DEFAULT;
        };

        /**
         * Sets the prefix for the URL used to request dictionaries from
         * the server. The locale and URL suffix will be appended.
         *
         * @param {String} prefix The URL prefix
         */
        self.setUrlPrefix = function(prefix) {
            if (!prefix) {
                return;
            }
            urlPrefix = prefix;
            manualDictionary = true;
        };

        /**
         * Sets the suffix for the URL used to request dictionaries from
         * the server. It will be appended to the URL prefix and locale.
         *
         * @param {String} suffix The URL suffix
         */
        self.setUrlSuffix = function(suffix) {
            if (!suffix) {
                return;
            }
            urlSuffix = suffix;
            manualDictionary = true;
        };

        /**
         * Returns the dictionary for the specified locale. This method
         * will request the dictionary using the URL prefix, the locale,
         * and the URL suffix. If no locale is specified, the current
         * locale is used.
         *
         * @param {String} locale (optional) The locale
         * @returns {Object} The dictionary
         */
        self.getDictionary = function(locale) {
            locale = locale || self.getLocale();

            if (!dicts[locale]) {
                pseudoTranslations = locale.indexOf(self.PSEUDO_LANGUAGE) === 0;

                try {
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", HTTP.externalize(getDictionaryUrl(locale)), false);
                    xhr.send();

                    dicts[locale] = JSON.parse(xhr.responseText);
                } catch (e) {
                    // ignored
                }
                if (!dicts[locale]) {
                    dicts[locale] = {};
                }
            }
            return dicts[locale];
        };

        /**
         * Translates the specified text into the current language.
         *
         * @param {String} text The text to translate
         * @param {String[]} snippets The snippets replacing <code>{n}</code> (optional)
         * @param {String} note A hint for translators (optional)
         * @returns {String} The translated text
         */
        self.get = function(text, snippets, note) {
            var dict;
            var newText;
            var lookupText;

            dict = self.getDictionary();

            // note that pseudoTranslations is initialized in the getDictionary() call above
            lookupText = pseudoTranslations ? self.PSEUDO_PATTERN_KEY
                : note ? text + " ((" + note + "))"
                    : text;
            if (dict) {
                newText = dict[lookupText];
            }
            if (!newText) {
                newText = text;
            }
            if (pseudoTranslations) {
                newText = newText.replace("{string}", text).replace("{comment}", note ? note : "");
            }
            return patchText(newText, snippets);
        };

        /**
         * Translates the specified text into the current language. Use this
         * method to translate String variables, e.g. data from the server.
         *
         * @param {String} text The text to translate
         * @param {String} note A hint for translators (optional)
         * @returns {String} The translated text
         */
        self.getVar = function(text, note) {
            if (!text) {
                return null;
            }
            return self.get(text, null, note);
        };

        /**
         * Returns the available languages, including a "title" property with a display name:
         * for instance "German" for "de" or "German (Switzerland)" for "de_ch".
         *
         * @returns {Object} An object with language codes as keys and an object with "title",
         *                  "language", "country" and "defaultCountry" members.
         */
        self.getLanguages = function() {
            if (!languages) {
                try {
                    // use overlay servlet so customers can define /apps/wcm/core/resources/languages
                    // TODO: broken!!!
                    var url = HTTP.externalize("/libs/wcm/core/resources/languages.overlay.infinity.json");
                    var xhr = new XMLHttpRequest();
                    xhr.open("GET", url, false);
                    xhr.send();

                    var json = JSON.parse(xhr.responseText);

                    Object.keys(json).forEach(function(prop) {
                        var lang = json[prop];
                        if (lang.language) {
                            lang.title = self.getVar(lang.language);
                        }
                        if (lang.title && lang.country && lang.country !== "*") {
                            lang.title += " (" + self.getVar(lang.country) + ")";
                        }
                    });
                    languages = json;
                } catch (e) {
                    languages = {};
                }
            }
            return languages;
        };

        /**
         * Parses a language code string such as "de_CH" and returns an object with
         * language and country extracted. The delimiter can be "_" or "-".
         *
         * @param {String} langCode a language code such as "de" or "de_CH" or "de-ch"
         * @returns {Object} an object with "code" ("de_CH"), "language" ("de") and "country" ("CH")
         *                  (or null if langCode was null)
         */
        self.parseLocale = function(langCode) {
            if (!langCode) {
                return null;
            }
            var pos = langCode.indexOf("_");
            if (pos < 0) {
                pos = langCode.indexOf("-");
            }

            var language;
            var country;
            if (pos < 0) {
                language = langCode;
                country = null;
            } else {
                language = langCode.substring(0, pos);
                country = langCode.substring(pos + 1);
            }
            return {
                code: langCode,
                language: language,
                country: country
            };
        };

        return self;
    }());
}));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */
(function(factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory(require("jquery"));
    } else {
        var g = window.Granite = window.Granite || {};
        g.TouchIndicator = factory(window.jQuery);
    }
}(function($) {
    "use strict";

    var CSS = {
        "visibility": "hidden",
        // fixed would be better, but flickers on ipad while scrolling
        "position": "absolute",
        "width": "30px",
        "height": "30px",
        "-webkit-border-radius": "20px",
        "border-radius": "20px",
        "border": "5px solid orange",
        "-webkit-user-select": "none",
        "user-select": "none",
        "opacity": "0.5",
        "z-index": "2000",
        "pointer-events": "none"
    };

    var used = {};

    var unused = [];

    /**
     * Implements the "Adobe Dynamic Touch Indicator" that tracks touch events and displays a visual indicator for
     * screen sharing and presentation purposes.
     *
     * To enable it, call <code>Granite.TouchIndicator.init()</code> e.g. on document ready:
     * <pre><code>
     * Granite.$(document).ready(function() {
     *     Granite.TouchIndicator.init();
     * });
     * </code></pre>
     *
     * AdobePatentID="2631US01"
     */
    return {
        debugWithMouse: false,

        init: function() {
            var self = this;
            var NS = ".touchindicator";

            $(document).on("touchstart" + NS + "touchmove" + NS + "touchend" + NS, function(e) {
                var touches = e.originalEvent.touches;
                self.update(touches);
                return true;
            });

            if (this.debugWithMouse) {
                $(document).on("mousemove" + NS, function(e) {
                    e.identifer = "fake";
                    self.update([ e ]);
                    return true;
                });
            }
        },

        update: function(touches) {
            // go over all touch events present in the array
            var retained = {};
            for (var i = 0; i < touches.length; i++) {
                var touch = touches[i];
                var id = touch.identifier;

                // check if we already have a indicator with the correct id
                var indicator = used[id];
                if (!indicator) {
                    // if not, check if we have an unused one
                    indicator = unused.pop();

                    // if not, create a new one and append it to the dom
                    if (!indicator) {
                        indicator = $(document.createElement("div")).css(CSS);
                        $("body").append(indicator);
                    }
                }

                retained[id] = indicator;
                indicator.offset({
                    left: touch.pageX - 20,
                    top: touch.pageY - 20
                });
                indicator.css("visibility", "visible");
            }

            // now hide all unused ones and stuff them in the unused array
            for (id in used) {
                if (used.hasOwnProperty(id) && !retained[id]) {
                    indicator = used[id];
                    indicator.css("visibility", "hidden");
                    unused.push(indicator);
                }
            }
            used = retained;
        }
    };
}));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */
(function(factory) {
    "use strict";

    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        var g = window.Granite = window.Granite || {};
        g.OptOutUtil = factory();
    }
}(function($) {
    "use strict";

    function trim(s) {
        if (String.prototype.trim) {
            return s.trim();
        }
        return s.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    }

    /**
     * A library to determine whether any opt-out cookie is set and whether a given cookie name is white-listed.
     *
     * The opt-out and white-list cookie names are determined by a server-side configuration
     * (<code>com.adobe.granite.security.commons.OptOutService</code>) and provided to this tool by an optionally
     * included component (<code>/libs/granite/security/components/optout</code>) which provides a global JSON object
     * named <code>GraniteOptOutConfig</code>.
     *
     * @static
     * @class Granite.OptOutUtil
     */
    return (function() {

        var self = {};

        /**
         * The names of cookies the presence of which indicates the user has opted out.
         * @type String[]
         */
        var optOutCookieNames = [];

        /**
         * The names of cookies which may still be set in spite of the user having opted out.
         * @type String[]
         */
        var whitelistedCookieNames = [];

        /**
         * Initializes this tool with an opt-out configuration.
         *
         * The following options are supported:
         * <ul>
         *     <li>cookieNames: an array of cookie names representing opt-out cookies. Defaults to empty.</li>
         *     <li>whitelistCookieNames: an array of cookies representing white-listed cookies. Defaults to empty.</li>
         * </ul>
         *
         * @param {Object} config The opt-out configuration.
         *
         * @example
         * {
         *     "cookieNames": ["omniture_optout","cq-opt-out"],
         *     "whitelistCookieNames": ["someAppCookie", "anotherImportantAppCookie"]
         * }
         */
        self.init = function(config) {
            if (config) {
                optOutCookieNames = config.cookieNames || [];
                whitelistedCookieNames = config.whitelistCookieNames || [];
            } else {
                optOutCookieNames = [];
                whitelistedCookieNames = [];
            }
        };

        /**
         * Returns the array of configured cookie names representing opt-out cookies.
         *
         * @returns {String[]} The cookie names.
         */
        self.getCookieNames = function() {
            return optOutCookieNames;
        };

        /**
         * Returns the array of configured cookie names representing white-listed cookies.
         *
         * @returns {String[]} The cookie names.
         */
        self.getWhitelistCookieNames = function() {
            return whitelistedCookieNames;
        };

        /**
         * Determines whether the user (browser) has elected to opt-out.
         * This is indicated by the presence of one of the cookies retrieved through {@link #getCookieNames()}.
         *
         * @returns {Boolean} <code>true</code> if an opt-cookie was found in the browser's cookies;
         *     <code>false</code> otherwise.
         */
        self.isOptedOut = function() {
            var browserCookies = document.cookie.split(";");
            for (var i = 0; i < browserCookies.length; i++) {
                var cookie = browserCookies[i];
                var cookieName = trim(cookie.split("=")[0]);
                if (self.getCookieNames().indexOf(cookieName) >= 0) {
                    return true;
                }
            }
            return false;
        };

        /**
         * Determines whether the given <code>cookieName</code> may be used to set a cookie.
         * This is the case if either opt-out is inactive (<code>{@link #isOptedOut()} === false</code>) or it is
         * active and the give cookie name was found in the white-list ({@link #getWhitelistCookieNames()}).
         *
         * @param {String} cookieName The name of the cookie to check.
         * @returns {Boolean} <code>true</code> if a cookie of this name may be used with respect to the opt-out status;
         *     <code>false</code> otherwise.
         */
        self.maySetCookie = function(cookieName) {
            return !(self.isOptedOut() && self.getWhitelistCookieNames().indexOf(cookieName) === -1);
        };

        return self;
    }());
}));

/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2012 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 *
 */


//------------------------------------------------------------------------------
// Initialize the Granite utils library

Granite.OptOutUtil.init(window.GraniteOptOutConfig);
Granite.HTTP.detectContextPath();

!function(e){function t(t){for(var a,o,s=t[0],l=t[1],c=t[2],u=0,p=[];u<s.length;u++)o=s[u],Object.prototype.hasOwnProperty.call(r,o)&&r[o]&&p.push(r[o][0]),r[o]=0;for(a in l)Object.prototype.hasOwnProperty.call(l,a)&&(e[a]=l[a]);for(d&&d(t);p.length;)p.shift()();return i.push.apply(i,c||[]),n()}function n(){for(var e,t=0;t<i.length;t++){for(var n=i[t],a=!0,s=1;s<n.length;s++){var l=n[s];0!==r[l]&&(a=!1)}a&&(i.splice(t--,1),e=o(o.s=n[0]))}return e}var a={},r={39:0},i=[];function o(t){if(a[t])return a[t].exports;var n=a[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,o),n.l=!0,n.exports}o.m=e,o.c=a,o.d=function(e,t,n){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)o.d(n,a,function(t){return e[t]}.bind(null,a));return n},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="";var s=window.webpackJsonp=window.webpackJsonp||[],l=s.push.bind(s);s.push=t,s=s.slice();for(var c=0;c<s.length;c++)t(s[c]);var d=l;i.push([398,0]),n()}({1:function(e,t,n){"use strict";n.d(t,"f",(function(){return i})),n.d(t,"n",(function(){return o})),n.d(t,"B",(function(){return s})),n.d(t,"v",(function(){return l})),n.d(t,"c",(function(){return c})),n.d(t,"u",(function(){return d})),n.d(t,"l",(function(){return u})),n.d(t,"j",(function(){return p})),n.d(t,"e",(function(){return f})),n.d(t,"q",(function(){return m})),n.d(t,"m",(function(){return h})),n.d(t,"i",(function(){return g})),n.d(t,"p",(function(){return v})),n.d(t,"y",(function(){return b})),n.d(t,"x",(function(){return y})),n.d(t,"h",(function(){return w})),n.d(t,"g",(function(){return x})),n.d(t,"o",(function(){return k})),n.d(t,"r",(function(){return E})),n.d(t,"b",(function(){return $})),n.d(t,"a",(function(){return A})),n.d(t,"w",(function(){return S})),n.d(t,"C",(function(){return C})),n.d(t,"z",(function(){return q})),n.d(t,"d",(function(){return T})),n.d(t,"s",(function(){return L})),n.d(t,"A",(function(){return O})),n.d(t,"t",(function(){return N})),n.d(t,"D",(function(){return _})),n.d(t,"k",(function(){return M}));var a=n(2),r=n.n(a);const i=(e,t)=>{document.querySelector("body").dispatchEvent(new CustomEvent(""+e,{detail:t}))},o=(e,t)=>{document.querySelector("body").addEventListener(""+e,e=>{e.detail&&t&&t(e.detail)})},s=e=>"undefined"!=typeof Granite&&Granite.I18n.get(e)||e,l=e=>(""+e).toLowerCase().replace(/[^\w ]+/g,"").replace(/ +/g,"-"),c=()=>{let e=(new Date).getTime();return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,t=>{let n=(e+16*Math.random())%16|0;return e=Math.floor(e/16),("x"==t?n:3&n|8).toString(16)})},d=({name:e,value:t,duration:n,domain:a})=>{let r,i="",o=a?"; domain="+a:"",s=t&&"object"==typeof t?JSON.stringify(t):t||"",l=encodeURIComponent(s);if(n){r={days:n.day||n.days||0,hours:n.hours||n.hour||0,minutes:n.minutes||n.minute||0,seconds:n.seconds||n.second||0};let e=new Date;e.setTime(e.getTime()+24*r.days*60*60*1e3+60*r.hours*60*1e3+60*r.minutes*1e3+1e3*r.seconds),e=e.toUTCString(),i="; expires="+e}document.cookie=`${e}=${l}; Path=/${i}${o}`;const c=new CustomEvent("cookie_added",{detail:{name:e,value:t,duration:r,domain:a}});document.dispatchEvent(c)},u=e=>{let t="",n={year:e.substring(0,4),month:e.substring(4,6),day:e.substring(6,8),hour:e.substring(8,10)||"00",minutes:e.substring(10,12)||"00",seconds:e.substring(12,14)||"00"},a=new Date(n.year,parseInt(n.month-1),n.day,n.hour,n.minutes,n.seconds),r=a.toLocaleString("en-GB",{year:"numeric",month:"long",day:"numeric"}).split(/[\s:]+/),i={year:r[2],month:r[1],day:r[0],hour:a.getHours()%12==0?12:a.getHours()%12,minute:a.getMinutes()<10?"0"+a.getMinutes():a.getMinutes(),ampm:a.getHours()>=12?"PM":"AM"};return t=`<span class="date"><span class="year">${i.year}<span class="comma">, </span></span><span class="month">${s(i.month)}</span> <span class="day">${i.day}<span class="comma">, </span></span></span><span class="time"><span class="hour">${i.hour}</span>:<span class="minute">${i.minute}</span><span class="ampm">${i.ampm}</span></span>`,t},p=e=>{let t=document.cookie.match(new RegExp("(?:^|; )"+e.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g,"\\$1")+"=([^;]*)"));return t?decodeURIComponent(t[1]):void 0},f=(e,t="")=>{document.cookie=`${e}=; ${""!==t?"domain="+t+";":""} expires=Thu, 01 Jan 1970 00:00:00 GMT`},m=()=>{let e=!1;return"undefined"!=typeof Granite&&(e=!!Granite.author),!e},h=e=>void 0!==e&&void 0!==e&&null!==typeof e&&null!==e&&(0===Object.keys(e).length&&e.constructor===Object),g=async e=>{let t="";t=e||("localhost"==window.location.hostname?"/data/csrf.json":"/bin/api/csrfToken");try{return(await fetch(t,{method:"GET",headers:{"Content-Type":"application/json"}}).then(e=>e.json())).csrf}catch(e){}},v=(e,t)=>{const n=[{cardType:".cmp-hotlink-plans-card",matchElements:[".card-wrapper",".headline",".cmp-plan-card-icon"]},{cardType:".cmp-plan-card",matchElements:[".card-wrapper",".title-small",".title-big",".title-info",".features",".benefits",".prices",".cmp-plan-card-icon"]},{cardType:".cmp-bundle-card",matchElements:[".card-wrapper",".title-prefix",".title",".cover",".content",".prices",".deals"]},{cardType:".cmp-plan-card-with-device",matchElements:[".card-wrapper",".device-specs",".plan-info",".price-container"]},{cardType:".cmp-pack-card",matchElements:[".show-button",".packages > grid :not(.grid)"]}];e&&(t&&t.fn.matchHeight||window.$&&window.$.fn.matchHeight)&&n.forEach(n=>{null!==e.querySelectorAll(n.cardType)&&n.matchElements.forEach(n=>{const a=e.querySelectorAll(n);null!==a&&t(a).matchHeight({property:"min-height"})})})},b=({key:e,selector:t,className:n})=>{const a=e||"string-interpolate",i=t||".rebrand",o=n||"string-replace";let s=document.querySelectorAll(""+i),l=[],c=new RegExp(`(\\[\\s*${a}\\-\\w*\\s*])`,"g");s.forEach(e=>{let t,n=document.createNodeIterator(e,NodeFilter.SHOW_ELEMENT,e=>e.textContent.match(c)&&"script"!==e.nodeName.toLowerCase()&&0===e.children.length?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT);for(;t=n.nextNode();)l.push(t);l.forEach(e=>{let t=new RegExp(`(?:\\[\\s*${a}\\-)(\\w*)(?:\\s*\\])`,"g");[...r()(e.innerHTML,t)].forEach(t=>{let n=new RegExp(`(\\[\\s*${a}\\-${t[1]}\\s*\\])`,"g");e.innerHTML=e.innerHTML.replace(n,`<span class="${o}" data-string-interpolate-key="${a}" data-string-interpolate-value="${t[1]}"></span>`)})})})},y=(e,t,n)=>{document.querySelectorAll(`[data-string-interpolate-key="${e}"][data-string-interpolate-value="${t}"]`).forEach(e=>{e&&(e.innerHTML=n)})},w=(e,t)=>{if(void 0!==t&&""!==t&&null!==t){const n=t.split(".");if(n&&n.length>0){return n.reduce((e,t,n)=>{if(null!==e){if(0===n)return e;{const n=/(\w+)\[(\d+)\]/g.exec(t);return null!==n?e[n[1]]&&e[n[1]][n[2]]?e[n[1]][n[2]]:null:e[t]?e[t]:null}}return null},e)}}return null},x=(e,t)=>{if(void 0!==t&&""!==t&&null!==t){const n=t.split(".");if(n&&n.length>0){return n.reduce((e,t,n)=>{if(null!==e){const n=/(\w+)\[(\d+)\]/g.exec(t);return null!==n?e[n[1]]&&e[n[1]][n[2]]?e[n[1]][n[2]]:null:e[t]?e[t]:null}return null},e)}}return null},k=()=>{let e;try{e=window.localStorage;var t="__storage_test__";return e.setItem(t,t),e.removeItem(t),!0}catch(t){return t instanceof DOMException&&(22===t.code||1014===t.code||"QuotaExceededError"===t.name||"NS_ERROR_DOM_QUOTA_REACHED"===t.name)&&e&&0!==e.length}},E=e=>"object"!=typeof e?e:Array.isArray(e)?e.map(E):Object.keys(e).reduce((function(t,n){let a=e[n],r="object"==typeof a?E(a):a;return t[n.toUpperCase()]=r,t}),{}),$=(e,t)=>{const n="contains"in e?"contains":"compareDocumentPosition",a="contains"===n?1:16;for(;e;){if((e[n](t)&a)===a)return e;if(!e.parentNode)break;e=e.parentNode}return null},A=(e,t)=>{let n={sm:{},md:{},lg:{}};const a=getComputedStyle(document.body),r=(e,t)=>String(e.getPropertyValue(""+t)).toLowerCase().trim();switch(r(a,"--var-only-sm")){case 1:case"1":n.sm.only=!0;break;default:n.sm.only=!1}switch(r(a,"--var-up-sm")){case 1:case"1":n.sm.up=!0;break;default:n.sm.up=!1}switch(r(a,"--var-down-sm")){case 1:case"1":n.sm.down=!0;break;default:n.sm.down=!1}switch(r(a,"--var-only-md")){case 1:case"1":n.md.only=!0;break;default:n.md.only=!1}switch(r(a,"--var-up-md")){case 1:case"1":n.md.up=!0;break;default:n.md.up=!1}switch(r(a,"--var-down-md")){case 1:case"1":n.md.down=!0;break;default:n.md.down=!1}switch(r(a,"--var-only-lg")){case 1:case"1":n.lg.only=!0;break;default:n.lg.only=!1}switch(r(a,"--var-up-lg")){case 1:case"1":n.lg.up=!0;break;default:n.lg.up=!1}switch(r(a,"--var-down-lg")){case 1:case"1":n.lg.down=!0;break;default:n.lg.down=!1}if(e){let a="sm";switch(e.toLowerCase()){case"lg":case"desktop":a="lg";break;case"md":case"tablet":a="md";break;default:a="sm"}if(t)switch(t){case"up":return n[""+a].up;case"down":return n[""+a].down;default:return n[""+a].only}return n[""+a]}return n},S=(e,t,n,a)=>{let r=!1;switch(n){case"lowerTo":case"lower":case"lowerThan":case"<":r=e<t;break;case"lowerEqualTo":case"lowerEqual":case"lowerEqualThan":case"<=":r=e<=t;break;case"greaterTo":case"greater":case"greaterThan":case">":r=e>t;break;case"greaterEqualTo":case"greaterEqual":case"greaterEqualThan":case">=":r=e>=t;break;default:r=String(e)===String(t)}return a&&a(r),r},C=(e,t="",n)=>{const a=(e,t)=>{switch(String(e.tagName).toLowerCase().trim()){case"input":case"textarea":e.value=t;break;case"radio":String(e.value)===String(t)?e.checked:"true"===String(t).toLowerCase().trim()?e.checked=!0:(String(t).toLowerCase().trim(),e.checked=!1);break;case"select":case"select2":e.value=String(t);const n=e.querySelectorAll("option");(Array.from(n).findIndex(e=>e.value===String(t))<=-1||""===String(t))&&(e.selectedIndex=-1),i("select_picker_refresh",{selector:".selectpicker"});break;default:e.innerHTML=t}};if(e)if(!0===NodeList.prototype.isPrototypeOf(e)||!0===HTMLCollection.prototype.isPrototypeOf(e))null!==e&&e.forEach(e=>{a(e,t)});else if(Element.prototype.isPrototypeOf(e))a(e,t);else if("string"==typeof e){const n=document.querySelectorAll(e);null!==n&&n.length>0&&n.forEach(e=>{a(e,t)})}n&&n()},q=(e,t="span",n)=>{const a=/^(\d+):(\d+)$/.exec(e);if(null!==a&&a.length>=3){const e=a[1],r=parseInt(e),i=a[2].replace(/^(\S){1}$/,"$10");let o=r,s="am";return r>=12&&(s="pm",12!==r&&(o=r-12)),0===r&&(o=12),`<${t} class="hour ${n}">${o}</${t}><${t} class="timeSeperator ${n}">:</${t}><${t} class="minute ${n}">${i}</${t}><${t} class="ampm ${n}">${s}</${t}>`}};function T(e){const t={...e};let n=null,a=null;const r=c(),i=t.classPrefix||"maxis",o=t.spinner||"/content/dam/mxs/rebrand/loader.gif",s=()=>{null!=a&&(document.querySelector("body").classList.add("modal-open"),a.classList.remove("d-none"))};this.open=()=>{s()};const l=()=>{null!=a&&(Array.prototype.slice.call(document.querySelectorAll(".modal")).some(e=>e.classList.contains("open"))||document.querySelector("body").classList.remove("modal-open"),a.classList.add("d-none"))};this.close=()=>{l()};this.toggle=()=>{a.classList.contains("d-none")?s():l()};this.setSpinner=e=>{(e=>{const t=document.getElementById(""+r);if(t){t.querySelector("img").setAttribute("src",e)}})(e)},function(){const e=document.createElement("div");e.classList.add("rebrand",i+"-loader-wrapper"),e.innerHTML=`<div id="${r}" class="${i}-loader global d-none"><img src="${o}"/></div>`,document.querySelector("body").appendChild(e),(({setLoader:e,setLoaderWrapper:t})=>{e&&(a=e),t&&(n=t)})({setLoader:e.querySelector(`.${i}-loader`),setLoaderWrapper:e})}()}const L=(e="",t=null,n)=>{if(""!==e){const a=document.querySelectorAll(e),r=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver;t=null!==t?t:document.querySelector("body");for(let e of a)n&&n(e);new r(t=>{t.forEach(t=>{const a=[].slice.call(t.addedNodes);a.length>0&&a.forEach(t=>{t.querySelectorAll&&[].slice.call(t.querySelectorAll(e)).forEach(e=>{n&&n(e)})})})}).observe(t,{subtree:!0,characterData:!0})}},O=e=>e.replace(/\w\S*/g,e=>e.charAt(0).toUpperCase()+e.substr(1).toLowerCase()),N=(e=1)=>{let t="Desistemus doloremque multam nostrud notae perspexit tribus voluit Consilio disciplinam distinguantur essent facillime inflammati magnam morbis mucius multitudinem octavio sin tranquillae videor voluit Argumentandum calere comparat debemus ero honesta nati oritur profecta sanos transferrem Aeterno appetendum dico docet faciendumve fit gratissimo graviter lectus potiendi universas Ceteris collegi curis detractis eius evolutio faucibus fidem formidinum incorrupte officia studiose temeritate temporibus Agam dissentias negarent vexetur Arbitrantur bonis habeatur iucundo nominati pacto ponti quorum vis Amici confirmatur defatigatio ignorant monstruosi motum splendide utramque Cernantur cognitioque comit duxit exquirere facete grata intellegat ipsas laborat ob praesidium requirere significet ultricies Dicenda insequitur migrare reperiuntur seditiones voluptas Deduceret depravare mollis oportere patiatur pulchraeque Comprobavit cura dices expedita factis fastidium geometrica innumerabiles putem sane scilicet splendide Angusti assueverit concederetur deorum platonem putem repugnantibus timeret torquatis Cognitionis cumque scribentur sublatum Defuit dico eirmod excepturi iisque inportuno instructus referta reiciat venandi vetuit Ars convincere defuturum expeteremus infinitis philosophia plato posteri praesens praesentibus praeteritas satis verear Ac accurate armatum democriti enim eosdem fabellas fecisse industria inportuno privamur puto veriusque Caecilii cruciantur inane malorum pacto pri quapropter recusabo vocant Asperner gravioribus perfruique possent temporis vacillare Arte conficiuntque deterret dignissim displicet distrahi ei inflammat iriure nulli opinemur simplicem tibique velint At dicebas erimus phaedrum unam Consuetudine disputandum disputata expleantur iactare incurrunt ita negat parta pueri queo vicinum Ars cura ortum philosophiae stultus Aeternum offendimur oriantur videtis Admodum adversantur antiquis audeam comparare iriure magis tranquillitatem Anim doloris forte inopem is iusteque legantur maestitiam metuamus officia paranda quaeritur reddidisti segnitiae situm Firmissimum magnosque moveat nonne profectus tam tractatos Eae finitum ignavia inclusae lacus leniter leo philosophorum proin repudiare Adipisci confidam exaudita reprehensione Desideraturam menandri tuum ultima Assueverit chrysippe consumere discordiae habeat miseram monet option purus suspicor veniat Aequum beatae comparat consumeret eumque ferae istam patrioque remotis Afficit dolemus expetendum intellegere lictores praetermissum Chorusque delectat desiderabile evolvendis exedunt invenire legendus memoriter physico varias Accumsan afflueret arbitror doceat i iudicant mattis morte ne platea porrecta summam Consetetur de deterruisset dubitat fuga manum natura Exultat hosti inliberali loquuntur pariendarum synephebos Afranius albuci comparat facere fermentum homines iudex iudicante latinas pueriliter texit voluptua Declarant integre partes pater seditione turbulenta Alterum assiduitas donec geometria maius mollitia penatibus porta voluptatem Admonitionem disserunt individua morbis mortem octavio ornare ornatum situm Apertam appellat assiduitas cui fuissent nostrum regula sicine studia Contineret errorem inflammati nollem peccandi posuere refert sua tenebo timeam Admodum cives dis mollit quippe sentio Afferrent aperiri campum fugiendus metu morbis solitudo Degendae diligenter indignae iuberet liber ornare scribentur Architecto consequi erunt fames intervenire laetetur regione tempora tempore Comparaverit curis intellegere lacus omnes parendum progrediens quaerenda summam tenebimus tractatos Acute alienus beatus brevi conficiuntque cupiditatibus elegans epularum evolutio monstret mundus possum sensuum sententia studiose Dein desistunt ignota pecuniae pondere quaerendi tot verborum vituperata".split(" ");e=e>t.length?t.length:e;let n=[];const a=()=>{const e=Math.floor(Math.random()*t.length);n.push(t[e]),t.splice(e,1)};for(let t=0;t<e;t++)a();return n},_=(e,t)=>{const n=(e,t)=>{e.every(e=>((e,t)=>{for(let n=0;n<t.length;n++){if(!e||!e.hasOwnProperty(t[n]))return!1;e=e[t[n]]}return!0})(window,e.split(".")))?t():setTimeout(()=>{n(e,t)},100)};n(e,t)},M=(e,t="")=>{let n="",a="";e.length>=t?(n=e.split(""),a=t.split("")):(n=t.split(""),a=e.split(""));let r=0;return n.some((e,t)=>{if(n[t]!==a[t])return r=t,!0}),r}},10:function(e,t){},398:function(e,t,n){"use strict";n.r(t);var a=n(0),r=n.n(a),i=(n(16),n(1)),o=(n(9),n(7)),s=n.n(o),l=n(2),c=n.n(l);!function(){var e=document.querySelectorAll("form");Array.prototype.slice.call(e).forEach((function(e){e.addEventListener("submit",(function(t){e.checkValidity()||(t.preventDefault(),t.stopPropagation()),e.classList.add("was-validated")}),!1)}));let t='[data-cmp-is="form"]';function n(e){var t=e||r()("select");t.length&&r.a.each(t,(function(e,t){var n=r()(t).data("sort");if(n&&"none"!=n){var a=r()(t).find("option"),o=a.map((function(e,t){return{t:r()(t).text(),v:t.value}})).get();o.sort((function(e,t){return"asc"==n?""==e.v?-1:""==t.v||e.t>t.t?1:e.t<t.t?-1:0:""==e.v?-1:""==t.v?1:e.t>t.t?-1:e.t<t.t?1:0})),a.each((function(e,t){t.value=o[e].v,r()(t).text(o[e].t)})),Object(i.f)("select_picker_refresh",{selector:".selectpicker"})}}))}const a=(e,t,a)=>{var r=a;0==a&&(r="");var o=window.apptStoreServiceURL+"?state="+t+"&town="+r+"&storePath="+window.storePath;s()({method:"get",url:o}).then((function(t){((e,t)=>{let a=e.find("[data-attr-value='store-list']");a.attr("data-none-selected-text",Granite.I18n.get("Nothing selected")),t.length>0&&(a.html(""),a.append('<option value="">'+Granite.I18n.get("Select store")+"</option>"),t.forEach(e=>{a.append('<option value="'+e.storeName+'">'+e.storeName+"</option>")}),n(a),a.removeAttr("disabled"),a.on("change",(function(t){e.find(".dropdown-select").removeClass("invalid")})),Object(i.f)("select_picker_refresh",{selector:".selectpicker"}))})(e,t.data)})).catch((function(e){}))},o=(e,t)=>{let o=e.find("[data-attr-value='town-list']"),s=e.find("[data-attr-value='state-list']");o.attr("data-none-selected-text",Granite.I18n.get("Nothing selected")),t.length>0&&(o.html(""),o.append('<option value="">'+Granite.I18n.get("Select town")+"</option>"),o.append('<option value="0">'+Granite.I18n.get("All towns")+"</option>"),t[0].town.forEach(e=>{o.append('<option value="'+e.value+'">'+e.title+"</option>")}),n(o),o.removeAttr("disabled"),o.on("change",(function(t){e.find(".dropdown-select").removeClass("invalid"),r()(this).find("option[value='']").attr("disabled",!0),a(e,s.val(),o.val())})),Object(i.f)("select_picker_refresh",{selector:".selectpicker"}))},l=(e,t)=>{let a=e.find("[data-attr-value='state-list']"),s=e.find("[data-attr-value='store-list']");a.attr("data-none-selected-text",Granite.I18n.get("Nothing selected")),t.length>0&&(a.html(""),a.append('<option value="">'+Granite.I18n.get("Select state")+"</option>"),t.forEach(e=>{a.append('<option value="'+e.value+'">'+e.title+"</option>")}),n(a),a.removeAttr("disabled"),a.on("change",(function(n){e.find(".dropdown-select").removeClass("invalid");var a=r()(this);a.find("option[value='']").attr("disabled",!0);var i=t.filter(e=>e.value==a.val());o(e,i),s.prop("disabled",!0),s.html("")})),Object(i.f)("select_picker_refresh",{selector:".selectpicker"}))},d=e=>{const t=r()(e);(e=>{const t=(t,n=!1)=>{const a=n?t:r()(t.target);let o,s,l,c,d,u,p;a.is("input")?a.hasClass("color-selection")?(o=a.closest("label").siblings("input"),s=a):(o=a,s=a.siblings("label").find(".color-selection:checked"),s.length||(s=a.siblings("label").find(".color-selection"))):a.is(".nav-link")||(o=a.closest("label").prev(),s=a.closest("label").find(".color-selection")),void 0!==o&&o.length?(l=o.attr("name"),c=o.val(),s.length&&(d=s.attr("name"),s.is(":checked")||s.first().prop("checked",!0),u=s.val()),p=o.next("label").find('[class^="cmp-"]').hasClass("checked")):(o=a.closest("label"),l=o.attr("for"),c=o.attr("value"),p=o.hasClass("active"));const f=e.find(`.form-details .selectpicker[name="${l}"]`);let m=e.find(`.form-details .selectpicker[name="${d}"]`);if(void 0!==f&&f.length&&(n&&(p=n),f.val(p?c:""),Object(i.f)("select_picker_refresh",{selector:".selectpicker"}),s.length)){m.find("option").hide();o.siblings("label").find("input").each((e,t)=>{m.find(`option[value="${t.value}"]`).show()}),m.val(p?u:""),Object(i.f)("select_picker_refresh",{selector:".selectpicker"})}let h=e.find(`.form-details input[name="${l}"][type="radio"], .form-details input[name="${l}"][type="checkbox"]`);void 0!==h&&h.length&&h.length>1&&h.each((e,t)=>{r()(t).val()==c&&r()(t).prop("checked",!!p)})};e.on("click",".cmp-tab-selection .btn-primary, .cmp-card-container .btn-primary",t),e.on("change",".cmp-card-container input",t)})(t),(e=>{const t=e.find('.form-details input[type="radio"], .form-details input[type="checkbox"]'),n=t=>{let n,a;r()(t.target).is("input")?n=r()(t.target):"click"!==t.type&&r()(t).is("input")?n=r()(t):(inputName=r()(t.target).closest("label").attr("for"),a=r()(t.target).closest("label").attr("value"),n=e.find(`.form-details [name="${inputName}"]`)),n.length&&n.each((e,t)=>{if(r()(t).val()==a&&r()(t).prop("checked",!0).change(),r()(t).is(":checked")){const e=r()(t).closest(".rdo-group-cont, .chk-group-cont").find(".sub-option"),n=r()(t).parent().find(".sub-option");if(n.length){e.removeClass("show"),r.a.each(e,(e,t)=>{r()(t).data("persist")||(r()(t).find("input").attr("disabled","true"),r()(t).find("select").attr("disabled","true"))}),e.find(".invalid-feedback").hide(),r.a.each(n,(e,t)=>{r()(t).siblings('input[type="radio"]').is(":checked")&&(r()(t).addClass("show"),r()(t).find("input").removeAttr("disabled"),r()(t).find("select").removeAttr("disabled"),r()(t).find(".dropdown.bootstrap-select").removeClass("disabled"),r()(t).find(".btn.dropdown-toggle").removeClass("disabled"),r()(t).find(".btn.dropdown-toggle").removeAttr("aria-disabled"))});const t=n.find("input, select").attr("name");e.each((e,a)=>{r()(a).find(`[name="${t}"]`).length||(r()(a).not(n).find('input[type="radio"], input[type="checkbox"]').prop("checked",!1).change(),r()(a).not(n).find("input").val("").change(),r()(a).not(n).find("select").val("").change(),Object(i.f)("select_picker_refresh",{selector:".selectpicker"}))})}else e.removeClass("show"),e.find('input[type="radio"], input[type="checkbox"]').prop("checked",!1).change(),e.find("input").val("").change(),e.find("select").val("").change(),Object(i.f)("select_picker_refresh",{selector:".selectpicker"})}})};t.each((e,t)=>{r()(t).is(":checked")&&n(t)}),e.on("change",'input[type="radio"], input[type="checkbox"]',n),e.on("click",".cmp-tab-selection .nav-tabs .btn-primary",n)})(t),t.find(".rebrand-recaptcha").length&&t.find('button[type="submit"]').removeClass("d-none")},u=(e,t)=>{const n=r()(e).closest(".text-input"),a=n.data("regex"),o=n.data("digits")||"";let s=new RegExp,l=new RegExp,c=new RegExp,d="",u=new RegExp;if(n.length&&void 0!==a){switch(a){case 0:s=!1;break;case 1:s=/^([^0-9]*)$/;break;case 2:s=/^[0-9]*$/;break;case 3:s=/^[0-9-]*$/;break;case 4:s=/^(\w+)([-+.]\w+)*@(\w+)([-.]\w+)*([-.](\w){2,})$/,c=/(^\.)|(^@)|(.*@.*@)|(.*[\.-]{2,})|(@\.)|(\.@)|([!"`'#%&,:;<>={}~\$\(\)\*\+\/\\\?\[\]\^\|])+/;break;case 5:s=/^[0-9a-zA-Z]+$/;break;case 6:s=/^1[0-46-9][0-9]+$/,d="012000000";break;case 7:let e="",t="";if(o&&"string"==typeof o){if(-1!=o.indexOf("-")){let n=o.replace(/ /g,"").split("-");e=`^[0-9]{${n[0]},${n[1]||""}}`,t=`^[0-9]{0,${n[1]}}$`}else{let n=o.replace(/ /g,"").split(",");e="";t=`^[0-9]{0,${n.reduce((t,n)=>(n&&(e+=`^[0-9]{${n}}|`),Math.max(t,n)),0)}}$`}s=new RegExp(e),u=new RegExp(t)}break;case 8:s=/^[0-9]{6}-[0-9]{2}-[0-9]{4}$/,d="000000-00-0000";break;case 9:s=/^([^0-9]*)$/;break;case 10:s=/^[a-zA-Z0-9]*$/,l=/^[a-zA-Z0-9]*$/;break;case 11:s=/^[0-9]+-([0-9])+$/,l=/^[0-9]*$|^[0-9]+-$|^[0-9]+-[0-9]+$/}s&&!e.hasAttribute("pattern")&&(r()(e).attr("pattern",s.source),e.addEventListener("input",t=>{let n=(t=t||window.event).target.value,r="";switch(""===n&&(e.lastValue=""),a){case 1:case 2:case 3:case 5:case 9:if(s.test(n))r=n;else{r=e.lastValue||"",e.value=r;const t=Object(i.k)(r,n);e.setSelectionRange(t,t)}break;case 4:!0!==c.test(n)?r=n:(r=e.lastValue||"",e.value=r);break;case 6:if(s.test(`${n}${d.substring(n.length)}`))r=n;else{r=e.lastValue||"",e.value=r;const t=Object(i.k)(r,n);e.setSelectionRange(t,t)}break;case 7:if(!0===u.test(""+n))r=n;else{r=e.lastValue||"",e.value=r;const t=Object(i.k)(r,n);e.setSelectionRange(t,t)}break;case 8:if(("insertText"===t.inputType||"insertFromPaste"===t.inputType||"input"===t.type)&&/[0-9]{12}/.test(n)){let t=String(n).split("");t.splice(8,0,"-"),t.splice(6,0,"-"),n=t.join(""),e.value=n}if(s.test(`${n}${d.substring(n.length)}`))r=n;else{r=e.lastValue||"",e.value=r;const t=Object(i.k)(r,n);e.setSelectionRange(t,t)}"insertText"!==t.inputType&&"insertFromPaste"!==t.inputType||6!==r.length&&9!==r.length||(r+="-",e.value=r);break;case 10:if(l.test(n))r=n;else{r=e.lastValue||"",e.value=r;const t=Object(i.k)(r,n);e.setSelectionRange(t,t)}break;case 11:if(l.test(n))r=n;else{r=e.lastValue||"",e.value=r;const t=Object(i.k)(r,n);e.setSelectionRange(t,t)}}if(r.length>0&&(e.lastValue=r,e.classList.contains("invalid"))){e.classList.remove("invalid");const t=e.parentNode.querySelector(".invalid-feedback");null!==t&&(t.style.display="none")}}))}t&&t({textGroup:n[0],regex:s,rx:a,digits:o})},p=e=>{const t=document.querySelectorAll("input, textarea")||$form.find('.form-details input [type="radio"] label, .form-details input [type="checkbox"] label, .form-rdo-input');for(let e of t)e.addEventListener("invalid",t=>{e.classList.add("invalid")},!1),e.addEventListener("blur",t=>{e.classList.remove("invalid"),e.checkValidity()});e.addEventListener("submit",e=>{e.preventDefault()}),r()(".form-rdo-input").hasClass("invalid")&&r()(this).parent.addClass("invalid");const n=e=>{if(!r()(e).is("iframe")&&!r()(e).is(".coverage")){const t=r()(e).closest(".text-input");t.length&&u(e);const n=r()(e).is(":visible"),a=e.checkValidity(),i=r()(e).closest('[class*="group"]');r()(".form-textfield .invalid-feedback");if(r()("select.storeselectpicker").length>0&&(r()("[data-attr-value='state-list']").each((function(){r()(this).val()?r()(this).closest(".state-dropdown-location").removeClass("invalid"):r()(this).closest(".state-dropdown-location").addClass("invalid")})),r()("[data-attr-value='town-list']").each((function(){r()(this).val()?r()(this).closest(".town-dropdown-location").removeClass("invalid"):r()(this).closest(".town-dropdown-location").addClass("invalid")})),r()("[data-attr-value='store-list']").each((function(){r()(this).val()?r()(this).closest(".store-dropdown-location").removeClass("invalid"):r()(this).closest(".store-dropdown-location").addClass("invalid")}))),n&&a)i.next(".invalid-feedback").length?i.next(".invalid-feedback").hide():i.find(".invalid-feedback").hide();else if(i.next(".invalid-feedback").length)i.next(".invalid-feedback").css("display","inline-flex");else{if(t.length&&""!==e.value){const e=t.data("regex-msg");t.find(".invalid-feedback").text(e)}i.find(".invalid-feedback").css("display","inline-flex")}}};r()(e).on("change","input, select",e=>{const t=e.target;n(t)}),r()(e).on("click",'[type="submit"]',t=>{t.preventDefault();const a=r()(t.target);0!==t.screenX&&0!==t.screenY&&(a.attr("disabled",!0),((e,t)=>{if(e.querySelectorAll("[name]").forEach(e=>{n(e)}),r()(e).find(".invalid-feedback").is(":visible"))t.attr("disabled",!1);else{const t=r()(e).find(".rebrand-recaptcha").not(".coverage");if(t.length){const e=t.attr("widget-id");grecaptcha.execute(e)}}})(e,a))})},f=(e,t)=>{const n=r()(e),a=n.find(":selected").data("textfield"),i=n.data("name"),o=n.parents(".dropdown-select-inputfield").find(".dropdown-trigger"),s=n.parents(".double-textinput-select").find(".dropdown-trigger"),l=r()(".double-textinput-select").find(".dropdown-trigger :input"),c=n.find(":selected").val();l.length>0&&(l.prop("disabled",!0),r()(".double-textinput-select").find("[data-dropdown-option='"+c+"']").find(":input").prop("disabled",!1),s.hide()),"onChange"==t&&o.hide(),o.each((function(e,t){r()(t).find("input").prop("required")&&(r()(t).attr("data-required","true"),r()(t).find("input").removeAttr("required"),r()(t).removeClass("invalid")),r()(t).data("dropdownOption")==a?(r()(t).css("display","block"),r()(t).find("input").removeAttr("disabled"),"true"==r()(t).attr("data-required")&&r()(t).find("input").attr("required","true"),r()(t).find("input").attr("name",i)):(r()(t).find("input").val(""),r()(t).find("input").removeAttr("name"),r()(t).find("input").attr("disabled","true"))}))},m=()=>{const e=r()(".dropdown-select-inputfield, .double-textinput-select");if(e.length>0){var t=e.find("select");t.length>0&&(t.each((function(){f(this,"onLoad")})),t.on("changed.bs.select",(function(e){f(this,"onChange")})))}};function h(e){e&&e.element&&function(e){e.element.removeAttribute("data-cmp-is");const t=e.element;(e=>{r()(e).find('input[type="file"]').length>0&&r()(e).find('input[type="file"]').change((function(t){var n=t.target.files[0].size/1024/1024,a=t.target.files[0].name;n>5?r()(e).find(".form-file .invalid-feedback").addClass("d-inline-flex").text("File size exceeds 5 MB."):(r()(e).find(".form-file .btn").addClass("disabled"),r()(e).find(".form-file .file-details").removeClass("invisible").addClass("visible"),r()(e).find(".form-file .text-filename").text(a),r()(e).find(".form-file .progress-bar").css("width","100%").attr("aria-valuenow",100),r()(e).find(".form-file .invalid-feedback").removeClass("d-inline-flex")),r()(e).find(".form-file .text-remove").click((function(){r()(e).find('input[type="file"]').val(""),r()(e).find(".form-file .file-details").removeClass("visible").addClass("invisible"),r()(e).find(".form-file .btn").removeClass("disabled"),r()(e).find(".form-file .progress-bar").css("width","0%").attr("aria-valuenow",0)}))}))})(t),d(t),(e=>{const t=r()(e).find("select");Object(i.f)("select_picker_initiate",{selector:".selectpicker"});const n=r()(e).find(".cmp-store-location");if(n.length){let e=JSON.parse(window.stateTownList);l(n,e)}t.on("change",e=>{r()(e.target);Object(i.f)("select_picker_refresh",{selector:".selectpicker"})})})(t),(e=>{const t=e.querySelectorAll("[data-regex]");Array.from(t).forEach(e=>{const t=e.querySelector("input");u(t,e=>{})})})(t),(e=>{p(e)})(t),(e=>{var t=r()(e).closest(".cmp-overlay");null!==t&&r()(t).on("hidden.bs.modal",(function(t){r()(e).find(".selectpicker").length>0&&Object(i.f)("select_picker_refresh",{selector:".selectpicker"}),r()(e).find('input[type="file"]').length>0&&(r()(e).find('input[type="file"]').val(""),r()(e).find(".form-file .file-details").removeClass("visible").addClass("invisible"),r()(e).find(".form-file .btn").removeClass("disabled"),r()(e).find(".form-file .progress-bar").css("width","0%").attr("aria-valuenow",0))}))})(t),m(),i.q&&(()=>{const e=e=>{const t=document.createElement("span");return t.classList.add("form-response-condition-wrapper"),t.setAttribute("aria-hidden",!0),t.setAttribute("data-condition-key",e[1]),t.setAttribute("data-condition-operator",e[2]),t.setAttribute("data-condition-match",void 0!==e[3]?e[3].replace(/^\s|\s$/g,"").replace(/^"|"$/g,""):""),t},t=document.querySelectorAll(".form-response-container:not(.response-ready)"),n=new RegExp(/\[\[\s*[iI][fF]\s+(form\.\S+)\s+(==|!=|<=|<|>=|>|><|!><|&lt;=|&lt;|&gt;=|&gt;|&gt;&lt;|!&gt;&lt;|\?\?|\!\?\?)\s+("\S*?")*\s*\]\]([\s\S]*?)\[\[\s*\/\s*[iI][fF]\s*\]\]/gm),a=new RegExp(/\[\[\s*[iI][fF]\s+(form\.\S+)\s+(==|!=|<=|<|>=|>|><|!><|&lt;=|&lt;|&gt;=|&gt;|&gt;&lt;|!&gt;&lt;|\?\?|\!\?\?)\s+(.*?)\s*\]\]?/g),r=new RegExp(/\[\[\s*\/\s*[iI][fF]\s*\]\](?![\s\S]*\[\[\s*\/\s*[iI][fF]\s*\]\])/g),o=new RegExp(/(?:\[\s*)(form\.\S*)\s*((?:"|&quot;)[^\n\r]*?(?:"|&quot;))*\s*(\([^\n\r]*?\))*(?:\s*?\/])/g);null!==t&&Array.from(t).forEach(t=>{t.classList.add("response-ready");let s=null,l=null;const d=document.createNodeIterator(t,NodeFilter.SHOW_ELEMENT,t=>{if(t.textContent.match(a)||t.textContent.match(r)){const o=Array.from(t.childNodes).find(e=>e.nodeType===Node.TEXT_NODE&&e.nodeValue.match(n));if(null!=o)return NodeFilter.FILTER_ACCEPT;{const n=Array.from(t.childNodes).find(e=>e.nodeType===Node.TEXT_NODE&&e.nodeValue.match(a)),o=Array.from(t.childNodes).find(e=>e.nodeType===Node.TEXT_NODE&&e.nodeValue.match(r));if(null!=n&&null!=o){const t=a.exec(n.nodeValue);if(null!==t){const i=n.parentNode,s=e(t);n.nodeValue=n.nodeValue.replace(a,""),o.nodeValue=o.nodeValue.replace(r,""),Array.from(i.childNodes).forEach(e=>{s.append(e)}),i.append(s)}}else if(null==o&&(s=null!=n?n:s),(null!=s&&void 0===n||null===n)&&(l=null!=o?o:l),null!==s&&null!==l){const t=a.exec(s.nodeValue),n=Object(i.b)(s,l);if(null!==n&&null!==t){const i=e(t);s.nodeValue=s.nodeValue.replace(a,""),l.nodeValue=l.nodeValue.replace(r,""),Array.from(n.childNodes).forEach(e=>{i.append(e)}),n.appendChild(i),s=null,l=null}}}}return NodeFilter.FILTER_REJECT});let u,p=[];for(;u=d.nextNode();)p.unshift(u);p.forEach(e=>{const t=[...c()(e.innerHTML,n)];null!==t&&t.forEach(t=>{const n=`<span class="form-response-condition-wrapper" data-condition-key=${JSON.stringify(t[1])} data-condition-operator=${JSON.stringify(t[2])} data-condition-match=${void 0!==t[3]?JSON.stringify(t[3].replace(/^\"|\"$/g,"")):""} aria-hidden="true">`,i=t[0].match(a)[0];e.innerHTML=e.innerHTML.replace(""+i,""+n),e.innerHTML=e.innerHTML.replace(r,"</span>")})});const f=document.createNodeIterator(t,NodeFilter.SHOW_ELEMENT,e=>{if(e.textContent.match(o)){const t=Array.from(e.childNodes).filter(e=>e.nodeType===Node.TEXT_NODE&&e.nodeValue.match(o));if(null!=t&&t.length>0)return NodeFilter.FILTER_ACCEPT}return NodeFilter.FILTER_REJECT});let m,h=[];for(;m=f.nextNode();)h.unshift(m);h.forEach(e=>{const t=[...c()(e.innerHTML,o)];null!==t&&t.forEach(t=>{const n=`<span class="form-response-shortcode" data-content=${JSON.stringify(t[1])} data-type=${void 0!==t[3]?JSON.stringify(t[3].replace(/^\(|\)$/g,"")):""} ><span class="form-response-content" aria-hidden="true"></span><span class="form-response-placeholder" aria-hidden="false">${void 0!==t[2]?t[2].replace(/^\"|\"|&quot;|$/g,""):""}</span></span>`;e.innerHTML=e.innerHTML.split(t[0]).join(n)})})})})()}(e)}function g(){let e=document.querySelectorAll(t);for(let t=0;t<e.length;t++)new h({element:e[t]});let n=document.querySelector("body");new(window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver)((function(e){e.forEach((function(e){let n=[].slice.call(e.addedNodes);n.length>0&&n.forEach((function(e){if(e.querySelectorAll){[].slice.call(e.querySelectorAll(t)).forEach((function(e){new h({element:e})}))}}))}))})).observe(n,{subtree:!0,childList:!0,characterData:!0})}"loading"!==document.readyState?g():document.addEventListener("DOMContentLoaded",g)}()}});
