import { user } from '$lib/schemas/storage';
import { createStorageInterface } from '$lib/storage';
import { browser } from '$app/environment';

const storage = createStorageInterface({
	schema: user.schema,
	captureException: (error: unknown) => {
		console.error(error);
	}
});

export const prefs = $state(storage.get('userPreferences'));

export const userStorage = {
	setSidebarOpen: (isOpen: boolean) => {
		prefs.sidebar.isOpen = isOpen;
		storage.set('userPreferences', prefs);
		if (browser) {
			document.cookie = `sidebarOpen=${isOpen}; path=/; max-age=31536000; SameSite=Lax`;
		}
	}
};
