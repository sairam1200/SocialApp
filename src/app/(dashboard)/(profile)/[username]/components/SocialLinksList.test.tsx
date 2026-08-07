import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SocialLinksList from "./SocialLinksList";

describe("SocialLinksList", () => {
	it("renders each authoritative account independently without fabricated rows", () => {
		render(
			<SocialLinksList
				accounts={[
					{
						id: "youtube-1",
						platform: "youtube",
						username: "real-channel",
						profileImage: "",
						externalId: "channel-1",
						externalUrl: "https://youtube.test/channel-1",
						followersCount: 1200,
						followingCount: 5,
						isVerified: false,
						isImported: true,
					},
				]}
			/>,
		);

		expect(screen.getByText("@real-channel")).toBeInTheDocument();
		expect(screen.getByText("Imported")).toBeInTheDocument();
		expect(screen.queryByText("Instagram_User_Name")).not.toBeInTheDocument();
		expect(screen.queryByText("Verified")).not.toBeInTheDocument();
	});

	it("shows an explicit empty state", () => {
		render(<SocialLinksList accounts={[]} />);
		expect(screen.getByText("No connected platforms")).toBeInTheDocument();
	});
});
