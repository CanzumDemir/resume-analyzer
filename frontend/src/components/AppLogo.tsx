import Image from "next/image";

export default function AppLogo() {
    return (
        <Image
            src="/app-logo.png"
            alt="App Logo"
            width={100}
            height={100}
            loading="eager"
            className="h-10 w-15"
        />
    );
}