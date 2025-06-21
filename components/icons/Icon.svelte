<script lang="ts">
  import { setIcon } from "obsidian";

  type $Props = { icon: `lucide-${string}` | undefined };

  const { icon }: $Props = $props();

	// ? See if this fixes the performance / clean up issues
	// ? If not, could also render all icons, and just change the visibility by status
  function iconAction(node: HTMLDivElement, icon: string | undefined) {
  	if (icon) setIcon(node, icon);

  	return {
  		update(newIcon: typeof icon) {
  			node.innerHTML = "";
  			if (newIcon) setIcon(node, newIcon);
  		},
  		destroy() { node.innerHTML = "" }
  	};
  }
</script>

{#if icon}
  <div use:iconAction={icon}></div>
{:else}
  <div></div>
{/if}
