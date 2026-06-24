import { API } from "@/constants/api";
import type { AccountInfo } from "@/stores/auth";
import { gravatarUrl } from "@/utils/gravatar";

export function getAccountAvatarUrl(account: AccountInfo | null, size = 120): string {
    if (account?.avatar?.tmdbPath) {
        return `${API.IMAGE_PROFILE_URL}${account.avatar.tmdbPath}`;
    }
    if (account?.avatar?.gravatarHash) {
        return `https://www.gravatar.com/avatar/${account.avatar.gravatarHash}?s=${size}&d=mp`;
    }
    if (account?.username) {
        return gravatarUrl(`${account.username}@tmdb.local`, size);
    }
    return gravatarUrl("guest@moviezone.local", size);
}
