import { Suspense } from "react";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUp() {
    return (
        <Suspense>
            <SignUpForm />
        </Suspense>
    );
}