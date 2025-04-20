import type { NextConfig } from 'next';
import { clientConfig } from './lib/constants.client';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL(`${clientConfig.backendUrl}/uploads/**`)],
  },
};

export default nextConfig;
