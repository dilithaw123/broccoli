<div class="flex h-screen w-screen items-center justify-center">
	<div class="w-full max-w-md px-4">
		<h1 class="mb-6 text-center text-2xl">Login to Broccoli</h1>
		<form class="flex flex-col space-y-4" method="POST">
			<label class="input w-full">
				<span class="label w-2/6">username</span>
				<input type="text" id="username" name="name" required class="w-full" />
			</label>
			<label class="input w-full">
				<span class="label w-2/6">email</span>
				<input type="email" id="email" name="email" required class="w-full" />
			</label>
			<button type="submit" class="btn btn-primary mt-4 w-full" formaction="?/login">Login</button>
		</form>
	</div>
</div>
