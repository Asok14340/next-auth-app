"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import SocialButtons from "@/components/auth/SocialButtons";
import FormDivider from "@/components/auth/FormDivider";
import { toast } from "sonner";
import { signup } from "@/app/actions/auth";

const Signup = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.username) {
            newErrors.username = "Username is required";
        } else if (formData.username.length < 3) {
            newErrors.username = "Username must be at least 3 characters";
        }

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!acceptTerms) {
            newErrors.terms = "You must accept the terms and conditions";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const form = new FormData();
            form.append("username", formData.username);
            form.append("email", formData.email);
            form.append("password", formData.password);

            const result = await signup(form);

            if (result.success) {
                toast.success(result.success || "Account created! Check your email to verify.");
                router.push("/login"); // Redirect to login
            } else {
                toast.error(result.error || "Signup failed");
                if (result.error) {
                    setErrors({ email: result.error }); // General error to email field or similar
                }
            }
        } catch (error) {
            console.error("Signup error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const passwordStrength = () => {
        const password = formData.password;
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const strengthColors = ["bg-destructive", "bg-warning", "bg-warning", "bg-success"];
    const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

    return (
        <AuthLayout
            title="Create an account"
            subtitle="Start your journey with us today"
        >
            <SocialButtons isLoading={isLoading} actionText="Sign up" />

            <FormDivider />

            <form onSubmit={handleSubmit} className="space-y-4">
                <AuthInput
                    label="Username"
                    name="username"
                    type="text"
                    placeholder="johndoe"
                    icon={User}
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                    disabled={isLoading}
                />

                <AuthInput
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    disabled={isLoading}
                />

                <div className="space-y-2">
                    <AuthInput
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Create a strong password"
                        icon={Lock}
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        disabled={isLoading}
                    />
                    {formData.password && (
                        <div className="space-y-2 animate-fade-in">
                            <div className="flex gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < passwordStrength()
                                                ? strengthColors[passwordStrength() - 1]
                                                : "bg-border"
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Password strength:{" "}
                                <span
                                    className={`font-medium ${passwordStrength() === 4
                                            ? "text-success"
                                            : passwordStrength() >= 2
                                                ? "text-warning"
                                                : "text-destructive"
                                        }`}
                                >
                                    {strengthLabels[passwordStrength() - 1] || "Too weak"}
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                <AuthInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    icon={Lock}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    disabled={isLoading}
                />

                <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => {
                            setAcceptTerms(checked === true);
                            if (errors.terms) {
                                setErrors((prev) => ({ ...prev, terms: "" }));
                            }
                        }}
                        className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <div className="space-y-1">
                        <label
                            htmlFor="terms"
                            className="text-sm text-muted-foreground cursor-pointer"
                        >
                            I agree to the{" "}
                            <Link href="#" className="text-primary hover:underline">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="#" className="text-primary hover:underline">
                                Privacy Policy
                            </Link>
                        </label>
                        {errors.terms && (
                            <p className="text-sm text-destructive animate-fade-in">
                                {errors.terms}
                            </p>
                        )}
                    </div>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                        type="submit"
                        className="w-full h-12 text-base font-medium bg-brand-dark hover:bg-brand-dark/80 transition-all duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-5 w-5" />
                                Create account
                            </>
                        )}
                    </Button>
                </motion.div>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
};

export default Signup;
