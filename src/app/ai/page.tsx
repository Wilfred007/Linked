import dynamic from "next/dynamic";

const Chat = dynamic(() => import("@/components/ai/Chat"), { ssr: false });

export default function AIPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>
      <Chat />
    </div>
  );
}
