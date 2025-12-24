
interface API_URL {
	PROTOCOL: string;
	DOMAIN: string;
	PORT: string;
}

export const buildApiUrl = ({ PROTOCOL, DOMAIN, PORT } : API_URL) => {
	return `${PROTOCOL}://${DOMAIN}:${PORT}`;
};