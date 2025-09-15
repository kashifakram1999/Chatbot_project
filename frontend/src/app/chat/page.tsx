import ChatClient from "./ChatClient";

export default function ChatPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      <ChatClient />
    </div>
  );
}
