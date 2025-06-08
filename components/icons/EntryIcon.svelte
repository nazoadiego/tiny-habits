<script lang="ts">
  import type Entry from "models/Entry";
  import { getIcon, getIconIds } from "obsidian";

  console.log(getIconIds());
  // keys should match the possible status of an entry and a default
  // Entry.STATUS
  // values should be among lucide options, IconName
  const iconMap = {
    unstarted: getIcon("lucide-circle-dashed"),
    completed: getIcon("lucide-check"),
    skip: getIcon("lucide-circle-minus"),
    failed: getIcon("lucide-circle-x"),
  };
  console.log(iconMap.failed);

  export let status: Entry["status"];
</script>

{#if status}
  <!-- <svg bind:this={icon}></svg> -->
  {@html iconMap[status]?.outerHTML}
{:else}
  <span>No Status, something is wrong</span>
{/if}
