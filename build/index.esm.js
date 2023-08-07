var e=function(){return e=Object.assign||function(e){for(var r,n=1,a=arguments.length;n<a;n++)for(var t in r=arguments[n])Object.prototype.hasOwnProperty.call(r,t)&&(e[t]=r[t]);return e},e.apply(this,arguments)};function r(e,r,n){return{__name:e.__name,__primaryKey:e.__primaryKey,__has:r,__alias:n}}function n(n,a,t){var i,o=e(e({},a),{__name:n,__primaryKey:null!==(i=null==t?void 0:t.primaryKey)&&void 0!==i?i:"id",__relationship:{}});return Object.setPrototypeOf(o,{hasOne:function(e,n){var a=this,t=null!=n?n:e.__name,i=Object.entries(a.__relationship).find((function(r){return r[0],r[1].__name===e.__name}));if(i&&a.__relationship[i[0]].__primaryKey===e.__primaryKey&&e.__primaryKey===a.__name)throw new Error('"'.concat(e.__name,'" reference already exists in "').concat(a.__name,'" as "').concat(i[0],'" with the primary key (pk) "').concat(e.__primaryKey,'". "').concat(a.__name,'" table failed to create a hasOne relationship with "').concat(t,'" because it has the same primary key "').concat(e.__primaryKey,'" as "').concat(i[0],'". The primary key for "').concat(i[0],'" and "').concat(t,'" are not unique.'));return a[t]="hasOne",a.__relationship[t]=r(e,"hasOne",t),this},hasMany:function(e,n){var a=this,t=null!=n?n:e.__name,i=Object.entries(a.__relationship).find((function(r){return r[0],r[1].__name===e.__name}));if(i&&a.__relationship[i[0]].__primaryKey===e.__primaryKey&&e.__primaryKey===a.__name)throw new Error('"'.concat(e.__name,'" reference already exists in "').concat(a.__name,'" as "').concat(i[0],'" with the primary key (pk) "').concat(e.__primaryKey,'". "').concat(a.__name,'" table failed to create a hasOne relationship with "').concat(t,'" because it has the same primary key "').concat(e.__primaryKey,'" as "').concat(i[0],'". The primary key for "').concat(i[0],'" and "').concat(t,'" are not unique.'));return a[t]="hasMany",a.__relationship[t]=r(e,"hasMany",t),this}}),o}function a(e,r,n){return{__name:e,__objects:r.map((function(e){return e.__name})),__sort:null!=n?n:null}}function t(e,r){for(var n=0,a=Object.entries(e);n<a.length;n++){var t=a[n],i=t[0],o=t[1];if(r[i]!==o)return!1}return!0}function i(e,r,n){var a={};function t(e){e.forEach((function(e){var t=n[e],i=r.__relationship[e];return i?"hasOne"===i.__has?a[e]=t[i.__primaryKey]:void(a[e]=t.map((function(e){return e[i.__primaryKey]}))):a[e]=t}))}return t("*"===e?Object.keys(n):e),a}function o(r,n,a){var _=a.from,s=a.where,y=a.fields,f=a.join;if(Array.isArray(s))return s.flatMap((function(t){return o(r,n,e(e({},a),{where:t}))}));var u=null,l=r[_],p=n[_];if(!p)return null;if("*"===s&&(u=Object.values(p).map((function(e){return i(y,l,e)}))),"object"==typeof s){var m=s[l.__primaryKey];if(m&&(u=i(y,l,p[m])),!m){u=[];for(var h=0,d=Object.entries(p);h<d.length;h++){var v=d[h];v[0],t(s,j=v[1])&&u.push(i(y,l,j))}}}if("function"==typeof s){u=[];for(var b=0,O=Object.entries(p);b<O.length;b++){var j,K=O[b];K[0],s(j=K[1])&&u.push(i(y,l,j))}}if(u&&f){var w=Array.isArray(u);w&&u.forEach((function(e){c(e,{join:f,from:_,model:r,state:n})})),w||c(u,{join:f,from:_,model:r,state:n})}return u}function c(e,r){var n=r.join,a=r.from,t=r.model,i=r.state,_=t[a];n.forEach((function(r){var n,s=r.on,y=r.fields,f=r.join;if(e[s]){if(!_.__relationship[s])throw new Error('Field "'.concat(s,'" does not exist in object "').concat(a,'"'));if("hasOne"===_.__relationship[s].__has&&(e[s]=o(t,i,{fields:y,from:_.__relationship[s].__name,where:(n={},n[_.__relationship[s].__primaryKey]=e[s],n)})),"hasMany"===_.__relationship[s].__has){var u=[];e[s].forEach((function(e){var r,n=o(t,i,{fields:y,from:_.__relationship[s].__name,where:(r={},r[_.__relationship[s].__primaryKey]=e,r)});n&&u.push(n)})),e[s]=u}f&&("hasOne"===_.__relationship[s].__has&&c(e[s],{from:_.__relationship[s].__name,join:f,model:t,state:i}),"hasMany"===_.__relationship[s].__has&&e[s].forEach((function(e){c(e,{from:_.__relationship[s].__name,join:f,model:t,state:i})})))}}))}function _(e,r){if(e===r)return!0;if("object"!=typeof e||"object"!=typeof r||null===e||null===r)return!1;var n=Object.keys(e),a=Object.keys(r);if(n.length!==a.length)return!1;for(var t=0,i=n;t<i.length;t++){var o=i[t];if(!a.includes(o)||!_(e[o],r[o]))return!1}return!0}function s(e){var r={};return function(){for(var n=[],a=0;a<arguments.length;a++)n[a]=arguments[a];var t=JSON.stringify(n),i=e.apply(void 0,n);return r[t]&&_(r[t],i)?r[t]:(r[t]=i,i)}}function y(r){var n=r.relationalCreators,a=r.indexes,t=r.identifier,i={},c=new Set,_=n.reduce((function(r,n){var a,t,i;n.hasOne,n.hasMany;var o=function(e,r){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&r.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var t=0;for(a=Object.getOwnPropertySymbols(e);t<a.length;t++)r.indexOf(a[t])<0&&Object.prototype.propertyIsEnumerable.call(e,a[t])&&(n[a[t]]=e[a[t]])}return n}(n,["hasOne","hasMany"]);if(!o[null!==(i=null===(t=o.__relationship[o.__primaryKey])||void 0===t?void 0:t.__name)&&void 0!==i?i:o.__primaryKey])throw new Error('The table "'.concat(o.__name,'" does not have a primary key (pk) "').concat(n.__primaryKey,'", pk should be listed here ').concat(JSON.stringify(n)));return e(e({},r),((a={})[o.__name]=o,a))}),{});null==a||a.forEach((function(e){return _[e.__name]=e}));var y=s((function(e){return o(_,i,e)})),f=s((function(r,n){var a=i[r],t=[];return a?(a.index.forEach((function(c){var s,y=a.objects[c],f=n?n[y.name]:{from:y.name,fields:"*"};if(!f)throw new Error('selectIndex() expected SelectOptions for "'.concat(y.name,'" in the index "').concat(r,'".'));var u=o(_,i,e(e({},f),{where:(s={},s[y.primaryKey]=y.primaryKeyValue,s)}));if(u)return(null==f?void 0:f.where)?void((null==f?void 0:f.where(u))&&t.push(u)):t.push(u)})),t):null}));return{getState:function(){return i},purge:function(){for(var e in i){if(!Object.prototype.hasOwnProperty.call(i,e))return;delete i[e]}},select:y,selectIndex:f,upsert:function(e,r){var n,a=Array.isArray(e)?e:[e],o=(null!==(n=null==r?void 0:r.indexes)&&void 0!==n?n:[]).map((function(e){return{model:_[e.index],key:e.key}}));function s(e){var r=e.name,n=e.item,a=e.parentName,t=e.primaryKey,o=e.parentPrimaryKey,c=e.relationalObject,_=Object.values(c.__relationship).find((function(e){return e.__name===a}));if(_&&("hasOne"===_.__has&&(i[r][n[t]][_.__alias]=i[a][o]),"hasMany"===_.__has)){var s=i[r][n[t]][_.__alias],y=i[a][o],f=Array.isArray(s);if(f||(i[r][n[t]][_.__alias]=[y]),f)!!s.find((function(e){return e[t]===y[t]}))||s.push(y)}}function y(e){var r=e.item,n=e.parentName,a=e.parentField,c=e.parentFieldHasMany,f=e.parentPrimaryKey,u=function(e){if(e.__indentify__)return e.__indentify__;for(var r in t)if(Object.prototype.hasOwnProperty.call(t,r)&&(0,t[r])(e))return r;throw new Error("Identifier was not able to identify this object ".concat(JSON.stringify(e)))}(r),l=_[u],p=l.__primaryKey;if(!r[p])throw new Error('Expected object "'.concat(u,'" to have a primaryKey "').concat(p,'".'));if(i[u]||(i[u]={}),i[u][r[p]]||(i[u][r[p]]={}),n||o.forEach((function(e){var n=e.model,a=e.key;if(n.__objects.includes(u)){var t="".concat(n.__name,"-").concat(a);i[t]||(i[t]={index:[],objects:{}});var o="".concat(u,"-").concat(r[p]);i[t].objects[o]||(i[t].index.push(o),i[t].objects[o]={name:u,primaryKey:p,primaryKeyValue:r[p]})}})),Object.entries(r).forEach((function(e){var n=e[0],a=e[1];if(l.__relationship[n])return"hasMany"===l[n]?void r[n].forEach((function(e){y({item:e,parentPrimaryKey:r[p],parentField:n,parentName:u,parentFieldHasMany:!0})})):void y({item:r[n],parentPrimaryKey:r[p],parentField:n,parentName:u});i[u][r[p]][n]=a})),n&&a&&f){if(c){var m=i[n][f][a],h=i[u][r[p]];return Array.isArray(m)?void(!!m.find((function(e){return e[p]===h[p]}))||(m.push(h),s({name:u,item:r,parentName:n,parentPrimaryKey:f,primaryKey:p,relationalObject:l}))):(i[n][f][a]=[h],void s({name:u,item:r,parentName:n,parentPrimaryKey:f,primaryKey:p,relationalObject:l}))}s({name:u,item:r,parentName:n,parentPrimaryKey:f,primaryKey:p,relationalObject:l}),i[n][f][a]=i[u][r[p]]}}a.forEach((function(e){return y({item:e})})),o.forEach((function(e){var r=e.model,n=e.key,a=r.__sort;if(a){var t="".concat(r.__name,"-").concat(n);i[t].index.sort((function(e,r){var n=i[t].objects[e],o=i[t].objects[r];return a(i[n.name][n.primaryKeyValue],i[o.name][o.primaryKeyValue])}))}})),c.forEach((function(e){return e()}))},subscribe:function(e){return c.add(e),function(){return c.delete(e)}}}}"function"==typeof SuppressedError&&SuppressedError;export{n as createRelationalObject,a as createRelationalObjectIndex,y as createStore};
//# sourceMappingURL=index.esm.js.map
