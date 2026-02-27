import StyleDictionary from 'style-dictionary';

// Custom format: outputs Tailwind v4 @theme { ... } block
StyleDictionary.registerFormat({
	name: 'css/tailwind-theme',
	format: ({ dictionary }) => {
		const lines = dictionary.allTokens.map((token) => {
			const category = token.path[0];
			const rest = token.path.slice(1);

			let name;
			if (category === 'colors') {
				name = `--color-${rest.join('-')}`;
			} else if (category === 'typography') {
				// typography.fontFamily.base → --font-base
				// typography.fontSize.sm → --text-sm
				// typography.fontWeight.bold → --font-weight-bold
				// typography.lineHeight.normal → --leading-normal
				const sub = rest[0];
				const key = rest.slice(1).join('-');
				if (sub === 'fontFamily') name = `--font-${key}`;
				else if (sub === 'fontSize') name = `--text-${key}`;
				else if (sub === 'fontWeight') name = `--font-weight-${key}`;
				else if (sub === 'lineHeight') name = `--leading-${key}`;
				else name = `--${rest.join('-')}`;
			} else if (category === 'spacing') {
				name = `--spacing-${rest.join('-')}`;
			} else if (category === 'radius') {
				name = `--radius-${rest.join('-')}`;
			} else if (category === 'border') {
				name = rest[0] === 'default' ? '--border' : `--border-${rest.join('-')}`;
			} else if (category === 'shadows') {
				name = `--shadow-${rest.join('-')}`;
			} else {
				name = `--${token.path.join('-')}`;
			}

			return `\t${name}: ${token.original.value};`;
		});

		return `@theme {\n${lines.join('\n')}\n}\n`;
	}
});

export default {
	source: ['tokens.json'],
	platforms: {
		css: {
			transformGroup: 'css',
			buildPath: 'src/',
			files: [
				{
					destination: 'theme.css',
					format: 'css/tailwind-theme'
				}
			]
		}
	}
};
