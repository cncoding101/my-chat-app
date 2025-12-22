class NavbarStore {
	isOpen = $state(false);

	toggle() {
		this.isOpen = !this.isOpen;
	}

	open() {
		this.isOpen = true;
	}

	close() {
		this.isOpen = false;
	}
}

export const navbarStore = new NavbarStore();
