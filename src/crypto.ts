const enc = new TextEncoder();
const dec = new TextDecoder();
export async function createRoomKey() { return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt','decrypt']); }
export async function exportKey(key: CryptoKey) { return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.exportKey('raw', key)))); }
export async function importKey(value: string) { return crypto.subtle.importKey('raw', Uint8Array.from(atob(value), c => c.charCodeAt(0)), 'AES-GCM', true, ['encrypt','decrypt']); }
export async function encryptText(text: string, key: CryptoKey) { const iv=crypto.getRandomValues(new Uint8Array(12)); const data=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(text)); return { ciphertext:btoa(String.fromCharCode(...new Uint8Array(data))), iv:btoa(String.fromCharCode(...iv)), algorithm:'AES-GCM' as const }; }
export async function decryptText(payload:{ciphertext:string;iv:string}, key:CryptoKey) { const data=Uint8Array.from(atob(payload.ciphertext),c=>c.charCodeAt(0)); const iv=Uint8Array.from(atob(payload.iv),c=>c.charCodeAt(0)); return dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,data)); }
