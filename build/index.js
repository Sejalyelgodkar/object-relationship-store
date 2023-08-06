"use strict";var e=function(){return e=Object.assign||function(e){for(var r,n=1,a=arguments.length;n<a;n++)for(var t in r=arguments[n])Object.prototype.hasOwnProperty.call(r,t)&&(e[t]=r[t]);return e},e.apply(this,arguments)};function r(e,r,n){return{__name:e.__name,__primaryKey:e.__primaryKey,__has:r,__alias:n}}function n(e,r){for(var n=0,a=Object.entries(e);n<a.length;n++){var t=a[n],i=t[0],o=t[1];if(r[i]!==o)return!1}return!0}function a(e,r,n){var a={};function t(e){e.forEach((function(e){var t=n[e],i=r.__relationship[e];return i?"hasOne"===i.__has?a[e]=t[i.__primaryKey]:void(a[e]=t.map((function(e){return e[i.__primaryKey]}))):a[e]=t}))}return t("*"===e?Object.keys(n):e),a}function t(r,o,c){var _=c.from,s=c.where,y=c.fields,f=c.join;if(Array.isArray(s))return s.flatMap((function(n){return t(r,o,e(e({},c),{where:n}))}));var p=null,u=r[_],l=o[_];if(!l)return null;if("*"===s&&(p=Object.values(l).map((function(e){return a(y,u,e)}))),"object"==typeof s){var m=s[u.__primaryKey];if(m&&(p=a(y,u,l[m])),!m){p=[];for(var h=0,d=Object.entries(l);h<d.length;h++){var v=d[h];v[0],n(s,j=v[1])&&p.push(a(y,u,j))}}}if("function"==typeof s){p=[];for(var O=0,b=Object.entries(l);O<b.length;O++){var j,K=b[O];K[0],s(j=K[1])&&p.push(a(y,u,j))}}if(p&&f){var w=Array.isArray(p);w&&p.forEach((function(e){i(e,{join:f,from:_,model:r,state:o})})),w||i(p,{join:f,from:_,model:r,state:o})}return p}function i(e,r){var n=r.join,a=r.from,o=r.model,c=r.state,_=o[a];n.forEach((function(r){var n,s=r.on,y=r.fields,f=r.join;if(e[s]){if(!_.__relationship[s])throw new Error('Field "'.concat(s,'" does not exist in object "').concat(a,'"'));if("hasOne"===_.__relationship[s].__has&&(e[s]=t(o,c,{fields:y,from:_.__relationship[s].__name,where:(n={},n[_.__relationship[s].__primaryKey]=e[s],n)})),"hasMany"===_.__relationship[s].__has){var p=[];e[s].forEach((function(e){var r,n=t(o,c,{fields:y,from:_.__relationship[s].__name,where:(r={},r[_.__relationship[s].__primaryKey]=e,r)});n&&p.push(n)})),e[s]=p}f&&("hasOne"===_.__relationship[s].__has&&i(e[s],{from:_.__relationship[s].__name,join:f,model:o,state:c}),"hasMany"===_.__relationship[s].__has&&e[s].forEach((function(e){i(e,{from:_.__relationship[s].__name,join:f,model:o,state:c})})))}}))}function o(e){var r={};return function(){for(var n=[],a=0;a<arguments.length;a++)n[a]=arguments[a];var t=JSON.stringify(n),i=e.apply(void 0,n);return r[t]&&JSON.stringify(r[t])===JSON.stringify(i)?r[t]:(r[t]=i,i)}}"function"==typeof SuppressedError&&SuppressedError,exports.createRelationalObject=function(n,a,t){var i,o=e(e({},a),{__name:n,__primaryKey:null!==(i=null==t?void 0:t.primaryKey)&&void 0!==i?i:"id",__relationship:{}});return Object.setPrototypeOf(o,{hasOne:function(e,n){var a=this,t=null!=n?n:e.__name,i=Object.entries(a.__relationship).find((function(r){return r[0],r[1].__name===e.__name}));if(i&&a.__relationship[i[0]].__primaryKey===e.__primaryKey&&e.__primaryKey===a.__name)throw new Error('"'.concat(e.__name,'" reference already exists in "').concat(a.__name,'" as "').concat(i[0],'" with the primary key (pk) "').concat(e.__primaryKey,'". "').concat(a.__name,'" table failed to create a hasOne relationship with "').concat(t,'" because it has the same primary key "').concat(e.__primaryKey,'" as "').concat(i[0],'". The primary key for "').concat(i[0],'" and "').concat(t,'" are not unique.'));return a[t]="hasOne",a.__relationship[t]=r(e,"hasOne",t),this},hasMany:function(e,n){var a=this,t=null!=n?n:e.__name,i=Object.entries(a.__relationship).find((function(r){return r[0],r[1].__name===e.__name}));if(i&&a.__relationship[i[0]].__primaryKey===e.__primaryKey&&e.__primaryKey===a.__name)throw new Error('"'.concat(e.__name,'" reference already exists in "').concat(a.__name,'" as "').concat(i[0],'" with the primary key (pk) "').concat(e.__primaryKey,'". "').concat(a.__name,'" table failed to create a hasOne relationship with "').concat(t,'" because it has the same primary key "').concat(e.__primaryKey,'" as "').concat(i[0],'". The primary key for "').concat(i[0],'" and "').concat(t,'" are not unique.'));return a[t]="hasMany",a.__relationship[t]=r(e,"hasMany",t),this}}),o},exports.createRelationalObjectIndex=function(e,r){return{__name:e,__objects:r.map((function(e){return e.__name}))}},exports.createStore=function(r){var n=r.relationalCreators,a=r.indexes,i=r.identifier,c={},_=new Set,s=n.reduce((function(r,n){var a,t,i;n.hasOne,n.hasMany;var o=function(e,r){var n={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&r.indexOf(a)<0&&(n[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var t=0;for(a=Object.getOwnPropertySymbols(e);t<a.length;t++)r.indexOf(a[t])<0&&Object.prototype.propertyIsEnumerable.call(e,a[t])&&(n[a[t]]=e[a[t]])}return n}(n,["hasOne","hasMany"]);if(!o[null!==(i=null===(t=o.__relationship[o.__primaryKey])||void 0===t?void 0:t.__name)&&void 0!==i?i:o.__primaryKey])throw new Error('The table "'.concat(o.__name,'" does not have a primary key (pk) "').concat(n.__primaryKey,'", pk should be listed here ').concat(JSON.stringify(n)));return e(e({},r),((a={})[o.__name]=o,a))}),{});null==a||a.forEach((function(e){return s[e.__name]=e}));var y=o((function(e){return t(s,c,e)})),f=o((function(r,n){var a=c[r],i=[];return a?(a.index.forEach((function(o){var _,y=a.objects[o],f=n?n[y.name]:{from:y.name,fields:"*"};if(!f)throw new Error('selectIndex() expected SelectOptions for "'.concat(y.name,'" in the index "').concat(r,'".'));var p=t(s,c,e(e({},f),{where:(_={},_[y.primaryKey]=y.primaryKeyValue,_)}));if(p)return(null==f?void 0:f.where)?void((null==f?void 0:f.where(p))&&i.push(p)):i.push(p)})),i):null}));return{getState:function(){return c},select:y,selectIndex:f,upsert:function(e,r){var n,a=Array.isArray(e)?e:[e],t=(null!==(n=null==r?void 0:r.indexes)&&void 0!==n?n:[]).map((function(e){return s[e]}));function o(e){var r=e.name,n=e.item,a=e.parentName,t=e.primaryKey,i=e.parentPrimaryKey,o=e.relationalObject,_=Object.values(o.__relationship).find((function(e){return e.__name===a}));if(_&&("hasOne"===_.__has&&(c[r][n[t]][_.__alias]=c[a][i]),"hasMany"===_.__has)){var s=c[r][n[t]][_.__alias],y=c[a][i],f=Array.isArray(s);if(f||(c[r][n[t]][_.__alias]=[y]),f)!!s.find((function(e){return e[t]===y[t]}))||s.push(y)}}function y(e){var r=e.item,n=e.parentName,a=e.parentField,_=e.parentFieldHasMany,f=e.parentPrimaryKey,p=function(e){for(var r in i)if(Object.prototype.hasOwnProperty.call(i,r)&&(0,i[r])(e))return r;throw new Error("Identifier was not able to identify this object ".concat(JSON.stringify(e)))}(r),u=s[p],l=u.__primaryKey;if(!r[l])throw new Error('Expected object "'.concat(p,'" to have a primaryKey "').concat(l,'".'));if(c[p]||(c[p]={}),c[p][r[l]]||(c[p][r[l]]={}),t.forEach((function(e){if(e.__objects.includes(p)){c[e.__name]||(c[e.__name]={index:[],objects:{}});var n="".concat(p,"-").concat(r[l]);c[e.__name].objects[n]||(c[e.__name].index.push(n),c[e.__name].objects[n]={name:p,primaryKey:l,primaryKeyValue:r[l]})}})),Object.entries(r).forEach((function(e){var n=e[0],a=e[1];if(u.__relationship[n])return"hasMany"===u[n]?void r[n].forEach((function(e){y({item:e,parentPrimaryKey:r[l],parentField:n,parentName:p,parentFieldHasMany:!0})})):void y({item:r[n],parentPrimaryKey:r[l],parentField:n,parentName:p});c[p][r[l]][n]=a})),n&&a&&f){if(_){var m=c[n][f][a],h=c[p][r[l]];return Array.isArray(m)?void(!!m.find((function(e){return e[l]===h[l]}))||(m.push(h),o({name:p,item:r,parentName:n,parentPrimaryKey:f,primaryKey:l,relationalObject:u}))):(c[n][f][a]=[h],void o({name:p,item:r,parentName:n,parentPrimaryKey:f,primaryKey:l,relationalObject:u}))}o({name:p,item:r,parentName:n,parentPrimaryKey:f,primaryKey:l,relationalObject:u}),c[n][f][a]=c[p][r[l]]}}a.forEach((function(e){return y({item:e})})),_.forEach((function(e){return e()}))},subscribe:function(e){return _.add(e),function(){return _.delete(e)}}}};
//# sourceMappingURL=index.js.map
