const supabase = window.supabase.createClient(
  'https://hgemxpcylwzgkccrgsin.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZW14cGN5bHd6Z2tjY3Jnc2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTMzNDQsImV4cCI6MjA2MDk4OTM0NH0.0XibsclCI_TN2OjChA9Snkdqh7CKvXfqPfVvAsX_B7o'
);

async function ladeMedikamente() {
  try {
    const { data, error } = await supabase
      .from('medikamente')
      .select('name, kategorie');

    if (error) {
      console.error('Fehler beim Supabase-Request:', error.message);
      return alert('Fehler beim Laden der Medikamente.');
    }

    if (!data || data.length === 0) {
      console.warn('Keine Medikamente gefunden!');
      return alert('Keine Medikamente in der Datenbank gefunden.');
    }

    const dropdown = document.getElementById('medikamenten-dropdown');
    dropdown.innerHTML = '<option value="">Bitte wählen...</option>';

    data.forEach(med => {
      const option = document.createElement('option');
      option.value = med.name;
      option.textContent = `${med.name} (${med.kategorie})`;
      dropdown.appendChild(option);
    });
  } catch (err) {
    console.error('Fehler beim Laden:', err);
    alert('Fehler beim Abrufen der Medikamentendaten.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ladeMedikamente();

  document.getElementById('berechnen-btn').addEventListener('click', async () => {
    const medName = document.getElementById('medikamenten-dropdown').value;
    const alter = parseInt(document.getElementById('alter').value);
    const gewicht = parseFloat(document.getElementById('gewicht').value);

    if (!medName || isNaN(alter) || isNaN(gewicht)) {
      return alert('Bitte fülle alle Felder korrekt aus.');
    }

    const { data, error } = await supabase.rpc('berechne_dosierung', {
      med_name: medName,
      user_alter: alter,
      user_gewicht: gewicht,
    });

    if (error) {
      console.error('RPC Fehler:', error.message);
      return alert('Fehler bei der Berechnung.');
    }

    const [empf, max] = data.split('|');
    document.getElementById('dosierung-details').innerHTML = `
      <div class="alert alert-success">
        <strong>${medName}</strong><br>
        Empfohlene Dosierung: <strong>${empf.trim()}</strong><br>
        <span>${max.trim()}</span>
      </div>
    `;
    document.getElementById('ergebnis').style.display = 'block';
  });
});
