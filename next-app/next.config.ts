import type { NextConfig } from 'next';
import { ClientConstants } from './lib/constants.client';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [new URL(`${ClientConstants.BACKEND_URL}/api/uploads/**`)],
  },
};

export default nextConfig;
