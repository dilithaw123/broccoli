import { redirect, type RequestEvent } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
	const accessToken = event.cookies.get('access_token');
	if (!accessToken) {
		redirect(302, '/login');
	}
}
