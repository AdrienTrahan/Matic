<!-- @format -->
<script>
    import { goto } from "$app/navigation"
    import { user } from "$framework/auth"

    let errorMessage = ""
    let userData = {
        email: "",
        password: "",
    }

    async function login() {
        errorMessage = ""
        const [data, error] = await user.login(userData)
        if (error) return (errorMessage = error.reason ?? error)
        goto("/projects")
    }
</script>

<h1>Login</h1>
<a href="/signup">go to signup</a>
<br />
<a href="/forgot">forgot password</a>
<br />
<input type="text" placeholder="email" bind:value={userData.email} />
<br />
<input type="text" placeholder="password" bind:value={userData.password} />
<br />
<p>{errorMessage}</p>
<button on:click={login}> Login </button>
