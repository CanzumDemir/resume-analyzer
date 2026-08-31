// AI assistance disclosure: AI tools assisted with frontend UI implementation,
// styling, Tailwind CSS, layout, and implementation details during development.
// Exact historical line-level provenance is unavailable; see AI_ASSISTANCE.md.

import { Suspense } from "react";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUp() {
    return (
        <Suspense>
            <SignUpForm />
        </Suspense>
    );
}
