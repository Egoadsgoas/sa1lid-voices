import { describe, expect, it } from 'vitest';
import { safeTheme, themes } from './themes';
describe('theme manifest sanitizer',()=>{
 it('keeps a bundled theme',()=>expect(safeTheme(themes[2]).effect).toBe('sakura'));
 it('rejects executable wallpaper URLs',()=>expect(safeTheme({wallpaper:'javascript:alert(1)'}).wallpaper).toBeUndefined());
 it('clamps expensive visual values',()=>{const t=safeTheme({blur:999,radius:-4});expect(t.blur).toBe(40);expect(t.radius).toBe(0)});
});
