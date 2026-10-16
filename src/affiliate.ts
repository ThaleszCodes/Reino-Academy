// Cakto's public checkout uses ?affiliate=<code>. This only forwards attribution;
// approval and commission rules remain entirely in Cakto.
const key='ra_checkout_attribution';
const fields=['affiliate','utm_source','utm_medium','utm_campaign','utm_term','utm_content','src','sck'] as const;
let attribution:Record<string,string>={};
export function captureAttribution(search:string){
 try{const saved=JSON.parse(sessionStorage.getItem(key)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))for(const name of fields)if(typeof saved[name]==='string'&&saved[name].length<=255)attribution[name]=saved[name];}catch{/* Storage can be unavailable in private browsers. */}
 const query=new URLSearchParams(search);
 // A new explicit affiliate replaces the previous referral and its campaign tags.
 if(query.has('affiliate'))attribution={};
 for(const name of fields){const value=query.get(name);if(value&&value.length<=255&&!/[\u0000-\u001f\u007f]/.test(value))attribution[name]=value;}
 try{sessionStorage.setItem(key,JSON.stringify(attribution));}catch{/* In-memory fallback still forwards this visit. */}
}
export function checkoutWithAttribution(href:string){
 try{const url=new URL(href);if(url.protocol!=='https:'||url.hostname!=='pay.cakto.com.br')return href;for(const name of fields)if(attribution[name])url.searchParams.set(name,attribution[name]);return url.toString();}catch{return href;}
}
