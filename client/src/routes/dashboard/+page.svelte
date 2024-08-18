<script lang="ts">
    import { user } from "$framework/auth";
    import { authFetch } from "$framework/networking";
    import { connection } from "$framework/socket";

    var doc = connection.get('PROJECTS', 'valo')

    function john(){
        doc.fetch(() => {
            console.log("valo", doc.data);
        })
    }
</script>

<button on:click={user.logout}>
    Logout
</button>

<button on:click={async () => console.log(await authFetch("/auth/test"))}>
    test
</button>