import { ProfileSkeleton } from "@/components/loaders/skeletons";

export default function UserProfileLoading() {
  return (
    <div className="space-y-6">
      <ProfileSkeleton />
    </div>
  );
}
