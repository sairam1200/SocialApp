import { MediaFile } from "@/types/media.types";
import { PlatformId } from "@/constants/platforms";

export type PreviewValues = {
  caption: string;
  mediaFiles: MediaFile[];
  tags: string[];
  postType?: string;
};

export type PreviewProps = {
  values: PreviewValues;
  media?: MediaFile;
  profile?: {
    name: string;
    profileImage: string;
  };
};
export type PlatformPreviewProps = {
    platform: PlatformId;
    values: PreviewValues;
    media?: MediaFile;
    profiles?:PreviewProfiles;
};
export type PreviewProfile = {
  name: string;
  profileImage: string;
};
export type PreviewProfiles = {
  youtube?: PreviewProfile;
  instagram?: PreviewProfile;
  facebook?: PreviewProfile;
  pinterest?: PreviewProfile;
  linkedin?: PreviewProfile;
  tiktok?: PreviewProfile;
};