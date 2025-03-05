<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';

	type UserSubmission = {
		name: string;
		id: number;
		user_id: number;
		session_id: number;
		yesterday: string[];
		today: string[];
		blockers: string[];
	};
	let userSubmissions = $state<UserSubmission[]>([]);
	let currentUserId = $state(0);

	let id = page.params.id;
	const ws = new WebSocket(env.PUBLIC_WS_URL + `/session/${id}`);
	ws.onmessage = (event) => {
		const data = JSON.parse(event.data);
		if (Array.isArray(data)) {
			userSubmissions = data;
		} else {
			currentUserId = data.user_id;
		}
	};

	const shuffle = () => {
		ws.send(JSON.stringify({ type: 'shuffle' }));
	};

	const openModal = () => {
		const dialog = document.getElementById('sub_modal') as HTMLDialogElement;
		dialog.showModal();
	};

	async function submitForm(e: Event) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		const yesterday = formData.get('yesterday');
		const today = formData.get('today');
		const blockers = formData.get('blockers');

		const res = await fetch(`/api/session/${id}/submit`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ yesterday, today, blockers })
		});

		if (res.ok) {
			const data = await res.json();
			ws.send(JSON.stringify({ type: 'submit', data }));
			form.reset();
			const dialog = document.getElementById('sub_modal') as HTMLDialogElement;
			dialog.close();
		}
	}

	const sendUserChange = (e: Event) => {
		const target = e.target as HTMLAnchorElement;
		const name = target.getAttribute('href')?.slice(1);
		const user_id = userSubmissions.find((user) => user.name === name)?.user_id;
		if (user_id === currentUserId) return;
		ws.send(JSON.stringify({ user_id }));
	};
</script>

<div>
	<dialog id="sub_modal" class="modal">
		<div class="modal-box">
			<p class="">Press ESC key or click outside to close</p>
			<form method="POST" class="dialog flex flex-col space-y-2" onsubmit={submitForm}>
				<textarea
					id="yesterday_box"
					name="yesterday"
					placeholder="Yesterday"
					class="textarea textarea-primary"
				></textarea>
				<textarea id="today_box" name="today" placeholder="Today" class="textarea textarea-primary"
				></textarea>
				<textarea
					id="blockers_box"
					name="blockers"
					placeholder="Blockers"
					class="textarea textarea-primary"
				></textarea>
				<br />
				<button type="submit" class="btn btn-primary">Submit</button>
			</form>
		</div>
		<form method="dialog" class="modal-backdrop">
			<button>close</button>
		</form>
	</dialog>
	<div class="flex flex-col items-center items-center justify-between space-y-2 self-center">
		<div class="flex flex-row space-x-3">
			<button class="btn btn-secondary" onclick={shuffle}>Shuffle</button>
			<button class="btn btn-secondary" onclick={openModal}>Check In</button>
		</div>
		<div class="carousel rounded-box border-secondary h-3/4 w-2/3">
			<h3 class="text-center text-lg font-bold">No submissions - Go on, write something!</h3>
			{#each userSubmissions as submission, ind}
				<div
					class="carousel-item relative top-1/2 flex min-h-full w-full flex-col self-center"
					id={submission.name}
				>
					<div class="absolute top-1/2 right-5 left-5 flex justify-between">
						<a
							href={`#${userSubmissions.at(ind - 1)?.name}`}
							class="btn btn-circle btn-secondary"
							onclick={sendUserChange}>❮</a
						>
						<a
							href={`#${ind + 1 == userSubmissions.length ? userSubmissions.at(0)?.name : userSubmissions.at(ind + 1)?.name}`}
							class="btn btn-circle btn-secondary"
							onclick={sendUserChange}>❯</a
						>
					</div>
					<div class="self-center">
						<h1 class="text-5xl font-bold">{submission.name}</h1>
						<div class="flex flex-col gap-2">
							<h2 class="text-3xl font-bold">Yesterday</h2>
							<ul>
								{#each submission.yesterday as item}
									<li>{item}</li>
								{/each}
							</ul>
						</div>
						<div class="flex flex-col gap-2">
							<h2 class="text-3xl font-bold">Today</h2>
							<ul>
								{#each submission.today as item}
									<li>{item}</li>
								{/each}
							</ul>
						</div>
						<div class="flex flex-col gap-2">
							<h2 class="text-3xl font-bold">Blockers</h2>
							<ul>
								{#each submission.blockers as item}
									<li>{item}</li>
								{/each}
							</ul>
						</div>
					</div>
				</div>
				))
			{/each}
		</div>
		{#if userSubmissions.length > 1}
			<div class="flex w-full justify-center gap-2 py-2">
				{#each userSubmissions as submission}
					<a href={`#${submission.name}`} class="btn btn-xs" onclick={sendUserChange}
						>{submission.name}</a
					>
				{/each}
			</div>
		{/if}
	</div>
</div>
