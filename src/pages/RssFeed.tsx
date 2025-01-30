import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RssFeed = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">News Feed</h1>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Latest Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Your personalized news feed will appear here.</p>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default RssFeed;