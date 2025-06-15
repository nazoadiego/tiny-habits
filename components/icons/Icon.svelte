<script lang="ts">
  import { setIcon } from "obsidian";

  type $Props = { icon: `lucide-${string}` | undefined };

  const { icon }: $Props = $props();

  let iconElement: HTMLDivElement | undefined = $state();

  $effect(() => (iconElement && icon ? setIcon(iconElement, icon) : undefined));
</script>

{#if icon}
  <div bind:this={iconElement}></div>
{:else}
  <div></div>
{/if}
