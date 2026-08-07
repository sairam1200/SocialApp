import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer'
import createNextIntlPlugin from 'next-intl/plugin'

// Points next-intl at src/i18n/request.ts, which resolves the active locale and
// loads its message catalog. See docs/i18n/README.md.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
	/* config options here */
   allowedDevOrigins: [
    "almost-backtrack-drapery.ngrok-free.dev",
  ],
	images: {
		formats: ['image/avif', 'image/webp'],
	 minimumCacheTTL: 60 * 60 * 24 * 30,
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
        hostname: 'i9.ytimg.com',
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
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "*.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "**.fna.fbcdn.net",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "video.twimg.com",
      },
      {
        protocol: "https",
        hostname: "p16-amd-va.tiktokcdn.com",
      },
      {
        protocol: "https",
        hostname: "p19-sign.tiktokcdn.com",
      },
      {
        protocol: "https",
        hostname: "p16-sign.tiktokcdn.com",
      },
      {
        protocol: "https",
        hostname: "*.tiktokcdn.com",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "*.scdn.co",
      },
      {
        protocol: "https",
        hostname: "preview.redd.it",
      },
      {
        protocol: "https",
        hostname: "i.redd.it",
      },
      {
        protocol: "https",
        hostname: "external-preview.redd.it",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
      {
        protocol: "https",
        hostname: "media.tenor.com",
      },
      {
        protocol: "https",
        hostname: "**.giphy.com",
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
  async rewrites() {
    const backendUrl = process.env.AUTH_API_URL || "http://localhost:8080";
    return {
      // Keep Socket.IO polling on the same-origin API proxy. WebSocket
      // upgrades must use NEXT_PUBLIC_WEBSOCKET_URL and connect directly to a
      // backend origin that supports upgrades; Vercel's external rewrite is
      // not used for that transport.
      beforeFiles: [
        {
          source: "/socket.io",
          destination: `${backendUrl}/socket.io/`,
        },
        {
          source: "/socket.io/:path*",
          destination: `${backendUrl}/socket.io/:path*`,
        },
      ],
      afterFiles: [
        {
          source: "/api/v1/:path*",
          destination: `${backendUrl}/api/v1/:path*`,
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})



export default withNextIntl(withBundleAnalyzer(nextConfig));
