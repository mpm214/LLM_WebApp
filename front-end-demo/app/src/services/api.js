const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export async function searchArXiv(query) {
  const response = await fetch(`${API_BASE_URL}/arxiv/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.details || data.error || 'ArXiv search failed');
  return data;
}

export async function queryQdrant(query) {
  const response = await fetch(`${API_BASE_URL}/qdrant/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!response.ok) throw new Error('Qdrant query failed');
  return await response.json();
}