<script lang="ts">
  import type Entry from "models/Entry";
  import { setIcon } from "obsidian";

  type $Props = {
    status: Entry["status"];
  };

  const { status }: $Props = $props();

  const iconMap = {
    unstarted: undefined,
    completed: "lucide-check",
    skip: "lucide-circle-minus",
    failed: "lucide-circle-x",
  };

  // TODO: maybe move this to a generic Icon component, just leave the iconMap here
  let iconElement: HTMLDivElement | undefined = $state();

  $effect(() =>
    iconElement && iconMap[status]
      ? setIcon(iconElement, iconMap[status])
      : undefined,
  );
</script>

{#if iconMap[status]}
  <div bind:this={iconElement}></div>
{:else}
  <div></div>
{/if}
