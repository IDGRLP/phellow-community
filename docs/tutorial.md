# Tutorial System

The tutorial system provides an interactive, step-by-step guided walkthrough that highlights UI
elements with a dimming overlay and an anchored popover. It is designed to be loosely coupled —
existing components only need `data-tutorial` attributes for targeting.

## Architecture

```text
src/lib/
├── types/tutorial.ts                          # Type definitions
├── stores/tutorialStore.svelte.ts             # Svelte 5 runes store (singleton)
├── components/tutorial/
│   ├── TutorialOverlay.svelte                 # Full-screen overlay with clip-path cutout
│   ├── TutorialPopover.svelte                 # Anchored popover with step content + navigation
│   ├── TutorialProvider.svelte                # Composes overlay + popover + interaction blocking
│   └── steps/
│       └── timelineTutorial.ts                # Step definitions for the timeline walkthrough
```

`TutorialProvider` is mounted once in `src/routes/(app)/+layout.svelte` and covers the entire app
viewport. It conditionally renders only when a tutorial is active.

## Core Concepts

### TutorialStep

A single step in a tutorial. Defined as static configuration in a `steps/*.ts` file.

| Field            | Type                                     | Description                                       |
| ---------------- | ---------------------------------------- | ------------------------------------------------- |
| `id`             | `string`                                 | Unique identifier within the sequence             |
| `targetSelector` | `string`                                 | CSS selector for the highlighted element          |
| `titleKey`       | `string`                                 | Paraglide message key for the step title          |
| `descriptionKey` | `string`                                 | Paraglide message key for the step description    |
| `placement`      | `"top" \| "bottom" \| "left" \| "right"` | Preferred popover position relative to the target |
| `padding`        | `number` (optional)                      | Padding around the cutout highlight (default: 8)  |

### TutorialSequence

An ordered collection of steps forming a complete tutorial.

| Field             | Type                          | Description                                                            |
| ----------------- | ----------------------------- | ---------------------------------------------------------------------- |
| `id`              | `string`                      | Unique sequence identifier                                             |
| `steps`           | `TutorialStep[]`              | Ordered array of steps                                                 |
| `prerequisiteUrl` | `string`                      | URL to navigate to before starting the tutorial                        |
| `setup`           | `() => Promise<void> \| void` | Optional. Runs after navigation but before step 0 (e.g. open a drawer) |

### TutorialStore

The singleton store (`tutorialStore`) manages runtime state. Key API:

| Method / Property    | Description                                                                |
| -------------------- | -------------------------------------------------------------------------- |
| `activate(sequence)` | Saves the current URL, navigates to `prerequisiteUrl`, starts the tutorial |
| `next()`             | Advances to the next step; completes the tutorial on the last step         |
| `previous()`         | Goes back one step; no-op on the first step                                |
| `cancel()`           | Ends the tutorial and restores the saved URL                               |
| `active`             | `boolean` — whether a tutorial is running                                  |
| `currentStep`        | The current `TutorialStep` or `null`                                       |
| `currentStepIndex`   | Zero-based index of the current step                                       |
| `totalSteps`         | Total number of steps in the active sequence                               |
| `isFirstStep`        | `true` when on the first step                                              |
| `isLastStep`         | `true` when on the last step                                               |
| `progress`           | `(currentStepIndex + 1) / totalSteps`                                      |

## How to Add New Tutorial Steps

### 1. Add data-tutorial attributes to target elements

Add a `data-tutorial="your-step-id"` attribute to the element you want to highlight:

```svelte
<div data-tutorial="my-feature-element">
	<!-- content -->
</div>
```

For elements rendered in a loop where you only want to target the first instance, use a tracking
pattern (see `Timeline.svelte` for reference with `attributedTypes`).

### 2. Add i18n message keys

Add title and description keys to both `messages/de.json` and `messages/en.json`:

```json
{
	"tutorial_step_my_feature_title": "My Feature",
	"tutorial_step_my_feature_description": "This element does X and Y."
}
```

