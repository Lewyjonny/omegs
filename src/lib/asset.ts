export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

/** Resolves an uploaded image URL or a bundled image path to a usable src. */
export const imageSrc = (pathOrUrl: string) => (/^(https?:|data:|blob:)/.test(pathOrUrl) ? pathOrUrl : asset(pathOrUrl));
