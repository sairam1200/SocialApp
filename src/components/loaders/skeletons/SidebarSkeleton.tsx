export default function SidebarSkeleton() {
  return (
    <aside className="hidden md:flex h-fit flex-col items-center gap-5 rounded-[20px] py-5 px-1 sm:px-2 mr-5 sm:mr-10 animate-pulse">
      <div className="w-10 h-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded bg-[length:200%_100%]" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="w-10 h-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-md bg-[length:200%_100%]" />
      ))}
    </aside>
  );
}
