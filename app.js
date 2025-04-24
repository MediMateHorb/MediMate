
const SUPABASE_URL = "https://hgemxpcylwzgkccrgsin.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZW14cGN5bHd6Z2tjY3Jnc2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTMzNDQsImV4cCI6MjA2MDk4OTM0NH0.0XibsclCI_TN2OjChA9Snkdqh7CKvXfqPfVvAsX_B7o";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const dropdown = document.getElementById("medikamenten-dropdown");
const berechnenBtn = document.getElementById("berechnen-btn");
const ergebnisDiv = document.getElementById("ergebnis");
const detailsDiv = document.getElementById("dosierung-details");

// Medikamente laden
async function ladeMedikamente() {
  const { data, error } = await supabase
    .from("medikamente")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Fehler beim Laden der Medikamente:", error);
    return;
  }

  data.forEach((med) => {
    const option = document.createElement("option");
    option.value = med.name;
    option.textContent = `${med.name} (${med.kategorie})`;
    dropdown.appendChild(option);
  });
}

ladeMedikamente();

berechnenBtn.addEventListener("click", async () => {
  const name = dropdown.value;
  const alter = parseInt(document.getElementById("alter").value);
  const gewicht = parseFloat(document.getElementById("gewicht").value);

  if (!name || isNaN(alter) || isNaN(gewicht)) {
    alert("Bitte alle Felder korrekt ausfüllen.");
    return;
  }

  const { data, error } = await supabase.rpc("berechne_dosierung", {
    med_name: name,
    user_alter: alter,
    user_gewicht: gewicht,
  });

  const { data: details } = await supabase
    .from("medikamente")
    .select("*")
    .eq("name", name)
    .single();

  if (error || !details) {
    console.error("Fehler beim Abrufen der Dosierung oder Details:", error);
    return;
  }

  detailsDiv.innerHTML = `
    <h3>${details.name}</h3>
    <p><strong>Empfohlene Dosierung:</strong> ${data}</p>
    <p><strong>Wirkstoff:</strong> ${details.wirkstoff}</p>
    <p><strong>Anwendung:</strong> ${details.einnahmehinweise}</p>
    <p><strong>Art der Einnahme:</strong> ${details.einnahmeart}</p>
    <p><strong>Unverträgliche Nahrung:</strong> ${details.unvertraegliche_nahrung}</p>
    <p><strong>Wechselwirkungen:</strong> ${details.wechselwirkungen}</p>
    <p><strong>Nebenwirkungen:</strong> ${details.nebenwirkungen}</p>
  `;

  ergebnisDiv.style.display = "block";
});
