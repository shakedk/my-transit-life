const dev = process.env.NODE_ENV !== 'production';

export const server = dev ? 'http://localhost:3003' : 'UNDEFINED SERVER';

