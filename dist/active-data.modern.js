!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports["active-data"]=e():t["active-data"]=e()}("undefined"!=typeof self?self:this,function(){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="/js/",n(n.s=24)}([function(t,e){var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(t,e,n){var r=n(7)("wks"),o=n(9),i=n(0).Symbol,a="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=a&&i[t]||(a?i:o)("Symbol."+t))}).store=r},function(t,e,n){var r=n(4),o=n(18);t.exports=n(5)?function(t,e,n){return r.f(t,e,o(1,n))}:function(t,e,n){return t[e]=n,t}},function(t,e){var n=t.exports={version:"2.6.5"};"number"==typeof __e&&(__e=n)},function(t,e,n){var r=n(10),o=n(29),i=n(30),a=Object.defineProperty;e.f=n(5)?Object.defineProperty:function(t,e,n){if(r(t),e=i(e,!0),r(n),o)try{return a(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[e]=n.value),t}},function(t,e,n){t.exports=!n(16)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,e){var n={}.hasOwnProperty;t.exports=function(t,e){return n.call(t,e)}},function(t,e,n){var r=n(3),o=n(0),i=o["__core-js_shared__"]||(o["__core-js_shared__"]={});(t.exports=function(t,e){return i[t]||(i[t]=void 0!==e?e:{})})("versions",[]).push({version:r.version,mode:n(8)?"pure":"global",copyright:"© 2019 Denis Pushkarev (zloirock.ru)"})},function(t,e){t.exports=!1},function(t,e){var n=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+r).toString(36))}},function(t,e,n){var r=n(11);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e){t.exports={}},function(t,e,n){var r=n(32),o=n(19);t.exports=function(t){return r(o(t))}},function(t,e,n){var r=n(0),o=n(2),i=n(6),a=n(9)("src"),u=n(36),c=(""+u).split("toString");n(3).inspectSource=function(t){return u.call(t)},(t.exports=function(t,e,n,u){var s="function"==typeof n;s&&(i(n,"name")||o(n,"name",e)),t[e]!==n&&(s&&(i(n,a)||o(n,a,t[e]?""+t[e]:c.join(String(e)))),t===r?t[e]=n:u?t[e]?t[e]=n:o(t,e,n):(delete t[e],o(t,e,n)))})(Function.prototype,"toString",function(){return"function"==typeof this&&this[a]||u.call(this)})},function(t,e,n){var r=n(7)("keys"),o=n(9);t.exports=function(t){return r[t]||(r[t]=o(t))}},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e,n){var r=n(11),o=n(0).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e){t.exports=function(t){if(null==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e,n){var r=n(42),o=n(22);t.exports=Object.keys||function(t){return r(t,o)}},function(t,e){var n=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:n)(t)}},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,e,n){var r=n(4).f,o=n(6),i=n(1)("toStringTag");t.exports=function(t,e,n){t&&!o(t=n?t:t.prototype,i)&&r(t,i,{configurable:!0,value:e})}},function(t,e,n){t.exports=n(25)},function(t,e,n){"use strict";n.r(e),n.d(e,"Manager",function(){return o}),n.d(e,"observable",function(){return i}),n.d(e,"reaction",function(){return a}),n.d(e,"computed",function(){return u}),n.d(e,"updatable",function(){return c});n(26),n(49);const r=10;class o{constructor(t){this.$isObservableSymbol=Symbol("isObservable"),this.$registerRead=Symbol("registerRead"),this.$dataSource=Symbol("dataSource"),this.observables=new WeakMap,this.cache=new WeakMap,this.options={enabled:!0,prototypes:!1,immediateReaction:!1,watchKey:"$$watch",watchDeepKey:"$$watchDeep",dataSourceKey:"$$dataSource"},this.callStack=[],this.reactionsToUpdate=new Set,this.setOptions(t),this.observable=this.makeObservable.bind(this),this.reaction=this.makeReaction.bind(this),this.computed=this.makeComputed.bind(this),this.updatable=this.makeUpdatable.bind(this)}setOptions(t={}){this.options=Object.assign(this.options,t)}makeObservable(t){const e=this;if(!t)return t;if(t.constructor!==Object&&t.constructor!==Array)return t;if(e.isObservable(t))return t;let n=e.observables.get(t);if(!n){const r=new Map,o=t=>{e.valid=!1,t.invalidIteration=!0,t.onInvalidate&&t.onInvalidate(),t.valid&&(t.valid=!1,t.deps.forEach(t=>o(t))),t.deps.clear()},i=t=>{const e={updatableStates:new Set,updatableStateMap:new WeakMap};return r.set(t,e),e};let a=!1;const u=(n,o,u)=>{let c=o;if(o===e.options.watchDeepKey){if(a)return;a=!0,Object.keys(t).forEach(n=>{if("object"==typeof t[n]){e.makeObservable(t[n])[e.options.watchDeepKey]}}),c=e.options.watchKey,a=!1}let s=r.get(c);s||(s=i(c)),s.updatableStates.add(n);let f=s.updatableStateMap.get(n);if(f||(f={},s.updatableStateMap.set(n,f)),n.uninit.set(t,t=>{s.updatableStates.delete(t),s.updatableStateMap.delete(t),0===s.updatableStates.size&&r.delete(c)}),e.options.prototypes){if(!u)u=[t],f.root=!0;else{const t=u[u.length-1];if(f.prototypes||(f.prototypes=new Map),f.prototypes.get(t))return;f.prototypes.set(t,u)}let r=Object.getPrototypeOf(t);for(;null!=r&&r!=Object.prototype;){const t=e.observables.get(r);if(u.unshift(r),null!=t&&t!==Object.prototype){t[e.$registerRead](n,o,u);break}r=Object.getPrototypeOf(r)}}else f.root=!0},c=(t,n)=>{[n,e.options.watchKey].forEach(e=>{const i=r.get(e);i&&i.updatableStates.forEach(e=>{const r=i.updatableStateMap.get(e);if(r.root)o(e);else{[...r.prototypes.values()].some(e=>{const r=e.indexOf(t)+1,o=e.length;let i=!0;for(let t=r;t<o;t++)if(e[t].hasOwnProperty(n)){i=!1;break}return i})&&o(e)}})}),e.inRunSection||(e.options.immediateReaction?e.run():e.runDeferred())};n=new Proxy(t,{get:(n,r,o)=>{if(r===e.$isObservableSymbol)return!0;if(r===e.options.dataSourceKey)return t;const i=Object.getOwnPropertyDescriptor(n,r);if(i&&"function"==typeof i.get)return e.makeUpdatable(i.get,{obj:n}).call(n);if(e.callStack.length){if(r===e.$registerRead)return u;u(e.callStack[e.callStack.length-1].updatableState,r)}if(r===e.options.watchKey||r===e.options.watchDeepKey)return o;const a=n[r];return"object"==typeof a?e.makeObservable(a):a},set:(t,e,n)=>((n!==t[e]||Array.isArray(t)&&"length"===e)&&(t[e]=n,c(t,e)),!0),deleteProperty:(t,e)=>(c(t,e),!0)}),e.observables.set(t,n)}return n}makeUpdatable(t,e={}){if(t.updatableCall)return t;const n=e.onInvalidate;let r=e.obj;const o=this;let i;null==r&&(r=o);let a=o.cache.get(r);if(a?i=a.get(t):(a=new Map,o.cache.set(r,a)),!i){o.valid=!1;const e={valid:!1,onInvalidate:n,value:void 0,deps:new Set,uninit:new Map};(i=function(){if(e.computing)console.warn('Detected cross reference inside computed properties! "undefined" will be returned to prevent infinite loop');else{if(o.callStack.length&&e.deps.add(o.callStack[o.callStack.length-1].updatableState),e.valid)return e.value;e.computing=!0,e.uninit.forEach(t=>t(e)),e.uninit.clear(),o.callStack.push({obj:r,call:t,updatableState:e});try{let n;n=this?o.observables.get(this):o,e.invalidIteration=!1;const r=t.call(n,n);return e.valid=!e.invalidIteration,e.value=r,r}finally{e.computing=!1,o.callStack.pop()}}}).updatableCall=t,a.set(t,i)}return i}makeComputed(t,e,n,r){Object.defineProperty(t,e,{enumerable:!0,get:this.makeUpdatable(n,{obj:t}),set:r})}makeReaction(t,e=!0){const n=this,r=this.makeUpdatable(t,{onInvalidate:()=>n.reactionsToUpdate.add(r)});return n.reactionsToUpdate.add(r),e&&(this.options.immediateReaction?n.run():n.runDeferred()),r}isObservable(t){return!0===t[this.$isObservableSymbol]}run(t){if(this.options.enabled){this.inRunSection=!0;try{"function"==typeof t&&t(),this.runScheduled=!1;let e=0;for(;!this.valid;){if(this.valid=!0,e>r)throw new Error("Max iterations exceeded!");e++,[...this.reactionsToUpdate.values()].forEach(t=>{this.reactionsToUpdate.delete(t),t()})}"function"==typeof this.onAfterRun&&this.onAfterRun()}finally{this.inRunSection=!1}}}runDeferred(t){if(this.options.enabled){this.inRunSection=!0;try{this.runScheduled||(this.runScheduled=setTimeout(()=>this.run())),"function"==typeof t&&t()}finally{this.inRunSection=!1}}}}o.default=new o,o.default.Manager=o,e.default=o.default;const i=o.default.observable,a=o.default.reaction,u=o.default.computed,c=o.default.updatable},function(t,e,n){for(var r=n(27),o=n(20),i=n(14),a=n(0),u=n(2),c=n(12),s=n(1),f=s("iterator"),l=s("toStringTag"),p=c.Array,d={CSSRuleList:!0,CSSStyleDeclaration:!1,CSSValueList:!1,ClientRectList:!1,DOMRectList:!1,DOMStringList:!1,DOMTokenList:!0,DataTransferItemList:!1,FileList:!1,HTMLAllCollection:!1,HTMLCollection:!1,HTMLFormElement:!1,HTMLSelectElement:!1,MediaList:!0,MimeTypeArray:!1,NamedNodeMap:!1,NodeList:!0,PaintRequestList:!1,Plugin:!1,PluginArray:!1,SVGLengthList:!1,SVGNumberList:!1,SVGPathSegList:!1,SVGPointList:!1,SVGStringList:!1,SVGTransformList:!1,SourceBufferList:!1,StyleSheetList:!0,TextTrackCueList:!1,TextTrackList:!1,TouchList:!1},y=o(d),b=0;b<y.length;b++){var h,v=y[b],S=d[v],m=a[v],g=m&&m.prototype;if(g&&(g[f]||u(g,f,p),g[l]||u(g,l,v),c[v]=p,S))for(h in r)g[h]||i(g,h,r[h],!0)}},function(t,e,n){"use strict";var r=n(28),o=n(31),i=n(12),a=n(13);t.exports=n(34)(Array,"Array",function(t,e){this._t=a(t),this._i=0,this._k=e},function(){var t=this._t,e=this._k,n=this._i++;return!t||n>=t.length?(this._t=void 0,o(1)):o(0,"keys"==e?n:"values"==e?t[n]:[n,t[n]])},"values"),i.Arguments=i.Array,r("keys"),r("values"),r("entries")},function(t,e,n){var r=n(1)("unscopables"),o=Array.prototype;null==o[r]&&n(2)(o,r,{}),t.exports=function(t){o[r][t]=!0}},function(t,e,n){t.exports=!n(5)&&!n(16)(function(){return 7!=Object.defineProperty(n(17)("div"),"a",{get:function(){return 7}}).a})},function(t,e,n){var r=n(11);t.exports=function(t,e){if(!r(t))return t;var n,o;if(e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;if("function"==typeof(n=t.valueOf)&&!r(o=n.call(t)))return o;if(!e&&"function"==typeof(n=t.toString)&&!r(o=n.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},function(t,e,n){var r=n(33);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},function(t,e){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},function(t,e,n){"use strict";var r=n(8),o=n(35),i=n(14),a=n(2),u=n(12),c=n(39),s=n(23),f=n(47),l=n(1)("iterator"),p=!([].keys&&"next"in[].keys()),d=function(){return this};t.exports=function(t,e,n,y,b,h,v){c(n,e,y);var S,m,g,x=function(t){if(!p&&t in k)return k[t];switch(t){case"keys":case"values":return function(){return new n(this,t)}}return function(){return new n(this,t)}},O=e+" Iterator",w="values"==b,j=!1,k=t.prototype,M=k[l]||k["@@iterator"]||b&&k[b],_=M||x(b),P=b?w?x("entries"):_:void 0,T="Array"==e&&k.entries||M;if(T&&(g=f(T.call(new t)))!==Object.prototype&&g.next&&(s(g,O,!0),r||"function"==typeof g[l]||a(g,l,d)),w&&M&&"values"!==M.name&&(j=!0,_=function(){return M.call(this)}),r&&!v||!p&&!j&&k[l]||a(k,l,_),u[e]=_,u[O]=d,b)if(S={values:w?_:x("values"),keys:h?_:x("keys"),entries:P},v)for(m in S)m in k||i(k,m,S[m]);else o(o.P+o.F*(p||j),e,S);return S}},function(t,e,n){var r=n(0),o=n(3),i=n(2),a=n(14),u=n(37),c=function(t,e,n){var s,f,l,p,d=t&c.F,y=t&c.G,b=t&c.S,h=t&c.P,v=t&c.B,S=y?r:b?r[e]||(r[e]={}):(r[e]||{}).prototype,m=y?o:o[e]||(o[e]={}),g=m.prototype||(m.prototype={});for(s in y&&(n=e),n)l=((f=!d&&S&&void 0!==S[s])?S:n)[s],p=v&&f?u(l,r):h&&"function"==typeof l?u(Function.call,l):l,S&&a(S,s,l,t&c.U),m[s]!=l&&i(m,s,p),h&&g[s]!=l&&(g[s]=l)};r.core=o,c.F=1,c.G=2,c.S=4,c.P=8,c.B=16,c.W=32,c.U=64,c.R=128,t.exports=c},function(t,e,n){t.exports=n(7)("native-function-to-string",Function.toString)},function(t,e,n){var r=n(38);t.exports=function(t,e,n){if(r(t),void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 2:return function(n,r){return t.call(e,n,r)};case 3:return function(n,r,o){return t.call(e,n,r,o)}}return function(){return t.apply(e,arguments)}}},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e,n){"use strict";var r=n(40),o=n(18),i=n(23),a={};n(2)(a,n(1)("iterator"),function(){return this}),t.exports=function(t,e,n){t.prototype=r(a,{next:o(1,n)}),i(t,e+" Iterator")}},function(t,e,n){var r=n(10),o=n(41),i=n(22),a=n(15)("IE_PROTO"),u=function(){},c=function(){var t,e=n(17)("iframe"),r=i.length;for(e.style.display="none",n(46).appendChild(e),e.src="javascript:",(t=e.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),c=t.F;r--;)delete c.prototype[i[r]];return c()};t.exports=Object.create||function(t,e){var n;return null!==t?(u.prototype=r(t),n=new u,u.prototype=null,n[a]=t):n=c(),void 0===e?n:o(n,e)}},function(t,e,n){var r=n(4),o=n(10),i=n(20);t.exports=n(5)?Object.defineProperties:function(t,e){o(t);for(var n,a=i(e),u=a.length,c=0;u>c;)r.f(t,n=a[c++],e[n]);return t}},function(t,e,n){var r=n(6),o=n(13),i=n(43)(!1),a=n(15)("IE_PROTO");t.exports=function(t,e){var n,u=o(t),c=0,s=[];for(n in u)n!=a&&r(u,n)&&s.push(n);for(;e.length>c;)r(u,n=e[c++])&&(~i(s,n)||s.push(n));return s}},function(t,e,n){var r=n(13),o=n(44),i=n(45);t.exports=function(t){return function(e,n,a){var u,c=r(e),s=o(c.length),f=i(a,s);if(t&&n!=n){for(;s>f;)if((u=c[f++])!=u)return!0}else for(;s>f;f++)if((t||f in c)&&c[f]===n)return t||f||0;return!t&&-1}}},function(t,e,n){var r=n(21),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0}},function(t,e,n){var r=n(21),o=Math.max,i=Math.min;t.exports=function(t,e){return(t=r(t))<0?o(t+e,0):i(t,e)}},function(t,e,n){var r=n(0).document;t.exports=r&&r.documentElement},function(t,e,n){var r=n(6),o=n(48),i=n(15)("IE_PROTO"),a=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),r(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?a:null}},function(t,e,n){var r=n(19);t.exports=function(t){return Object(r(t))}},function(t,e,n){n(50)("asyncIterator")},function(t,e,n){var r=n(0),o=n(3),i=n(8),a=n(51),u=n(4).f;t.exports=function(t){var e=o.Symbol||(o.Symbol=i?{}:r.Symbol||{});"_"==t.charAt(0)||t in e||u(e,t,{value:a.f(t)})}},function(t,e,n){e.f=n(1)}]).default});
//# sourceMappingURL=active-data.modern.js.map