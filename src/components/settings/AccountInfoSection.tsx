
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { updateProfile } from "@/utils/auth";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('profile_photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile_photos')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      await updateProfile(user.id, username, licensePlate, publicUrl);
      setAvatarUrl(publicUrl);

      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-lg">
              {username ? getInitials(username) : '?'}
            </AvatarFallback>
          </Avatar>
          {isEditing && (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isLoading}
                className="hidden"
                id="photo-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('photo-upload')?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          )}
        </div>

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
