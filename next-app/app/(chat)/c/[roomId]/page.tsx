import ChatRoom from '@/components/chat/chat-room';

export default async function Page({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  return <ChatRoom roomId={roomId} />;
}
