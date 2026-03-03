// Minimal local SDK shim to avoid external @base44 dependency.
// Provides `createClient` and `createAxiosClient` with a lightweight fetch-based implementation.
// Falls back to the localStorage mock store when the API is unavailable.

import { mockStore } from './mock-store';

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

// ── Entity proxy backed by mock store (with optional real-API passthrough) ──

function makeEntityProxy() {
	return new Proxy({}, {
		get(_, entityName) {
			const store = mockStore(entityName);
			return {
				list: async (sort, limit) => {
					// Try real API first; fall back to mock on failure or empty
					try {
						const qs = [];
						if (sort) qs.push(`sort=${encodeURIComponent(sort)}`);
						if (limit) qs.push(`limit=${encodeURIComponent(limit)}`);
						const q = qs.length ? `?${qs.join('&')}` : '';
						const res = await fetch(`/api/entities/${entityName}${q}`);
						if (res.ok) {
							const data = await res.json();
							if (Array.isArray(data) && data.length > 0) return data;
						}
					} catch (_) { /* no backend – fall through to mock */ }
					return store.list(sort, limit);
				},
				create: async (body) => {
					try {
						const res = await fetch(`/api/entities/${entityName}`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(body),
						});
						if (res.ok) return res.json();
					} catch (_) { /* no backend */ }
					return store.create(body);
				},
				update: async (id, body) => {
					try {
						const res = await fetch(`/api/entities/${entityName}/${id}`, {
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(body),
						});
						if (res.ok) return res.json();
					} catch (_) { /* no backend */ }
					return store.update(id, body);
				},
				delete: async (id) => {
					try {
						await fetch(`/api/entities/${entityName}/${id}`, { method: 'DELETE' });
					} catch (_) { /* no backend */ }
					return store.delete(id);
				},
			};
		}
	});
}

export function createClient({ appId, token, functionsVersion, serverUrl = '', requiresAuth = false, appBaseUrl = '' } = {}) {
	const auth = {
		me: async () => {
			try {
				return await fetch('/api/auth/me').then(r => r.ok ? r.json() : Promise.reject(r));
			} catch (e) {
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

	const entities = makeEntityProxy();

	return { auth, entities };
}
