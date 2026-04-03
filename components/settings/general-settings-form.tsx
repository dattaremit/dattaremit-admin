"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Server } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const generalFormSchema = z.object({
  apiUrl: z.string().url("Must be a valid URL"),
  adminToken: z.string().min(1, "Admin token is required"),
  rateLimit: z.string().regex(/^\d+$/, "Must be a number"),
});

type GeneralFormValues = z.infer<typeof generalFormSchema>;

export function GeneralSettingsForm() {
  const form = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
      adminToken: "",
      rateLimit: "200",
    },
  });

  function onSubmit(data: GeneralFormValues) {
    if (data.adminToken) {
      localStorage.setItem("admin_token", data.adminToken);
    }
    toast.success("Settings saved", {
      description: "General settings have been updated.",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          API Configuration
        </CardTitle>
        <CardDescription>
          Configure the connection to the DattaRemit backend server
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="apiUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Base URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="http://localhost:5000/api"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The base URL of your DattaRemit API server
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new admin token"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Update the admin authentication token (leave blank to
                    keep current)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rateLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate Limit</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="200"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum requests per 15-minute window
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
