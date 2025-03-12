import { env } from '$env/dynamic/private';
import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();
		const resp = await fetch(env.API_URL + '/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-API-KEY': env.API_KEY ?? ''
			},
			body: JSON.stringify(Object.fromEntries(data))
		});
		const json = await resp.json();
		if (json.error) {
			return { error: json.error };
		}
		cookies.set('access_token', json.access_token, { httpOnly: true, path: '/' });
		cookies.set('refresh_token', json.refresh_token, { httpOnly: true, path: '/login' });
		cookies.set('user', JSON.stringify(json.user), { path: '/' });
		redirect(302, '/');
	}
} satisfies Actions;

export async function load(event: RequestEvent) {
	const refreshToken = event.cookies.get('refresh_token');
	const user = event.cookies.get('user');
	if (!refreshToken || !user) {
		return {};
	}
	const userObj = JSON.parse(user);
	const resp = await fetch(env.API_URL + '/refresh', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ refresh_token: refreshToken, email: userObj.email })
	});
	const json = await resp.json();
	if (json.error) {
		return {};
	}
	event.cookies.set('access_token', json.access_token, { httpOnly: true, path: '/' });
	event.cookies.set('refresh_token', json.refresh_token, { httpOnly: true, path: '/login' });
	redirect(302, '/');
}
