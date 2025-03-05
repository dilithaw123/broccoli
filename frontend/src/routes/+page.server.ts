import { env } from '$env/dynamic/private';
import { redirect, type RequestEvent } from '@sveltejs/kit';

export async function load(event: RequestEvent) {
	const accessToken = event.cookies.get('access_token');
	if (!accessToken) {
		redirect(302, '/login');
	}
	const userCookie = event.cookies.get('user');
	const userObj = userCookie ? JSON.parse(userCookie) : null;
	const resp = await fetch(env.API_URL + `/groups/user${userObj.email}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
	if (resp.status === 401) {
		redirect(302, '/login');
	}
	const data = await resp.json();
	return {
		groups: data,
		user: userObj
	};
}
