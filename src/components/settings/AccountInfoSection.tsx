
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ProfilePhotoUpload } from "./account-info/ProfilePhotoUpload";
import { ProfileForm } from "./account-info/ProfileForm";

type AccountInfoSectionProps = {
  email: string | undefined;
  phoneNumber: string | undefined;
  createdAt: string | undefined;
  username: string | undefined;
  licensePlate: string | undefined;
  avatarUrl: string | undefined;
};

export const AccountInfoSection = ({ 
  email, 
  phoneNumber, 
  createdAt, 
  username: initialUsername,
  licensePlate: initialLicensePlate,
  avatarUrl: initialAvatarUrl
}: AccountInfoSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(initialUsername || '');
  const [licensePlate, setLicensePlate] = useState(initialLicensePlate || '');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center justify-center w-full gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          {!isEditing && (
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing && (
          <ProfilePhotoUpload
            username={username}
            licensePlate={licensePlate}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
        
        <ProfileForm
          initialUsername={initialUsername}
          initialLicensePlate={initialLicensePlate}
          username={username}
          setUsername={setUsername}
          licensePlate={licensePlate}
          setLicensePlate={setLicensePlate}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          email={email}
          phoneNumber={phoneNumber}
          createdAt={createdAt}
          avatarUrl={avatarUrl}
        />
      </CardContent>
    </Card>
  );
};

