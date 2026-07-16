import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';

const THEME_VALUES = THEMES.map((theme) => theme.value);

/**
 * Blocking inline script: applies `active_theme` cookie to <html data-theme>
 * before paint so the root layout can stay static (no cookies() on the server).
 */
export function ThemeCookieScript() {
  const allowed = JSON.stringify(THEME_VALUES);
  const fallback = JSON.stringify(DEFAULT_THEME);

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var allowed=${allowed};var fallback=${fallback};var match=document.cookie.match(/(?:^|; )active_theme=([^;]*)/);var value=match?decodeURIComponent(match[1]):'';if(allowed.indexOf(value)===-1)value=fallback;document.documentElement.setAttribute('data-theme',value);}catch(e){}})();`
      }}
    />
  );
}
