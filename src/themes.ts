export type Effect = 'none'|'sakura'|'snow'|'stars';
export type Theme = { id:string; name:string; accent:string; accent2:string; bg:string; panel:string; text:string; blur:number; radius:number; effect:Effect; wallpaper?:string; wallpaperFit:'cover'|'contain'|'fill'|'repeat' };
export const themes:Theme[] = [
 {id:'liquid',name:'Liquid Glass',accent:'#8b7cff',accent2:'#55d8ff',bg:'#080b14',panel:'rgba(20,23,38,.62)',text:'#f7f8ff',blur:26,radius:20,effect:'stars',wallpaperFit:'cover'},
 {id:'midnight',name:'Midnight',accent:'#6574ff',accent2:'#b369ff',bg:'#060713',panel:'rgba(13,15,27,.88)',text:'#f5f6ff',blur:18,radius:16,effect:'none',wallpaperFit:'cover'},
 {id:'sakura',name:'Sakura',accent:'#ff75b5',accent2:'#ffc1dc',bg:'#190d18',panel:'rgba(43,21,38,.65)',text:'#fff8fc',blur:24,radius:24,effect:'sakura',wallpaperFit:'cover'},
 {id:'anime',name:'Anime Neon',accent:'#ed63ff',accent2:'#62eaff',bg:'#0d081c',panel:'rgba(23,13,43,.7)',text:'#fff',blur:20,radius:18,effect:'stars',wallpaperFit:'cover'},
 {id:'aurora',name:'Aurora',accent:'#5fffc1',accent2:'#5b8cff',bg:'#041313',panel:'rgba(7,32,31,.65)',text:'#f3fffc',blur:28,radius:22,effect:'stars',wallpaperFit:'cover'},
 {id:'cyber',name:'Cyber',accent:'#00ffd5',accent2:'#ff3ee5',bg:'#05070b',panel:'rgba(8,13,18,.82)',text:'#ebfffb',blur:10,radius:8,effect:'none',wallpaperFit:'cover'},
 {id:'oled',name:'OLED Black',accent:'#7f6cff',accent2:'#39dfff',bg:'#000',panel:'rgba(8,8,8,.94)',text:'#fff',blur:0,radius:14,effect:'none',wallpaperFit:'cover'},
 {id:'snow',name:'Snow',accent:'#75a7ff',accent2:'#bfe9ff',bg:'#e9f3ff',panel:'rgba(255,255,255,.62)',text:'#12213a',blur:30,radius:24,effect:'snow',wallpaperFit:'cover'},
 {id:'light',name:'Minimal Light',accent:'#6572e8',accent2:'#70b8ff',bg:'#edf0f7',panel:'rgba(255,255,255,.82)',text:'#1b2030',blur:18,radius:16,effect:'none',wallpaperFit:'cover'}
];
export function safeTheme(input:unknown):Theme { const x=input as Partial<Theme>; const base=themes[0]; const color=(v:unknown,d:string)=>typeof v==='string'&&/^(#[0-9a-f]{3,8}|rgba?\([\d., %]+\))$/i.test(v)?v:d; return {...base,id:'custom',name:String(x?.name||'Моя тема').slice(0,32),accent:color(x?.accent,base.accent),accent2:color(x?.accent2,base.accent2),bg:color(x?.bg,base.bg),panel:color(x?.panel,base.panel),text:color(x?.text,base.text),blur:Math.max(0,Math.min(40,Number(x?.blur)||base.blur)),radius:Math.max(0,Math.min(32,Number(x?.radius)||base.radius)),effect:['none','sakura','snow','stars'].includes(String(x?.effect))?x.effect as Effect:'none',wallpaper:typeof x?.wallpaper==='string'&&/^(https?:|data:image\/)/.test(x.wallpaper)?x.wallpaper.slice(0,2000000):undefined,wallpaperFit:['cover','contain','fill','repeat'].includes(String(x?.wallpaperFit))?x.wallpaperFit!:'cover'}; }
