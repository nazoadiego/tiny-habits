<script lang="ts">
	import type Entry from 'models/Entry'
	import Icon from './Icon.svelte'

	type $Props = { status: Entry['status'] }

	const { status }: $Props = $props()

	const iconMap = {
		unstarted: undefined,
		completed: 'lucide-check',
		skip: 'lucide-circle-minus',
		failed: 'lucide-circle-x'
	} as const

	const icon = $derived(iconMap[status])
</script>

<Icon {icon} />
