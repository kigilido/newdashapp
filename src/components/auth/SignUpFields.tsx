
import { Input } from "@/components/ui/input";

interface SignUpFieldsProps {
  username: string;
  setUsername: (value: string) => void;
  licensePlate: string;
  setLicensePlate: (value: string) => void;
  isLoading: boolean;
}

export const SignUpFields = ({
  username,
  setUsername,
  licensePlate,
  setLicensePlate,
  isLoading,
}: SignUpFieldsProps) => {
  return (
    <>
      <Input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={isLoading}
        required
      />
      <Input
        type="text"
        placeholder="License Plate"
        value={licensePlate}
        onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
        disabled={isLoading}
        required
      />
    </>
  );
};
