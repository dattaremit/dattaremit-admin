"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface UserIdentityValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumberPrefix: string;
  phoneNumber: string;
  dateOfBirth: string;
  nationality: string;
}

export const DEFAULT_USER_IDENTITY_VALUES: UserIdentityValues = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumberPrefix: "+1",
  phoneNumber: "",
  dateOfBirth: "",
  nationality: "",
};

interface UserIdentityFieldsProps {
  values: UserIdentityValues;
  onChange: <K extends keyof UserIdentityValues>(
    key: K,
    value: UserIdentityValues[K],
  ) => void;
  idPrefix?: string;
}

export function UserIdentityFields({
  values,
  onChange,
  idPrefix = "",
}: UserIdentityFieldsProps) {
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={id("firstName")}>First Name</Label>
          <Input
            id={id("firstName")}
            value={values.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={id("lastName")}>Last Name</Label>
          <Input
            id={id("lastName")}
            value={values.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={id("email")}>Email</Label>
        <Input
          id={id("email")}
          type="email"
          value={values.email}
          onChange={(e) => onChange("email", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={id("phonePrefix")}>Prefix</Label>
          <Input
            id={id("phonePrefix")}
            value={values.phoneNumberPrefix}
            onChange={(e) => onChange("phoneNumberPrefix", e.target.value)}
            placeholder="+1"
            required
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor={id("phoneNumber")}>Phone Number</Label>
          <Input
            id={id("phoneNumber")}
            value={values.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={id("dateOfBirth")}>Date of Birth</Label>
        <Input
          id={id("dateOfBirth")}
          type="date"
          value={values.dateOfBirth}
          onChange={(e) => onChange("dateOfBirth", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={id("nationality")}>Nationality</Label>
        <Input
          id={id("nationality")}
          value={values.nationality}
          onChange={(e) => onChange("nationality", e.target.value)}
        />
      </div>
    </>
  );
}
