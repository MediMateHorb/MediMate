const supabase = window.supabase.createClient(
  'https://hgemxpcylwzgkccrgsin.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZW14cGN5bHd6Z2tjY3Jnc2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTMzNDQsImV4cCI6MjA2MDk4OTM0NH0.0XibsclCI_TN2OjChA9Snkdqh7CKvXfqPfVvAsX_B7o'
);

async function ladeMedikamente() {
  const { data, error } = await supabase
    .from('medikamente')
    .select('name, kategorie');

  const dropdown = document.getElementById('medikamenten-dropdown');
  dropdown.innerHTML = '<option value="">Bitte wählen...</option>';

  if (data) {
    data.forEach(med => {
      const option = document.createElement('option');
      option.value = med.name;
      option.textContent = `${med.name} (${med.kategorie})`;
      dropdown.appendChild(option);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ladeMedikamente();

  document.getElementById('berechnen-btn').addEventListener('click', async () => {
    const medName = document.getElementById('medikamenten-dropdown').value;
    const alter = parseInt(document.getElementById('alter').value);
    const gewicht = parseFloat(document.getElementById('gewicht').value);

    if (!medName || isNaN(alter) || isNaN(gewicht)) {
      return alert('Bitte wähle ein Medikament und gib Alter & Gewicht ein.');
    }

    // Dosierung berechnen
    const { data: dosierung, error: dosierungErr } = await supabase.rpc('berechne_dosierung', {
      med_name: medName,
      user_alter: alter,
      user_gewicht: gewicht,
    });

    if (dosierungErr) {
      return alert('Fehler bei der Dosierungsberechnung.');
    }

    // Alle Infos zum Medikament laden
    const { data: details, error: detailsErr } = await supabase
      .from('medikamente')
      .select('*')
      .eq('name', medName)
      .single();

    if (detailsErr) {
      return alert('Fehler beim Laden der Medikamentendetails.');
    }

    // Anzeige
    document.getElementById('dosierung-details').innerHTML = `
      <div class="alert">
        <strong>${details.name}</strong><br />
        <em>Wirkstoff:</em> ${details.wirkstoff}<br />
        <em>Kategorie:</em> ${details.kategorie}<br /><br />

        <strong>Empfohlene Dosierung:</strong> ${dosierung}<br />
        <strong>Maximale Tagesdosis:</strong> ${details.max_tagesdosis}<br /><br />

        <strong>Einnahmehinweise:</strong> ${details.einnahmehinweise}<br />
        <strong>Einnahmeart:</strong> ${details.einnahmeart}<br />
        <strong>Dosisintervall (Std):</strong> ${details.dosis_intervall_std}<br /><br />

        <strong>Unverträgliche Nahrung:</strong> ${details.unvertraegliche_nahrung}<br />
        <strong>Wechselwirkungen:</strong> ${details.wechselwirkungen}<br />
        <strong>Nebenwirkungen:</strong> ${details.nebenwirkungen}
      </div>
    `;

    document.getElementById('ergebnis').style.display = 'block';
  });
});
