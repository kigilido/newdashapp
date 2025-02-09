
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateProfile } from "@/utils/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfilePhotoUploadProps {
  username: string;
  licensePlate: string;
  avatarUrl: string | undefined;
  setAvatarUrl: (url: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const ProfilePhotoUpload = ({
  username,
  licensePlate,
  avatarUrl,
  setAvatarUrl,
  isLoading,
  setIsLoading
}: ProfilePhotoUploadProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        });
        return;
      }

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

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="text-lg">
          {username ? getInitials(username) : '?'}
        </AvatarFallback>
      </Avatar>
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
    </div>
  );
};
