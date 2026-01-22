import { userStorage, prefs } from '$lib/storage/user.svelte';

class NavbarStore {
	#isInitialized = $state(false);
	#serverOpen = $state(true);

	get isOpen() {
		if (!this.#isInitialized) {
			return this.#serverOpen;
		}
		return prefs.sidebar.isOpen;
	}

	setServerOpen(isOpen: boolean) {
		this.#serverOpen = isOpen;
	}

	initialize() {
		this.#isInitialized = true;
	}

	toggle() {
		userStorage.setSidebarOpen(!this.isOpen);
	}

	open() {
		userStorage.setSidebarOpen(true);
	}

	close() {
		userStorage.setSidebarOpen(false);
	}
}

export const navbarStore = new NavbarStore();
