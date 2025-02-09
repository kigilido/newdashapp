
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateProfile } from "@/utils/auth";

interface ProfileFormProps {
  initialUsername: string | undefined;
  initialLicensePlate: string | undefined;
  username: string;
  setUsername: (username: string) => void;
  licensePlate: string;
  setLicensePlate: (licensePlate: string) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  email: string | undefined;
  phoneNumber: string | undefined;
  createdAt: string | undefined;
  avatarUrl: string | undefined;
}

export const ProfileForm = ({
  initialUsername,
  initialLicensePlate,
  username,
  setUsername,
  licensePlate,
  setLicensePlate,
  isEditing,
  setIsEditing,
  isLoading,
  setIsLoading,
  email,
  phoneNumber,
  createdAt,
  avatarUrl,
}: ProfileFormProps) => {
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('No user found');

      // Only check for duplicate username if it has changed and is not empty
      if (username !== initialUsername && username.trim() !== '') {
        const { data: existingUsername } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', user.user.id)
          .maybeSingle();

        if (existingUsername) {
          toast({
            title: "Username already taken",
            description: "Please choose a different username",
            variant: "destructive",
          });
          return;
        }
      }

      // Only check for duplicate license plate if it has changed and is not empty
      if (licensePlate !== initialLicensePlate && licensePlate.trim() !== '') {
        const { data: existingLicensePlate } = await supabase
          .from('profiles')
          .select('id')
          .eq('license_plate', licensePlate)
          .neq('id', user.user.id)
          .maybeSingle();

        if (existingLicensePlate) {
          toast({
            title: "License plate already registered",
            description: "Please check the license plate number",
            variant: "destructive",
          });
          return;
        }
      }

      await updateProfile(user.user.id, username, licensePlate, avatarUrl);
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

  // Set the initial values when isEditing becomes true
  useEffect(() => {
    if (isEditing) {
      setUsername(initialUsername || '');
      setLicensePlate(initialLicensePlate || '');
    }
  }, [isEditing, initialUsername, initialLicensePlate, setUsername, setLicensePlate]);

  return (
    <>
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
    </>
  );
};
