<script lang="ts">
  import { setIcon } from "obsidian";

  type $Props = { icon: `lucide-${string}` | undefined };

  const { icon }: $Props = $props();

  function iconAction(node: HTMLDivElement, icon: string | undefined) {
  	if (icon) setIcon(node, icon);

  	return {
  		update(newIcon: typeof icon) {
  			node.empty();
  			if (newIcon) setIcon(node, newIcon);
  		},
  		destroy() { node.empty() }
  	};
  }
</script>

<div use:iconAction={icon}></div>
