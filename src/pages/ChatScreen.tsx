import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

const ChatScreen = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <p>Your chat messages will appear here.</p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatScreen;