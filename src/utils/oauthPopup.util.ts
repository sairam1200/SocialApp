export async function openOAuthPopup(
    url: string,
    platform: string
): Promise<"success" | "fail" | "blocked"> {
    return new Promise((resolve) => {
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
            url,
            `${platform}-oauth`,
            `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
            resolve("blocked");
            return;
        }

        function successHandler() {
            cleanup();
            resolve("success");
        }

        function failHandler() {
            cleanup();
            resolve("fail");
        }

        function cleanup() {
            window.removeEventListener("oauth_success", successHandler);
            window.removeEventListener("oauth_failed", failHandler);
        }

        window.addEventListener("oauth_success", successHandler);
        window.addEventListener("oauth_failed", failHandler);
    });
}