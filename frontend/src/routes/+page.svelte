<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const startSession = async (group_id: number, group_name: string) => {
		const res = await fetch('/api/session', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ group_id })
		});

		if (res.ok) {
			const data = await res.json();
			console.log(data);
			window.location.href = `/session/${data.id}?groupName=${group_name}`;
		}
	};

	const inviteUser = async (e: Event) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		const group_id = formData.get('group_id');
		const email = formData.get('email');

		const res = await fetch('/api/group/user/add', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ group_id, email })
		});

		if (res.ok) {
			alert('User invited');
		}
	};

	const openModal = () => {
		const dialog = document.getElementById('create_group') as HTMLDialogElement;
		dialog.showModal();
	};

	async function createGroup(e: Event) {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const formData = new FormData(form);
		const name = formData.get('name');

		const res = await fetch('/api/group', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name,
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				email: data.user.email
			})
		});

		if (res.ok) {
			alert('Group created');
			window.location.reload();
		}
	}
</script>

<div class="container mx-auto w-full">
	<h1 class="text-5xl">Broccoli Standups</h1>
	<br />
	<p>Welcome {data.user.name}</p>
	<br />
	<div class="flex w-full flex-col">
		<div>
			<button class="btn btn-secondary" onclick={openModal}>Create Group</button>
			<dialog id="create_group" class="modal">
				<div class="modal-box">
					<form class="dialog flex w-full flex-col space-y-2" onsubmit={createGroup}>
						<input name="name" placeholder="Group Name" class="input input-primary w-full" />
						<br />
						<button type="submit" class="btn btn-primary w-full">Submit</button>
					</form>
				</div>
				<form method="dialog" class="modal-backdrop">
					<button>close</button>
				</form>
			</dialog>
		</div>
		{#if data?.groups?.length > 0}
			{#each data.groups as group}
				<div class="m-5 items-center rounded-md border-2 border-gray-200 p-5">
					<div class="flex flex-row justify-between">
						<h2 class="mb-3 text-2xl font-semibold">{group.name}</h2>
						<div class="flex flex-row space-x-4">
							<button class="btn btn-primary" onclick={() => startSession(group.id, group.name)}>
								Start session
							</button>
							<form method="POST" onsubmit={inviteUser}>
								<input
									type="email"
									name="email"
									placeholder="Email"
									class="input input-bordered input-secondary mr-5"
								/>
								<input type="hidden" name="group_id" value={group.id} />
								<button type="submit" class="btn btn-secondary">Invite</button>
							</form>
						</div>
					</div>
				</div>
			{/each}
		{:else}
			<h2 class="text-2xl font-semibold">No groups found</h2>
			<p class="text-gray-500">Create a group to start a session...</p>
			<p class="text-gray-500">Or ask your group to invite you!</p>
		{/if}
	</div>
</div>
