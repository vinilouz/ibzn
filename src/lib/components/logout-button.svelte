<script>
import { Button } from "./ui/button/index.js";
import { authClient } from "$lib/auth-client";
import { goto } from '$app/navigation';

let logingOut = $state(false);

async function handleLogout() {
    
    logingOut = true;
    
    try {
        await authClient.signOut({
            fetchOptions: {
                onSuccess() {
                    goto("/");
                }
            }
        });
            
    }
    catch (error) {
        console.error("Logout error:", error);
        const message = error instanceof Error ? error.message : typeof error === 'string' ? error : String(error);
        alert("Error during logout: " + message);
    }
    finally {
        logingOut = false;
    }
}

</script>

<Button type ="button" class="w-full" variant="destructive" onclick={handleLogout}>
    {logingOut ? "Logging out..." : "Logout"}
</Button>