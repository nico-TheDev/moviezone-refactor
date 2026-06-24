import { useAuthStore } from "@/stores/auth";
import { getAccountAvatarUrl } from "@/utils/avatar";
import { cn } from "@/utils/css-helpers";
import { UserCircle } from "lucide-react";

export function UserAvatar({
    size = 36,
    className,
}: {
    size?: number;
    className?: string;
}) {
    const mode = useAuthStore((s) => s.mode);
    const account = useAuthStore((s) => s.account);

    if (mode !== "user" || !account) {
        return <UserCircle size={size} className={className} aria-hidden />;
    }

    return (
        <img
            src={getAccountAvatarUrl(account, size)}
            alt=""
            width={size}
            height={size}
            className={cn("rounded-full object-cover", className)}
        />
    );
}
