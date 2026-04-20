"use client";

import { useState } from "react";
import {
  DEFAULT_USER_IDENTITY_VALUES,
  type UserIdentityValues,
} from "@/components/users/user-identity-fields";

export function useUserIdentityForm(initial: Partial<UserIdentityValues> = {}) {
  const [values, setValues] = useState<UserIdentityValues>({
    ...DEFAULT_USER_IDENTITY_VALUES,
    ...initial,
  });

  function setValue<K extends keyof UserIdentityValues>(
    key: K,
    value: UserIdentityValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function reset(next: Partial<UserIdentityValues> = {}) {
    setValues({ ...DEFAULT_USER_IDENTITY_VALUES, ...next });
  }

  return { values, setValues, setValue, reset };
}
