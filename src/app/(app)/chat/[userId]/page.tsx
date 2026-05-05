export default function ChatPage({
  params,
}: {
  params: { userId: string };
}) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <p className="text-sm text-[#3a3a3a]">{params.userId}</p>
    </div>
  );
}
