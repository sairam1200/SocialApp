import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
	/* config options here */
	images: {
	remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
	  {
		protocol: "https",
		hostname: "res.cloudinary.com",
	  },
      // Add other image hostnames you might use
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },

      // Add more patterns as needed
      // Example for YouTube thumbnails
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      {
        protocol: "https",
        hostname: "scontent.fvga2-1.fna.fbcdn.net",
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
       {
        protocol: 'https',
        hostname: 'scontent.fvga2-2.fna.fbcdn.net',
      }, {
        protocol: 'https',
        hostname: 'scontent.fvga2-6.fna.fbcdn.net',
      },
    ]
},
	turbopack: {
		rules: {
			"*.svg": {
				loaders: ["@svgr/webpack"],
				as: "*.js",
			},
		},
	},
	async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})



export default withBundleAnalyzer(nextConfig);
