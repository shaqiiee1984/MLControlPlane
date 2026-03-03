// Minimal local SDK shim to avoid external @base44 dependency.
// Provides `createClient` and `createAxiosClient` with a lightweight fetch-based implementation.

export function createAxiosClient({ baseURL = '', headers = {}, token = undefined, interceptResponses = false } = {}) {
	const call = async (method, path, opts = {}) => {
		const url = path.startsWith('http') ? path : `${baseURL}${path}`;
		const res = await fetch(url, {
			method,
			headers: {
				'Content-Type': 'application/json',
				...headers,
				...(token ? { Authorization: `Bearer ${token}` } : {})
			},
			body: opts.body ? JSON.stringify(opts.body) : undefined,
		});
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			const err = new Error(text || res.statusText);
			err.status = res.status;
			try { err.data = JSON.parse(text); } catch (e) { err.data = text; }
			throw err;
		}
		const ct = res.headers.get('content-type') || '';
		if (ct.includes('application/json')) return res.json();
		return res.text();
	};

	return {
		get: (p) => call('GET', p),
		post: (p, body) => call('POST', p, { body }),
		put: (p, body) => call('PUT', p, { body }),
		delete: (p) => call('DELETE', p),
	};
}

export function createClient({ appId, token, functionsVersion, serverUrl = '', requiresAuth = false, appBaseUrl = '' } = {}) {
	const base = appBaseUrl || '';

	const auth = {
		me: async () => {
			// attempt relative endpoint first
			try {
				return await fetch('/api/auth/me').then(r => r.ok ? r.json() : Promise.reject(r));
			} catch (e) {
				// no backend available; return null
				throw { status: 401, message: 'Not authenticated' };
			}
		},
		logout: (redirectUrl) => {
			try { fetch('/api/auth/logout', { method: 'POST' }); } catch (e) { }
			if (redirectUrl) window.location.href = redirectUrl;
		},
		redirectToLogin: (redirectUrl) => {
			const url = `/login${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`;
			window.location.href = url;
		}
	};

	const entities = new Proxy({}, {
		get(_, entityName) {
			return {
				list: async (sort, limit) => {
					const qs = [];
					if (sort) qs.push(`sort=${encodeURIComponent(sort)}`);
					if (limit) qs.push(`limit=${encodeURIComponent(limit)}`);
					const q = qs.length ? `?${qs.join('&')}` : '';
					try {
						const res = await fetch(`/api/entities/${entityName}${q}`);
						if (!res.ok) return [];
						return await res.json();
					} catch (e) {
						return [];
					}
				},
				create: async (body) => {
					const res = await fetch(`/api/entities/${entityName}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
					if (!res.ok) throw new Error('Create failed');
					return res.json();
				},
				update: async (id, body) => {
					const res = await fetch(`/api/entities/${entityName}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
					if (!res.ok) throw new Error('Update failed');
					return res.json();
				},
				delete: async (id) => {
					await fetch(`/api/entities/${entityName}/${id}`, { method: 'DELETE' });
					return true;
				}
			};
		}
	});

	return { auth, entities };
}
