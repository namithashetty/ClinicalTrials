/*!v0.12.0 - 2014-08-08 */
!
function(a, b) {
	var c, d, e, f, g, h, i, j, k, l, m;
	if (d = document.createElement("div"), d.innerHTML = "<!--[if lte IE 7]><i></i><![endif]-->", d.getElementsByTagName("i").length) return !1;
	if (!(null != b && null != (k = b.widgets) ? k.length : void 0)) return !1;
	for (g = !1, l = null != b ? b.widgets : void 0, i = 0, j = l.length; j > i; i++) if (h = l[i], (null != h ? h.id : void 0) && !(null != h ? h.disabled : void 0)) {
		g = !0;
		break
	}
	return g ? (e = function() {
		var c, d, e, f;
		if (!a.gscwidgets || "function" != typeof a.gscwidgets.start) throw new Error("Widget runtime is not loaded. Exiting");
		if (a.gscwidgets.runtime) throw new Error("Another widget runtime is initialized. Exiting");
		if (null == b.runtime && (b.runtime = {}), a._gscq && "[object Array]" === Object.prototype.toString.call(a._gscq)) for (f = a._gscq, d = 0, e = f.length; e > d; d++) c = f[d], c && "[object Array]" === Object.prototype.toString.call(c) && c.length > 0 && (b.runtime[c[0]] = c.length > 1 ? c[1] : !0);
		return a.gscwidgets.start(b), null
	}, f = function(a) {
		var c, d, e, f;
		return d = document.createElement("script"), c = !1, e = document.getElementsByTagName("script")[0], d.type = "text/javascript", d.async = !0, d.src = null != b && null != (f = b.settings) ? f.RUNTIME_URL : void 0, d.onload = d.onreadystatechange = function() {
			return c || this.readyState && "complete" !== this.readyState && "loaded" !== this.readyState ? void 0 : (c = !0, "function" == typeof a ? a() : void 0)
		}, e.parentNode.insertBefore(d, e), null
	}, c = null != (m = a.gscwidgets) ? m.start : void 0, c && "function" == typeof c ? e() : f(e), null) : void 0
}(window, {
	"widgets": [{
		"sort_order": -2,
		"layout": "rightSide",
		"data": {
			"successMessage": "You have successfully subscribed.",
			"description": "",
			"title": "Subscribe to this Clinical Study",
			"buttonText": "Subscribe",
			"label": "Subscribe for updates",
			"note": "",
			"placeholder": "Enter your email address",
			"successTitle": "Thank you!"
		},
		"id": 16237,
		"style": {
			"baseColor": "#2D2D2D",
			"font": "Arial, Helvetica, sans-serif",
			"animation": "slideIn"
		},
		"targeting": {
			"url": [{
				"include": true,
				"value": "^/(:?.*)$"
			}],
			"ab": 100
		},
		"name": "Subscribe widget",
		"settings": {
			"pushBody": true,
			"scrollWithBody": true,
			"storage": {
				"action": 364,
				"close": 1
			}
		},
		"template": "normal",
		"type": "subscribe",
		"display": {
			"start": {},
			"stop": {}
		}
	}, {
		"disabled": true,
		"id": 16236
	}, {
		"disabled": true,
		"id": 16235
	}],
	"runtime": {
		"trackUrl": "https://app.getsitecontrol.com/api/v1/stat",
		"shareByEmailUrl": "https://app.getsitecontrol.com/api/v1/share-by-email?u={url}&t={title}&d={description}&logo={logo}",
		"doTrack": true,
		"responsive": {
			"enabled": true,
			"breakpoint": 640
		},
		"submitUrl": "https://app.getsitecontrol.com/api/v1/submit",
		"logoUrl": "//getsitecontrol.com/?utm_source={site}&utm_medium=referral&utm_term={layout}&utm_content={type}&utm_campaign=Widgets Logo",
		"sessionLength": 20,
		"removeLogo": true
	},
	"settings": {
		"RUNTIME_URL": "//st.getsitecontrol.com/main/runtime/runtime.1.8.0.2.js?_=1.8.0.2"
	}
});
