import {
  resolveSearchContentWithTrace,
  SearchContentInput,
} from "../src/lib/resolvers/search-content.resolver";

interface Fixture {
  name: string;
  input: SearchContentInput;
}

const FIELDS = [
  "title",
  "description",
  "thumbnailUrl",
  "displayName",
  "handle",
  "profileImage",
  "verified",
  "publishedAt",
  "viewCount",
  "likeCount",
  "commentCount",
  "shareCount",
  "sourceUrl",
  "platform",
] as const;

const fixtures: Fixture[] = [
  {
    name: "YouTube",
    input: {
      title: "YouTube Video",
      platform: "youtube",
      platformMetadata: {
        description: "YouTube video description",
        thumbnailUrl: "https://i.ytimg.com/vi/abc/maxresdefault.jpg",
        channelTitle: "Gaddr Channel",
        channelUsername: "@gaddr",
        channelProfileImage: "https://yt3.ggpht.com/channel-avatar.png",
        youtubeUrl: "https://www.youtube.com/watch?v=abc",
        channelUrl: "https://www.youtube.com/@gaddr",
        publishedAt: "2026-01-10T10:00:00.000Z",
        viewCount: 1200,
        likeCount: 340,
        commentCount: 45,
      },
    },
  },
  {
    name: "Facebook",
    input: {
      title: "Facebook Post",
      platform: "facebook",
      platformMetadata: {
        message: "Facebook post message",
        imageUrl: "https://scontent.xx/fb-image.jpg",
        permalink: "https://www.facebook.com/gaddr/posts/123",
        createdTime: "2026-02-01T08:00:00.000Z",
        analytics: { reactions: 210, comments: 33, shares: 12 },
      },
    },
  },
  {
    name: "Instagram",
    input: {
      title: "Instagram Reel",
      platform: "instagram",
      platformMetadata: {
        caption: "Instagram caption",
        thumbnailUrl: "https://scontent.xx/ig-thumb.jpg",
        mediaUrl: "https://scontent.xx/ig-media.mp4",
        permalink: "https://www.instagram.com/p/abc/",
        timestamp: "2026-03-01T09:00:00.000Z",
        likeCount: 500,
        commentsCount: 41,
        username: "gaddr.creators",
        profileImage: "https://scontent.xx/ig-avatar.jpg",
      },
    },
  },
  {
    name: "Pinterest",
    input: {
      title: "Pinterest Pin",
      platform: "pinterest",
      platformMetadata: {
        description: "Pin description",
        imageUrl: "https://i.pinimg.com/pin.jpg",
        link: "https://www.pinterest.com/pin/123/",
        createdAt: "2026-04-02T11:00:00.000Z",
        analytics: { impressions: 8000, saves: 95, outboundClicks: 12 },
      },
    },
  },
];

for (const fixture of fixtures) {
  const { model, trace } = resolveSearchContentWithTrace(fixture.input);
  console.log(`\n## ${fixture.name}`);
  for (const field of FIELDS) {
    const value = model[field];
    const label = trace[field] ?? "";
    const rendered =
      value === undefined || value === null
        ? "—"
        : typeof value === "string"
          ? value
          : JSON.stringify(value);
    console.log(`- ${field}: ${label}  =>  ${rendered}`);
  }
}
