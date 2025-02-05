
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

type AccountInfoSectionProps = {
  email: string | undefined;
  phoneNumber: string | undefined;
  createdAt: string | undefined;
};

export const AccountInfoSection = ({ email, phoneNumber, createdAt }: AccountInfoSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label className="text-muted-foreground">Email</Label>
          <p className="font-medium">{email}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground">Phone Number</Label>
          <p className="font-medium">{phoneNumber || 'Not set'}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground">Member since</Label>
          <p className="font-medium">
            {createdAt 
              ? new Date(createdAt).toLocaleDateString()
              : 'Loading...'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
