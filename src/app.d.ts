// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
    interface ImportMetaEnv {
        MONGODB_URI: string;
    }
}

declare module '$env/dynamic/private' {
    export interface Env {
        MONGODB_URI: string;
    }
}

export {};
