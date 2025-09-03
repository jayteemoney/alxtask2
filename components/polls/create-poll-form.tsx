"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";

const createPollSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  options: z
    .array(z.object({ value: z.string().min(1, "Option cannot be empty") }))
    .min(2, "At least 2 options required"),
  allowMultipleVotes: z.boolean(),
  expiresAt: z.string().optional(),
  isPublic: z.boolean(),
});

type CreatePollFormData = z.infer<typeof createPollSchema>;

export function CreatePollForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<CreatePollFormData>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      title: "",
      description: "",
      options: [{ value: "" }, { value: "" }],
      allowMultipleVotes: false,
      isPublic: true,
    },
  });

  const { fields, append, remove } = useFieldArray<CreatePollFormData>({
    control: form.control,
    name: "options",
  });

  async function onSubmit(data: CreatePollFormData) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description || null,
          options: data.options.map((option) => option.value).filter((option) => option.trim() !== ""),
          allow_multiple_votes: data.allowMultipleVotes,
          expires_at: data.expiresAt || null,
          is_public: data.isPublic,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create poll");
      }

      const { poll } = await response.json();
      router.push(`/polls/${poll.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create poll. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const addOption = () => {
    append({ value: "" });
  };

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Poll Title</FormLabel>
              <FormControl>
                <Input placeholder="What's your question?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add more context to your poll..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <Label>Poll Options</Label>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <FormField
                control={form.control}
                name={`options.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder={`Option ${index + 1}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {fields.length > 2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeOption(index)}
                  className="hover-lift transition-smooth"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addOption}
            className="w-full hover-lift transition-smooth"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Option
          </Button>
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="hover-glow transition-smooth"
          >
            {isLoading ? "Creating..." : "Create Poll"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="hover-lift transition-smooth"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}