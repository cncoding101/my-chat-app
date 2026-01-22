<script lang="ts">
	import { fade } from 'svelte/transition';
	import { LoadingSpinner } from '@/components/atoms/loading-spinner';

	interface Props {
		title?: string;
	}

	let { title = 'Loading your workspace...' }: Props = $props();
</script>

<div
	out:fade={{ duration: 200 }}
	class="bg-base-100 fixed inset-0 z-9999 flex items-center justify-center"
>
	<div class="flex flex-col items-center gap-4">
		<LoadingSpinner class="text-primary size-12" />
		<p class="text-primary animate-pulse text-sm font-medium">{title}</p>
	</div>
</div>
