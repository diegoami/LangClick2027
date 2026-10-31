<script lang="ts">
	import TypeView from '$lib/TypeView.svelte';

	let { data } = $props();
</script>

<!-- The view reads its round once, so a change of unit has to rebuild it. -->
{#key `${data.pack.id}/${data.unit.id}`}
	<TypeView pack={data.pack} unit={data.unit} />
{/key}
