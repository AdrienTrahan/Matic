<script>
    import { goto } from "$app/navigation";
    import { user } from "$framework/auth"
    import { UNEXPECTED_ERROR } from "$framework/error";

    export let data;

    let errorMessage = "";
    let userData = {
        email: data?.data?.email.toLowerCase(),
        recovery: data.data.recovery,
        password: ""
    }

    async function resetPassword(){
        errorMessage = "";
        const [data, error] = await user.resetPassword(userData);
        if (error || !data.success) return errorMessage = error.reason ?? error ?? UNEXPECTED_ERROR;
        goto("/dashboard")
    }
</script>
<h1>Password reset</h1>

<a href="/login">go to login</a>
<br>
{#if data.status.valid}
    <p>Email: {userData.email.toLowerCase()}</p>
    <input type="text" placeholder="password" bind:value={userData.password}>
    <br>
    <p>{errorMessage}</p>
    <button on:click={resetPassword}>
        Reset password
    </button> 
{:else}
    <h3>Invalid recovery link</h3>
{/if}