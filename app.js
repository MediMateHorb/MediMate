// Supabase-Initialisierung
const supabaseUrl = 'DEINE_SUPABASE_URL';
const supabaseKey = 'DEINE_SUPABASE_ANON_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Medikamenten-Dropdown füllen
async function ladeMedikamente() {
  const { data, error } = await supabase
    .from('medikamente')
    .select('name, kategorie')
    .order('name', { ascending: true });

  const dropdown = document.getElementById('medikamenten-dropdown');
  data.forEach(med => {
    const option = document.createElement('option');
    option.value = med.name;
    option.textContent = `${med.name} (${med.kategorie})`;
    dropdown.appendChild(option);
  });
}

// Dosierung berechnen
async function berechneDosierung() {
  const medName = document.getElementById('medikamenten-dropdown').value;
  const alter = document.getElementById('alter').value;
  const gewicht = document.getElementById('gewicht').value;

  const { data, error } = await supabase.rpc('berechne_dosierung', {
    med_name: medName,
    user_alter: alter,
    user_gewicht: gewicht
  });

  if (data) {
    document.getElementById('dosierung-details').innerHTML = `
      <div class="alert alert-success">
        <h4>${medName}</h4>
        <p><strong>Empfohlene Dosierung:</strong> ${data.split('|')[0]}</p>
        <p><strong>${data.split('|')[1]}</strong></p>
      </div>
      <div class="mt-3">
        <button onclick="speichereDaten()" class="btn btn-outline-primary">
          Daten speichern (optional)
        </button>
      </div>
    `;
    document.getElementById('ergebnis').style.display = 'block';
  }
}

// Optional: Daten speichern
async function speichereDaten() {
  const { error } = await supabase.from('nutzerdaten').insert({
    geschlecht: document.getElementById('geschlecht').value,
    alter: document.getElementById('alter').value,
    gewicht: document.getElementById('gewicht').value
  });
  if (!error) alert('Daten gespeichert!');
}

// Event Listener
document.addEventListener('DOMContentLoaded', ladeMedikamente);
document.getElementById('berechnen-btn').addEventListener('click', berechneDosierung);