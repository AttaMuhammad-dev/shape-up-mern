export function invalid(message) { const error = new Error(message); error.status = 400; throw error; }
export function text(value, label, min=1, max=1000) {
  if(typeof value!=='string'||value.trim().length<min||value.trim().length>max) invalid(`${label} must be ${min}–${max} characters.`);
  return value.trim();
}
export function email(value) {
  const result=text(value,'Email',3,254).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)||/[\r\n\0]/.test(result))invalid('Enter a valid email address.');
  return result;
}
export function password(value, fresh=false) {
  if(typeof value!=='string'||!value.length||Buffer.byteLength(value,'utf8')>72||(fresh&&value.length<8)) invalid(fresh?'Use a password of at least 8 characters and at most 72 UTF-8 bytes.':'Enter a valid password.');
  return value;
}
export function number(value,label,min=0,max=100000,integer=false) {
  if(!['string','number'].includes(typeof value)||value===''||!Number.isFinite(Number(value))||Number(value)<min||Number(value)>max||(integer&&!Number.isInteger(Number(value))))invalid(`Enter a valid ${label}.`);
  return Number(value);
}
export function day(value) {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value) invalid('Enter a valid date (YYYY-MM-DD).');
  return value;
}
export function dayRange(value) { const start=new Date(day(value)+'T00:00:00Z');return {$gte:start,$lt:new Date(start.getTime()+86400000)}; }
export function choice(value,options,label) { if(!options.includes(value))invalid(`Select a valid ${label}.`);return value; }
