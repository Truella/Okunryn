import { MessageSkeleton } from "@/components/ui/Skeleton";

export default function MessageListSkeleton() {
  return (
    <div className="flex-1 px-4 py-4">
      <MessageSkeleton isOwn={false} />
      <MessageSkeleton isOwn />
      <MessageSkeleton isOwn={false} />
      <MessageSkeleton isOwn />
      <MessageSkeleton isOwn={false} />
      <MessageSkeleton isOwn />
    </div>
  );
}
