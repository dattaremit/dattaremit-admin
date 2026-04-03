"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Address {
  id: string;
  type: string;
  isDefault: boolean;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface UserAddressesProps {
  addresses: Address[] | undefined | null;
}

export function UserAddresses({ addresses }: UserAddressesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Addresses</CardTitle>
        <CardDescription>User registered addresses</CardDescription>
      </CardHeader>
      <CardContent>
        {addresses && addresses.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((addr) => (
              <Card key={addr.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{addr.type}</Badge>
                    {addr.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-sm">
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p>{addr.country}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-muted-foreground">
            No addresses registered
          </p>
        )}
      </CardContent>
    </Card>
  );
}
