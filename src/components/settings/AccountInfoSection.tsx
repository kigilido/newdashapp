
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { updateProfile } from "@/utils/auth";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type AccountInfoSectionProps = {
  email: string | undefined;
  phoneNumber: string | undefined;
  createdAt: string | undefined;
  username: string | undefined;
  licensePlate: string | undefined;
};

export const AccountInfoSection = ({ 
  email, 
  phoneNumber, 
  createdAt, 
  username: initialUsername,
  licensePlate: initialLicensePlate 
}: AccountInfoSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(initialUsername || '');
  const [licensePlate, setLicensePlate] = useState(initialLicensePlate || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('No user found');

      // Check if username is already taken
      if (username !== initialUsername) {
        const { data: existingUsername } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', user.user.id)
          .single();

        if (existingUsername) {
          toast({
            title: "Username already taken",
            description: "Please choose a different username",
            variant: "destructive",
          });
          return;
        }
      }

      // Check if license plate is already registered
      if (licensePlate !== initialLicensePlate) {
        const { data: existingLicensePlate } = await supabase
          .from('profiles')
          .select('id')
          .eq('license_plate', licensePlate)
          .neq('id', user.user.id)
          .single();

        if (existingLicensePlate) {
          toast({
            title: "License plate already registered",
            description: "Please check the license plate number",
            variant: "destructive",
          });
          return;
        }
      }

      await updateProfile(user.user.id, username, licensePlate);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
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
        <div className="space-y-1">
          <Label className="text-muted-foreground">Username</Label>
          {isEditing ? (
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={isLoading}
            />
          ) : (
            <p className="font-medium">{initialUsername || 'Not set'}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground">Email</Label>
          <p className="font-medium">{email}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground">Phone Number</Label>
          <p className="font-medium">{phoneNumber || 'Not set'}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground">License Plate</Label>
          {isEditing ? (
            <Input
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
              placeholder="Enter license plate"
              disabled={isLoading}
            />
          ) : (
            <p className="font-medium">{initialLicensePlate || 'Not set'}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-muted-foreground">Member since</Label>
          <p className="font-medium">
            {createdAt 
              ? new Date(createdAt).toLocaleDateString()
              : 'Loading...'}
          </p>
        </div>
        {isEditing && (
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isLoading}
            >
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setUsername(initialUsername || '');
                setLicensePlate(initialLicensePlate || '');
                setIsEditing(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
