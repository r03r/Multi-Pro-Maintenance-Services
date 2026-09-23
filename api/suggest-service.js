import { handleSuggestion } from '../server/jev.js';

export default { fetch: request => handleSuggestion(request) };
