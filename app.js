// Supabase-Verbindung herstellen
const SUPABASE_URL = 'https://hgemxpcylwzgkccrgsin.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // kürzen bei Veröffentlichung
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elemente abrufen
const select = document.getElementById('medikamentSelect');
const alterInput = document.getElementById('alter');
const gewichtInput = document.getElementById('gewicht');
const ergebnisDiv = document.getElementById('ergebnis');

// Medikamente laden und Dropdown befüllen
async function fetchMedikamente() {
  const { data, error } = await supabase
    .from('medikamente')
    .select('name, kategorie')
    .order('name', { ascending: true });

  if (error) {
    console.error('Fehler beim Laden der Medikamente:', error.message);
    return;
  }

  data.forEach(medikament => {
    const option = document.createElement('option');
    option.value = medikament.name;
    option.textContent = `${medikament.name} (${medikament.kategorie})`;
    select.appendChild(option);
  });
}

fetchMedikamente();

// Dosierung berechnen
async function berechneDosierung() {
  const medikamentName = select.value;
  const alter = parseInt(alterInput.value);
  const gewicht = parseFloat(gewichtInput.value);

  if (!medikamentName || isNaN(alter) || isNaN(gewicht)) {
    ergebnisDiv.innerHTML = `<p style="color: red;">Bitte alle Felder korrekt ausfüllen.</p>`;
    return;
  }

  const { data, error } = await supabase.rpc('berechne_dosierung', {
    med_name: medikamentName,
    user_alter: alter,
    user_gewicht: gewicht
  });

  const { data: details } = await supabase
    .from('medikamente')
    .select('*')
    .eq('name', medikamentName)
    .single();

  if (error || !data || !details) {
    ergebnisDiv.innerHTML = `<p style="color: red;">Fehler bei der Berechnung.</p>`;
    return;
  }

  ergebnisDiv.innerHTML = `
    <h3>${details.name}</h3>
    <p><strong>Empfohlene Dosierung:</strong> ${data}</p>
    <p><strong>Wirkstoff:</strong> ${details.wirkstoff}</p>
    <p><strong>Anwendung:</strong> ${details.einnahmeart}</p>
    <p><strong>Hinweise:</strong> ${details.einnahmehinweise}</p>
    <p><strong>Wechselwirkungen:</strong> ${details.wechselwirkungen}</p>
    <p><strong>Unverträgliche Nahrung:</strong> ${details.unvertraegliche_nahrung}</p>
    <p><strong>Nebenwirkungen:</strong> ${details.nebenwirkungen}</p>
    <p><strong>Maximale Tagesdosis:</strong> ${details.max_tagesdosis}</p>
  `;
}
