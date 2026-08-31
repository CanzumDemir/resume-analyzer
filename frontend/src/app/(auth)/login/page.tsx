// AI assistance disclosure: AI tools assisted with frontend UI implementation,
// styling, Tailwind CSS, layout, and implementation details during development.
// Exact historical line-level provenance is unavailable; see AI_ASSISTANCE.md.

import { Suspense } from "react"
import LoginForm from "@/components/auth/LoginForm"

export default function Login() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    )
}
