'use client';

import Script from 'next/script';

import { BENROSO_TAWK } from '@/config/benroso';

/**
 * Tawk.to live-chat widget, loaded on the public site only. Renders nothing when
 * no property id is configured. The widget is forced to the bottom-left so it
 * sits opposite the floating WhatsApp button (bottom-right).
 */
export function TawkChat() {
  const { propertyId, widgetId } = BENROSO_TAWK;

  if (!propertyId || !widgetId) return null;

  return (
    <Script id='tawk-to' strategy='afterInteractive'>
      {`var Tawk_API=Tawk_API||{};Tawk_API.customStyle={visibility:{desktop:{position:'bl',xOffset:20,yOffset:20},mobile:{position:'bl',xOffset:10,yOffset:80}}};var Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/${propertyId}/${widgetId}';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();`}
    </Script>
  );
}
