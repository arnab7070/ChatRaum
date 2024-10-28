/** @type {import('next').NextConfig} */

import withPWA from 'next-pwa'

const nextConfig = withPWA({
  dest: 'public',                    // Destination for the service worker and assets
  register: true,                     // Automatically registers the service worker
  skipWaiting: true,                  // Skips waiting for the service worker to activate
  disable: process.env.NODE_ENV === 'development',  // Disables PWA in development mode
});

export default nextConfig;

