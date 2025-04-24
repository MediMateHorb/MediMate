// Supabase Initialisierung
const supabaseUrl = 'https://hgemxpcylwzgkccrgsin.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZW14cGN5bHd6Z2tjY3Jnc2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTMzNDQsImV4cCI6MjA2MDk4OTM0NH0.0XibsclCI_TN2OjChA9Snkdqh7CKvXfqPfVvAsX_B7o';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Medikamente laden
async function ladeMedikamente() {
  try {
    const { data, error } = await supabase
      .from('medikamente')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    const dropdown = document.getElementById('medikamenten-dropdown');
    dropdown.innerHTML = '<option value="">Bitte wählen.</option>';

    data.forEach(med => {
      const option = document.createElement('option');
      option.value = med.name;
      option.textContent = `${med.name} (${med.kategorie})`;
      dropdown.appendChild(option);
    });
  } catch (err) {
    console.error('Fehler beim Laden:', err);
    alert('Fehler beim Laden der Medikamente.');
  }
}

// EventListener nach DOM-Load
document.addEventListener('DOMContentLoaded', () => {
  ladeMedikamente();

  document.getElementById('berechnen-btn').addEventListener('click', async () => {
    const medName = document.getElementById('medikamenten-dropdown').value;
    const alter = parseInt(document.getElementById('alter').value);
    const gewicht = parseFloat(document.getElementById('gewicht').value);

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

      const [dosis, maximal] = data.split('|');

      document.getElementById('dosierung-details').innerHTML = `
        <div class="alert alert-info">
          <h4>${medName}</h4>
          <p><strong>Empfohlene Dosis:</strong> ${dosis}</p>
          <p><strong>${maximal}</strong></p>
        </div>
      `;
      document.getElementById('ergebnis').style.display = 'block';

    } catch (err) {
      console.error('Berechnungsfehler:', err);
      alert('Berechnung nicht möglich.');
    }
  });
});
