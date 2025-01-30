import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const MapScreen = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Location</h1>
      <Card>
        <CardHeader>
          <CardTitle>Map View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 bg-muted/50 rounded-lg">
            <MapPin className="h-24 w-24 text-muted-foreground" />
            <p className="mt-4">Map interface will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapScreen;