export async function detectLanguageForAudio(input: { file?: File | Blob; audioUrl?: string }): Promise<'en' | 'ar'> {
  const form = new FormData();
  if (input.file) form.append('file', input.file);
  if (input.audioUrl) form.append('audioUrl', input.audioUrl);

  const res = await fetch('/api/detect-language', { method: 'POST', body: form });
  if (!res.ok) {
    let msg = `HTTP ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {}
    throw new Error(msg);
  }
  const data = (await res.json()) as { success: boolean; language?: string; error?: string };
  if (!data.success || !data.language) {
    throw new Error(data.error || 'Language detection failed');
  }
  return data.language === 'ar' ? 'ar' : 'en';
}