The keys can be named freely, but the convention is `tutorial_step_{id}_title` and
`tutorial_step_{id}_description`.

### 3. Add the step to a sequence definition

Edit the relevant file in `src/lib/components/tutorial/steps/` or create a new one:

```ts
import type { TutorialSequence } from "$lib/types/tutorial";

export const myTutorial: TutorialSequence = {
	id: "my-tutorial",
	prerequisiteUrl: "/my-page",
	steps: [
		{
			id: "my-feature-element",
			targetSelector: '[data-tutorial="my-feature-element"]',
			titleKey: "tutorial_step_my_feature_title",
			descriptionKey: "tutorial_step_my_feature_description",
			placement: "right",
			padding: 8,
		},
		// add more steps here...
	],
};
```

### 4. Add a trigger

Import the sequence and call `tutorialStore.activate()` from a button or other interaction:

```svelte
<script lang="ts">
	import { tutorialStore } from "$lib/stores/tutorialStore.svelte";
	import { myTutorial } from "$components/tutorial/steps/myTutorial";
</script>

<button onclick={() => tutorialStore.activate(myTutorial)}> Start Tutorial </button>
```

That's it. The `TutorialProvider` (already mounted in the app layout) handles the overlay, popover,
navigation, and cleanup automatically.

## Adding Steps to an Existing Sequence

To add a step to the timeline tutorial:

1. Add `data-tutorial="timeline-event-newtype"` to the target element in the relevant component.
2. Add the i18n keys (`tutorial_step_newtype_title`, `tutorial_step_newtype_description`) to both
   `de.json` and `en.json`.
3. Append the step object to the `steps` array in
   `src/lib/components/tutorial/steps/timelineTutorial.ts`.

Step order in the array determines the order shown to the user.

## Using the `setup` Hook

Some tutorials need UI state beyond just a URL — for example, opening a drawer or selecting a
specific element. The optional `setup` function runs after navigation but before the first step
starts.

Example: the diagnosis tutorial opens the diagnosis drawer programmatically:

```ts
import type { TutorialSequence } from "$lib/types/tutorial";

function waitFor(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const diagnosisTutorial: TutorialSequence = {
	id: "diagnosis-detail",
	prerequisiteUrl: "/module/oncology?file=InKaPP_Lunge_C34.json",
	async setup() {
		await waitFor(300); // wait for timeline to render
		const el = document.querySelector('[data-tutorial="timeline-event-diagnosis"]');
		if (el instanceof HTMLElement) el.click(); // open the drawer
		await waitFor(500); // wait for drawer content to render
	},
	steps: [
		/* ... */
	],
};
```

## Existing Tutorials

| Tutorial  | File                                   | Trigger location                    |
| --------- | -------------------------------------- | ----------------------------------- |
| Timeline  | `steps/timelineTutorial.ts` (9 steps)  | Help button on oncology page header |
| Diagnosis | `steps/diagnosisTutorial.ts` (7 steps) | Help button in diagnosis drawer     |

## Behavior Details

- **Prerequisite navigation**: When activated, the tutorial navigates to `prerequisiteUrl` if the
  user is not already there, then runs the optional `setup()` hook, then starts the first step.
- **State restoration**: On completion or cancellation, the user is navigated back to the URL they
  were on before the tutorial started.
- **Interaction blocking**: A transparent layer blocks all pointer events on app elements during the
  tutorial. Only the popover controls (Previous, Next, Cancel) are interactive.
- **Keyboard support**: `Escape` cancels the tutorial. The popover buttons are keyboard-accessible.
- **Browser back/forward**: Navigating away via the browser's back button cancels the tutorial.
- **Re-activation guard**: Calling `activate()` while a tutorial is already active is a no-op.
- **Load failure**: If the first step's target element is not found within 5 seconds of activation,
  an error message is shown and the tutorial is cancelled.
- **Responsive**: The overlay cutout recomputes on resize and scroll via `ResizeObserver` and scroll
  event listeners.
