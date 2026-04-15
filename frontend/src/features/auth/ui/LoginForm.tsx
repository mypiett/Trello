import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { PasswordInput } from "@/shared/ui/password-input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/shared/ui/field";

import { Link } from "react-router-dom";
import { useAuth } from "../model";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ROUTES } from "@/shared/config";
import { useState } from "react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormSchema = z.infer<typeof formSchema>;

interface OAuthFormProps {
  onSuccess: () => void;
}

export const LoginForm = ({ onSuccess }: OAuthFormProps) => {
  const { login, isLoading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      setLoginError(null);

      // 👉 CHỈ GỌI AUTH PROVIDER LOGIN
      await login(data.email, data.password);

      // 👉 KHÔNG SET TOKEN, KHÔNG NAVIGATE Ở ĐÂY
      onSuccess?.();

    } catch (error) {
      setLoginError("Incorrect email or password, please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <Card className="bg-white/10 backdrop-blur-xs shadow-lg rounded-xl border border-white/20">
        <CardHeader className="text-center text-white pb-2">
          <CardTitle className="text-2xl font-semibold">
            TaskFlow Welcome
          </CardTitle>
          <CardDescription className="text-sm text-white/80">
            Enter your email and password below to login
          </CardDescription>
        </CardHeader>

        <CardContent className="py-4 px-6">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-1">

              {/* EMAIL */}
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      className="font-medium text-gray-100 text-sm mb-1.5"
                      htmlFor="email"
                    >
                      Email
                    </FieldLabel>

                    <Input
                      {...field}
                      id="email"
                      type="email"
                      disabled={isLoading}
                      autoComplete="off"
                      className="p-2.5 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 bg-white/5 text-sm"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* PASSWORD */}
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center justify-between mb-1.5">
                      <FieldLabel
                        className="font-medium text-gray-100 text-sm"
                        htmlFor="password"
                      >
                        Password
                      </FieldLabel>

                      <Link
                        to="/forgot-password"
                        className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <PasswordInput
                      {...field}
                      id="password"
                      type="password"
                      disabled={isLoading}
                      autoComplete="new-password"
                      className="p-2.5 rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400 bg-white/5 text-sm"
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* ERROR */}
              {loginError && (
                <div className="text-sm text-red-400 text-center p-2 bg-red-900/30 rounded-md mt-2 border border-red-500/30">
                  {loginError}
                </div>
              )}

              {/* BUTTON */}
              <Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 mt-3 text-white bg-blue-500 hover:bg-blue-600 rounded-md transition duration-300 font-medium text-sm"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>

                <FieldDescription className="text-center text-sm mt-4 text-gray-300">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/register"
                    className="text-blue-400 hover:text-blue-300 hover:underline"
                  >
                    Sign up
                  </a>
                </FieldDescription>
              </Field>

            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
