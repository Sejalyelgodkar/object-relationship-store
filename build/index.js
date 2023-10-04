"use strict";function e(e,r,n){return{__name:e.__name,__primaryKey:e.__primaryKey,__has:r,__alias:n}}var r=function(){return r=Object.assign||function(e){for(var r,n=1,t=arguments.length;n<t;n++)for(var a in r=arguments[n])Object.prototype.hasOwnProperty.call(r,a)&&(e[a]=r[a]);return e},r.apply(this,arguments)};function n(e,r){for(var n=0,t=Object.entries(e);n<t.length;n++){var a=t[n],i=a[0],_=a[1];if(r[i]!==_)return!1}return!0}function t(e,r){if(!r)return null;var n={};function t(e){e.forEach((function(e){var t=r[e];void 0!==t&&(n[e]=t)}))}return t("*"===e?Object.keys(r):e),n}function a(e,_,o){var c=o.from,s=o.where,f=o.fields,u=o.join;if(Array.isArray(s))return s.flatMap((function(n){var t;return null!==(t=a(e,_,r(r({},o),{where:n})))&&void 0!==t?t:[]}));var y=null,l=e[c],p=_[c];if(!p)return null;if("*"===s&&(y=Object.values(p).flatMap((function(e){var r;return null!==(r=t(f,e))&&void 0!==r?r:[]}))),"object"==typeof s){var m=s[l.__primaryKey];if(m)(x=t(f,p[m]))&&(y=x);if(!m){y=[];for(var h=0,d=Object.entries(p);h<d.length;h++){var v=d[h];if(v[0],n(s,b=v[1]))(x=t(f,b))&&y.push(x)}}}if("function"==typeof s){y=[];for(var O=0,K=Object.entries(p);O<K.length;O++){var b,x,j=K[O];if(j[0],s(b=j[1]))(x=t(f,b))&&y.push(x)}}return y&&u&&(Array.isArray(y)&&y.forEach((function(r){i(r,{join:u,from:c,model:e,state:_})})),Array.isArray(y)||i(y,{join:u,from:c,model:e,state:_})),y}function i(e,r){var n=r.join,t=r.from,_=r.model,o=r.state,c=_[t];Object.values(n.reduce((function(e,r){return e[r.on]=r,e}),{})).forEach((function(r){var n,s=r.on,f=r.fields,u=r.join;if(e[s]){if(!c.__relationship[s])throw new Error('Field "'.concat(String(s),'" does not exist in object "').concat(t,'"'));if("hasOne"===c.__relationship[s].__has&&(e[s]=a(_,o,{fields:f,from:c.__relationship[s].__name,where:(n={},n[c.__relationship[s].__primaryKey]=e[s],n)})),"hasMany"===c.__relationship[s].__has){var y=[];e[s].forEach((function(e){var r,n=a(_,o,{fields:f,from:c.__relationship[s].__name,where:(r={},r[c.__relationship[s].__primaryKey]=e,r)});n&&y.push(n)})),e[s]=y}u&&("hasOne"===c.__relationship[s].__has&&i(e[s],{from:c.__relationship[s].__name,join:u,model:_,state:o}),"hasMany"===c.__relationship[s].__has&&e[s].forEach((function(e){i(e,{from:c.__relationship[s].__name,join:u,model:_,state:o})})))}}))}function _(e){if(null===e||"object"!=typeof e)return e;var r=Array.isArray(e)?[]:{};for(var n in e)e.hasOwnProperty(n)&&(r[n]=_(e[n]));return r}function o(e,r){if(e===r)return!0;if("object"!=typeof e||"object"!=typeof r||null===e||null===r)return!1;var n=Object.keys(e),t=Object.keys(r);if(n.length!==t.length)return!1;for(var a=0,i=n;a<i.length;a++){var _=i[a];if(!t.includes(_)||!o(e[_],r[_]))return!1}return!0}function c(e){var r=new Map;return function(){for(var n=[],t=0;t<arguments.length;t++)n[t]=arguments[t];var a=JSON.stringify(n),i=e.apply(void 0,n),_=r.get(a);return r.has(a)&&o(_,i)?_:(r.set(a,i),i)}}function s(e,r){return"function"==typeof r.__destroy__?e.__destroy__=r.__destroy__(e):r.__destroy__&&(e.__destroy__=r.__destroy__),"function"==typeof r.__identify__?e.__identify__=r.__identify__(e):r.__identify__&&(e.__identify__=r.__identify__),"function"==typeof r.__indexes__?e.__indexes__=r.__indexes__(e):r.__indexes__&&(e.__indexes__=r.__indexes__),"function"==typeof r.__removeFromIndexes__?e.__removeFromIndexes__=r.__removeFromIndexes__(e):r.__removeFromIndexes__&&(e.__removeFromIndexes__=r.__removeFromIndexes__),e}"function"==typeof SuppressedError&&SuppressedError,exports.createRelationalObject=function(r,n){var t={__name:r,__primaryKey:null!=n?n:"id",__relationship:{},__indexes:[]};return Object.setPrototypeOf(t,{hasOne:function(r,n){var t=this,a=null!=n?n:r.__name,i=Object.entries(t.__relationship).find((function(e){return e[0],e[1].__name===r.__name}));if(i&&t.__relationship[i[0]].__primaryKey===r.__primaryKey&&r.__primaryKey===t.__name)throw new Error('"'.concat(r.__name,'" reference already exists in "').concat(t.__name,'" as "').concat(i[0],'" with the primary key (pk) "').concat(r.__primaryKey,'". "').concat(t.__name,'" table failed to create a hasOne relationship with "').concat(a,'" because it has the same primary key "').concat(r.__primaryKey,'" as "').concat(i[0],'". The primary key for "').concat(i[0],'" and "').concat(a,'" are not unique.'));return t.__relationship[a]=e(r,"hasOne",a),this},hasMany:function(r,n){var t=this,a=null!=n?n:r.__name,i=Object.entries(t.__relationship).find((function(e){return e[0],e[1].__name===r.__name}));if(i&&t.__relationship[i[0]].__primaryKey===r.__primaryKey&&r.__primaryKey===t.__name)throw new Error('"'.concat(r.__name,'" reference already exists in "').concat(t.__name,'" as "').concat(i[0],'" with the primary key (pk) "').concat(r.__primaryKey,'". "').concat(t.__name,'" table failed to create a hasOne relationship with "').concat(a,'" because it has the same primary key "').concat(r.__primaryKey,'" as "').concat(i[0],'". The primary key for "').concat(i[0],'" and "').concat(a,'" are not unique.'));return t.__relationship[a]=e(r,"hasMany",a),this}}),t},exports.createRelationalObjectIndex=function(e,r,n){return{__name:e,__objects:r.map((function(e){return e.__name})),__sort:null!=n?n:null}},exports.createStore=function(e){var n,t,i=e.relationalCreators,o=e.indexes,s=e.identifier,f=e.initialStore,u={current:null!==(n=null==f?void 0:f.references)&&void 0!==n?n:{},upsert:function(e){this.current[e.name]||(this.current[e.name]={}),this.current[e.name][e.primaryKey]?this.current[e.name][e.primaryKey].includes(e.ref)||this.current[e.name][e.primaryKey].push(e.ref):this.current[e.name][e.primaryKey]=[e.ref]}},y=null!==(t=null==f?void 0:f.state)&&void 0!==t?t:{},l=new Set,p=i.reduce((function(e,n){var t;n.hasOne,n.hasMany;var a=function(e,r){var n={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&r.indexOf(t)<0&&(n[t]=e[t]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var a=0;for(t=Object.getOwnPropertySymbols(e);a<t.length;a++)r.indexOf(t[a])<0&&Object.prototype.propertyIsEnumerable.call(e,t[a])&&(n[t[a]]=e[t[a]])}return n}(n,["hasOne","hasMany"]);return r(r({},e),((t={})[a.__name]=a,t))}),{});function m(e){var r=_(Array.isArray(e)?e:[e]),n=r.reduce((function(e,r){if("string"==typeof r.__indexes__)return e.push(r.__indexes__.split("-")),e;if(r.__indexes__){var n=r.__indexes__.map((function(e){return e.split("-")}));e.push.apply(e,n)}return e}),[]);function t(e){var r=e.item,n=e.name,a=e.primaryKey,i=p[n];Object.entries(i.__relationship).forEach((function(e){var i,_=e[0],o=e[1];if(y[n][r[a]]){var c=y[n][r[a]][_];if(c)if("hasMany"!==o.__has){var s=u.current[o.__name][c];if(s){var f=s.every((function(e){var t=e.split("."),i=t[0],_=t[1];return i===n&&_===String(r[a])}));if(!f)return;t({item:(i={},i[o.__primaryKey]=c,i),name:o.__name,primaryKey:o.__primaryKey}),delete u.current[o.__name][c],delete y[o.__name][c]}}else c.forEach((function(e){var i,_=u.current[o.__name][e].every((function(e){var t=e.split("."),i=t[0],_=t[1];return i===n&&_===String(r[a])}));_&&(t({item:(i={},i[o.__primaryKey]=e,i),name:o.__name,primaryKey:o.__primaryKey}),delete u.current[o.__name][e],delete y[o.__name][e])}))}})),delete y[n][r[a]],i.__indexes.forEach((function(e){var t=y[e],i="".concat(n,"-").concat(r[a]),_=t.indexOf(i);-1!==_&&t.splice(_,1)}))}function a(e){var r=e.name,n=e.item,t=e.parentName,a=e.primaryKey,i=e.parentPrimaryKey,_=e.relationalObject,o=Object.values(_.__relationship).find((function(e){return e.__name===t}));if(o&&("hasOne"===o.__has&&(u.upsert({name:o.__name,primaryKey:i,ref:"".concat(r,".").concat(n[a],".").concat(o.__alias)}),y[r][n[a]][o.__alias]=i),"hasMany"===o.__has)){var c=y[r][n[a]][o.__alias];if(!Array.isArray(c))return u.upsert({name:o.__name,primaryKey:i,ref:"".concat(r,".").concat(n[a],".").concat(o.__alias)}),void(y[r][n[a]][o.__alias]=[i]);!!c.find((function(e){return e===i}))||(u.upsert({name:o.__name,primaryKey:i,ref:"".concat(r,".").concat(n[a],".").concat(o.__alias)}),c.push(i))}}function i(e){var r=e.item,n=e.parentName,_=e.parentField,o=e.parentFieldHasMany,c=e.parentPrimaryKey,f=function(e){if("__identify__"in e){var r=e.__identify__;return delete e.__identify__,r}for(var n in s)if(Object.prototype.hasOwnProperty.call(s,n)&&(0,s[n])(e))return n;throw new Error("Identifier was not able to identify this object ".concat(JSON.stringify(e)))}(r),l=p[f],m=l.__primaryKey;if(!r[m])throw new Error('Expected object "'.concat(f,'" to have a primaryKey "').concat(m,'".'));if("__destroy__"in r){if(r.__destroy__)return function(e){var r=e.item,n=e.name,a=e.primaryKey;if(y[n])if(u.current[n]){var i=r[a],_=u.current[n][i];_&&(_.forEach((function(e){var r=e.split("."),n=r[0],t=r[1],a=r[2];if(y[n][t])if("hasMany"===p[n].__relationship[a].__has){var _=y[n][t][a].indexOf(i);if(-1!==_){if(1===y[n][t][a].length)return void delete y[n][t][a];y[n][t][a].splice(_,1)}}else delete y[n][t][a]})),delete u.current[n][i]),t({item:r,name:n,primaryKey:a})}else t({item:r,name:n,primaryKey:a})}({item:r,name:f,primaryKey:m});delete r.__destroy__}if(y[f]||(y[f]={}),y[f][r[m]]||(y[f][r[m]]={}),!n){if("__indexes__"in r){var h="string"==typeof r.__indexes__?[r.__indexes__]:r.__indexes__;null==h||h.forEach((function(e){var n=e.split("-")[0],t=p[n];if(null==t?void 0:t.__objects.includes(f)){l.__indexes.includes(e)||l.__indexes.push(e),y[e]||(y[e]=[]);var a="".concat(f,"-").concat(r[m]);y[e].includes(a)||y[e].push(a)}})),delete r.__indexes__}if("__removeFromIndexes__"in r){var d="string"==typeof r.__removeFromIndexes__?[r.__removeFromIndexes__]:r.__removeFromIndexes__;null==d||d.forEach((function(e){if(y[e]){var n="".concat(f,"-").concat(r[m]),t=y[e].indexOf(n);t>-1&&y[e].splice(t,1)}})),delete r.__removeFromIndexes__}}if(Object.entries(r).forEach((function(e){var n=e[0],t=e[1];if(l.__relationship[n]){var a="hasMany"===l.__relationship[n].__has;if(!r[n])return;if(!a)return void i({item:r[n],parentPrimaryKey:r[m],parentField:n,parentName:f});if(r[n].every((function(e){return"object"!=typeof e}))){var _=y[l.__relationship[n].__name];return void(y[f][r[m]][n]=r[n].filter((function(e){return!!_[e]})))}r[n].forEach((function(e){i({item:e,parentPrimaryKey:r[m],parentField:n,parentName:f,parentFieldHasMany:!0})}))}else y[f][r[m]][n]=t})),n&&_&&c){if(o){var v=y[n][c][_];return Array.isArray(v)?void(!!v.find((function(e){return e===r[m]}))||(u.upsert({name:f,primaryKey:r[m],ref:"".concat(n,".").concat(c,".").concat(_)}),v.push(r[m]),a({name:f,item:r,parentName:n,parentPrimaryKey:c,primaryKey:m,relationalObject:l}))):(u.upsert({name:f,primaryKey:r[m],ref:"".concat(n,".").concat(c,".").concat(_)}),y[n][c][_]=[r[m]],void a({name:f,item:r,parentName:n,parentPrimaryKey:c,primaryKey:m,relationalObject:l}))}u.upsert({name:f,primaryKey:r[m],ref:"".concat(n,".").concat(c,".").concat(_)}),y[n][c][_]=r[m],a({name:f,item:r,parentName:n,parentPrimaryKey:c,primaryKey:m,relationalObject:l})}}r.forEach((function(e){return!!e&&i({item:e})})),null==n||n.forEach((function(e){var r=e[0],n=e[1],t=p[r].__sort,a="".concat(r,"-").concat(n);t&&y[a]&&y[a].sort((function(e,r){var n=e.split("-"),a=n[0],i=n[1],_=r.split("-"),o=_[0],c=_[1];return t(y[a][i],y[o][c])}))})),l.forEach((function(e){return e()}))}null==o||o.forEach((function(e){return p[e.__name]=e}));var h=c((function(e){return a(p,y,e)})),d=c((function(e,n){var t=y[e],i=[];return t?(t.forEach((function(t){var _,o=t.split("-"),c=o[0],s=o[1],f=p[c].__primaryKey,u=n?n[c]:{from:c,fields:"*"};if(!u)throw new Error('selectIndex() expected SelectOptions for "'.concat(c,'" in the index "').concat(e,'".'));var l=a(p,y,r(r({},u),{where:(_={},_[f]=s,_)}));if(l)return(null==u?void 0:u.where)?void(("function"!=typeof(null==u?void 0:u.where)||(null==u?void 0:u.where(l)))&&i.push(l)):i.push(l)})),i):null}));return{save:function(e){e({state:y,references:u.current})},restore:function(e){u.current=e.references,Object.entries(e.state).map((function(e){var r=e[0],n=e[1];return y[r]=n}))},getState:function(){return y},getReferences:function(){return u.current},purge:function(){for(var e in y){if(!Object.prototype.hasOwnProperty.call(y,e))return;delete y[e]}u.current={}},select:h,selectIndex:d,upsert:m,upsertWhere:function(e,n){var t=h(e),a=n(t);if(a)return t?void m(r(r(r({},t),a),{__identify__:e.from})):m(r(r({},a),{__identify__:e.from}))},subscribe:function(e){return l.add(e),function(){return l.delete(e)}},destroy:function(e){delete y[e]}}},exports.withOptions=function(e,r){return Array.isArray(e)?e.map((function(e){return s(e,r)})):s(e,r)};
