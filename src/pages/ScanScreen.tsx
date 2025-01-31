import { Card } from "@/components/ui/card";

const ScanScreen = () => {
  return (
    <div className="space-y-4 h-[calc(100vh-12rem)]">
      <Card className="p-4 h-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm border-white/20">
        <p className="text-gray-500">Scanner functionality has been removed.</p>
      </Card>
    </div>
  );
};

export default ScanScreen;