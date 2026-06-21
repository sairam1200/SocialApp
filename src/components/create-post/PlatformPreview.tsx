import {FacebookPreview,InstagramPreview,LinkedInPreview,TwitterPreview ,YoutubePreview ,RedditPreview, PinterestPreview
} from "./previews/index";
import {PlatformPreviewProps} from "../create-post/previews/types";

export default function PlatformPreview({
    platform,
    values,
    media,
    profiles
}: PlatformPreviewProps) {
    switch (platform) {
        case "instagram":
            return <InstagramPreview values={values} media={media} profile={profiles?.instagram} />;

        case "facebook":
            return <FacebookPreview values={values} media={media} profile={profiles?.facebook}/>;

        case "youtube":
            return <YoutubePreview values={values} media={media} profile={profiles?.youtube}/>;

        case "linkedin":
            return <LinkedInPreview values={values} media={media} />;

        case "twitter":
            return <TwitterPreview values={values} media={media} />;

        case "reddit":
            return <RedditPreview values={values} media={media} />;

        case "pinterest":
            return <PinterestPreview values={values} media={media} profile={profiles?.pinterest}/>;

        default:
            return <InstagramPreview values={values} media={media} />;
    }
}