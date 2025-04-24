// Supabase-Initialisierung mit DEINEN Daten
const supabaseUrl = 'https://hgemxpcylwzgkccrgsin.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZW14cGN5bHd6Z2tjY3Jnc2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQwNjY0MjIsImV4cCI6MjAwOTY0MjQyMn0.2c4i7Z4_X_YcT5y-wNFLqG5YIKqHi5R5M8wzZq7qWZk';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Medikamente laden (mit Error-Handling)
async function ladeMedikamente() {
  try {
    const { data, error } = await supabase
      .from('medikamente')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    const dropdown = document.getElementById('medikamenten-dropdown');
    dropdown.innerHTML = '<option value="">Bitte wählen...</option>';

    data.forEach(med => {
      const option = document.createElement('option');
      option.value = med.name;
      option.textContent = `${med.name} (${med.kategorie})`;
      dropdown.appendChild(option);
    });

  } catch (error) {
    console.error('Fehler beim Laden:', error);
    alert('Medikamente konnten nicht geladen werden. Bitte Seite neu laden.');
  }
}

// Event-Listener
document.addEventListener('DOMContentLoaded', () => {
  ladeMedikamente();
  
  document.getElementById('berechnen-btn').addEventListener('click', async () => {
    const medName = document.getElementById('medikamenten-dropdown').value;
    const alter = document.getElementById('alter').value;
    const gewicht = document.getElementById('gewicht').value;

    if (!medName || !alter || !gewicht) {
      alert('Bitte alle Felder ausfüllen!');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('berechne_dosierung', {
        med_name: medName,
        user_alter: alter,
        user_gewicht: gewicht
      });

      if (error) throw error;

      document.getElementById('dosierung-details').innerHTML = `
        <div class="alert alert-success">
          <h4>${medName}</h4>
          <p><strong>Empfohlene Dosierung:</strong> ${data.split('|')[0]}</p>
          <p><strong>${data.split('|')[1]}</strong></p>
        </div>
      `;
      document.getElementById('ergebnis').style.display = 'block';

    } catch (error) {
      console.error('Berechnungsfehler:', error);
      alert('Fehler bei der Berechnung. Bitte Daten prüfen.');
    }
  });
});