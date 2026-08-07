import { createServer, type Server } from "node:http";
import { expect, test } from "@playwright/test";

const PERSONALIZED_QUERY = "Indian Music";
let authServer: Server;

test.beforeAll(async () => {
  authServer = createServer((request, response) => {
    if (request.url === "/api/v1/auth/current") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          id: "owner-1",
          email: "owner@gaddr.local",
          firstName: "Test",
          lastName: "Owner",
          fullName: "Test Owner",
          username: "test-owner",
          userType: "User",
          roles: [],
          permissions: [],
          onboardingStep: "Completed",
          onboardingCompleted: true,
        }),
      );
      return;
    }

    response.writeHead(404);
    response.end();
  });

  await new Promise<void>((resolve, reject) => {
    authServer.once("error", reject);
    authServer.listen(8080, resolve);
  });
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    authServer.close((error) => (error ? reject(error) : resolve()));
  });
});

test("shows the authenticated owner's personalized Trending Search ordering", async ({
  page,
}) => {
  let personalizedRequests = 0;
  let globalRequests = 0;

  await page.route(
    (url) => url.pathname.endsWith("/search/trending/personalized"),
    async (route) => {
      personalizedRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          generatedAt: "2026-08-04T18:30:00.000Z",
          stale: false,
          windowHours: 48,
          refreshIntervalSeconds: 300,
          personalization: {
            mode: "personalized",
            interestTopicCount: 1,
            location: { countryCode: "IN", regionCode: "TN" },
          },
          items: [
            {
              rank: 1,
              query: PERSONALIZED_QUERY,
              normalizedQuery: "indian music",
              score: 7.12,
              searchCount: 5,
              uniqueSearchers: 4,
              lastSearchedAt: "2026-08-04T18:29:00.000Z",
              reasonCodes: [
                "global-trending",
                "matches-your-interests",
                "trending-in-your-country",
              ],
            },
          ],
        }),
      });
    },
  );

  await page.route(
    (url) => url.pathname.endsWith("/search/trending"),
    async (route) => {
      globalRequests += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [] }),
      });
    },
  );

  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  ).toString("base64url");
  await page.context().addCookies([
    {
      name: "access_token",
      value: `e30.${payload}.test-signature`,
      url: "http://localhost:3210",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/discover");

  await expect(
    page
      .getByText(PERSONALIZED_QUERY, { exact: true })
      .filter({ visible: true })
      .first(),
  ).toBeVisible({ timeout: 30_000 });
  await expect.poll(() => personalizedRequests).toBe(1);
  expect(globalRequests).toBe(0);
});
