<script lang="ts" module>
	export const ICONS = {
		outlined: {
			download: 'ic:outline-file-download',
			preview: 'ic:outline-visibility',
			user: 'ic:outline-person',
			cart: 'ic:outline-shopping-bag',
			close: 'ic:outline-close',
			settings: 'ic:outline-settings',
			search: 'ic:outline-search',
			upload: 'ic:outline-upload',
			delete: 'ic:outline-delete',
			edit: 'ic:outline-edit',
			menu: 'ic:outline-menu',
			back: 'ic:outline-keyboard-backspace',
			forward: 'ic:outline-arrow-forward-ios',
			check: 'ic:outline-check-circle',
			compare: 'ic:outline-compare-arrows',
			openNew: 'ic:outline-open-in-new',
			sync: 'ic:outline-sync',
			move: 'ic:outline-drive-file-move',
			undo: 'ic:outline-undo',
			send: 'mdi:send',
			library: 'ic:outline-local-library',
			attach: 'ic:outline-attach-file',
			awesome: 'ic:outline-auto-awesome',
			add: 'ic:outline-add',
			chat: 'ic:outline-chat-bubble-outline'
		},
		filled: {
			download: 'ic:baseline-file-download',
			preview: 'ic:baseline-visibility',
			user: 'ic:baseline-person',
			cart: 'ic:baseline-shopping-bag',
			close: 'ic:baseline-close',
			settings: 'ic:baseline-settings',
			search: 'ic:baseline-search',
			upload: 'ic:baseline-upload',
			delete: 'ic:baseline-delete',
			edit: 'ic:baseline-edit',
			menu: 'ic:baseline-menu',
			back: 'ic:baseline-keyboard-backspace',
			forward: 'ic:baseline-arrow-forward-ios',
			check: 'ic:baseline-check-circle',
			compare: 'ic:baseline-compare-arrows',
			openNew: 'ic:baseline-open-in-new',
			sync: 'ic:baseline-sync',
			move: 'ic:baseline-drive-file-move',
			undo: 'ic:baseline-undo',
			send: 'ic:baseline-send',
			library: 'ic:baseline-local-library',
			attach: 'ic:baseline-attach-file',
			awesome: 'ic:baseline-auto-awesome',
			add: 'ic:baseline-add',
			chat: 'ic:baseline-chat-bubble'
		},
		round: {
			download: 'ic:round-file-download',
			preview: 'ic:round-visibility',
			user: 'ic:round-person',
			cart: 'ic:round-shopping-bag',
			close: 'ic:round-close',
			chat: 'ic:round-chat-bubble'
		},
		sharp: {
			download: 'ic:sharp-file-download',
			preview: 'ic:sharp-visibility',
			user: 'ic:sharp-person',
			cart: 'ic:sharp-shopping-bag',
			close: 'ic:sharp-close',
			chat: 'ic:sharp-chat-bubble'
		},
		'two-tone': {
			download: 'ic:twotone-file-download',
			preview: 'ic:twotone-visibility',
			user: 'ic:twotone-person',
			cart: 'ic:twotone-shopping-bag',
			close: 'ic:twotone-close',
			chat: 'ic:twotone-chat-bubble'
		}
	} as const;

	export type Type = keyof typeof ICONS;
	export type OutlinedVariant = keyof (typeof ICONS)['outlined'];
	export type FilledVariant = keyof (typeof ICONS)['filled'];
	export type RoundVariant = keyof (typeof ICONS)['round'];
	export type SharpVariant = keyof (typeof ICONS)['sharp'];
	export type TwoToneVariant = keyof (typeof ICONS)['two-tone'];

	export type Variant =
		| {
				type: 'outlined';
				icon: OutlinedVariant;
		  }
		| {
				type: 'filled';
				icon: FilledVariant;
		  }
		| {
				type: 'round';
				icon: RoundVariant;
		  }
		| {
				type: 'sharp';
				icon: SharpVariant;
		  }
		| {
				type: 'two-tone';
				icon: TwoToneVariant;
		  };
</script>

<script lang="ts">
	import Icon from '@iconify/svelte';
	import { unreachable } from '$lib/utils/helpers/unreachable';

	interface IProps {
		variant: Variant;
		size?: number | string;
		color?: string;
		class?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: string]: any;
	}

	let { variant, color, size = '1.5rem', class: className, ...props }: IProps = $props();

	const ICON_TYPES = Object.keys(ICONS) as Type[];

	const iconName = $derived.by(() => {
		const { icon, type } = variant;
		if (!ICON_TYPES.includes(type)) return null;

		switch (type) {
			case 'outlined':
				return ICONS.outlined[icon as OutlinedVariant];
			case 'filled':
				return ICONS.filled[icon as FilledVariant];
			case 'round':
				return ICONS.round[icon as RoundVariant];
			case 'sharp':
				return ICONS.sharp[icon as SharpVariant];
			case 'two-tone':
				return ICONS['two-tone'][icon as TwoToneVariant];
			default:
				return unreachable(type);
		}
	});
</script>

{#if iconName}
	<Icon icon={iconName} {color} width={size} height={size} class={className} {...props} />
{/if}
