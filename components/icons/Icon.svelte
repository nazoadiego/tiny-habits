<script lang="ts">
	import { getIconRenderer } from 'platform/iconContext'

	type $Props = { icon: `lucide-${string}` | undefined }

	const { icon }: $Props = $props()

	const setIcon = getIconRenderer()

	function iconAction(node: HTMLDivElement, icon: string | undefined) {
		if (icon) setIcon(node, icon)

		return {
			update(newIcon: typeof icon) {
				node.replaceChildren()
				if (newIcon) setIcon(node, newIcon)
			},
			destroy() {
				node.replaceChildren()
			}
		}
	}
</script>

<div use:iconAction={icon} class="icon-container"></div>
