import { ItemView, WorkspaceLeaf } from 'obsidian';

// Import the Counter Svelte component and the `mount` and `unmount` methods.
import Counter from './Counter.svelte';
import { mount, unmount } from 'svelte';

export const VIEW_TYPE_EXAMPLE = 'example-view';

export class ExampleView extends ItemView {
  // A variable to hold on to the Counter instance mounted in this ItemView.
  counter: ReturnType<typeof Counter> | undefined;

  constructor(leaf: WorkspaceLeaf) {
    super(leaf);
  }

  getViewType() {
    return VIEW_TYPE_EXAMPLE;
  }

  getDisplayText() {
    return 'Example view';
  }

  async onOpen() {
    // Attach the Svelte component to the ItemViews content element and provide the needed props.
    this.counter = mount(Counter, {
      target: this.contentEl,
      props: {
        startCount: 5,
      }
    });

    // Since the component instance is typed, the exported `increment` method is known to TypeScript.
    this.counter.increment();
  }

  async onClose() {
    if (this.counter) {
      // Remove the Counter from the ItemView.
      unmount(this.counter);
    }
  }
}