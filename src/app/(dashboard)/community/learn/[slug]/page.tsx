import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CourseView } from "@/components/community/CourseView";
import { isSignedIn } from "@/lib/server-session";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const t = await getTranslations("community");
	// The title comes from the slug rather than a fetch: the catalogue is
	// public and cacheable, so a round trip here would cost first paint for
	// something the page itself renders a moment later.
	const readable = slug.replace(/-/g, " ");

	return {
		title: `${readable} — ${t("learnTitle")} · Gaddr`,
		description: t("learnSubtitle"),
		alternates: { canonical: `/community/learn/${slug}` },
		openGraph: {
			type: "article",
			title: `${readable} — ${t("learnTitle")}`,
			description: t("learnSubtitle"),
			url: `/community/learn/${slug}`,
			siteName: "Gaddr",
		},
	};
}

export default async function CoursePage({ params }: PageProps) {
	const { slug } = await params;
	return <CourseView slug={slug} isAuthenticated={await isSignedIn()} />;
}
