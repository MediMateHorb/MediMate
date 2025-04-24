
// Supabase-Initialisierung
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://hgemxpcylwzgkccrgsin.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZW14cGN5bHd6Z2tjY3Jnc2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MTMzNDQsImV4cCI6MjA2MDk4OTM0NH0.0XibsclCI_TN2OjChA9Snkdqh7CKvXfqPfVvAsX_B7o";
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM-Elemente
const medikamentSelect = document.getElementById("medikament");
const berechnenBtn = document.getElementById("berechnen");
const alterInput = document.getElementById("alter");
const gewichtInput = document.getElementById("gewicht");
const ergebnisDiv = document.getElementById("ergebnis");

// Medikamente laden und Dropdown befüllen
async function ladeMedikamente() {
  const { data, error } = await supabase
    .from("medikamente")
    .select("name, kategorie")
    .order("name", { ascending: true });

  if (error) {
    console.error("Fehler beim Laden der Medikamente:", error);
    return;
  }

  medikamentSelect.innerHTML = '<option value="">Bitte wählen...</option>';
  data.forEach((med) => {
    const option = document.createElement("option");
    option.value = med.name;
    option.textContent = `${med.name} (${med.kategorie})`;
    medikamentSelect.appendChild(option);
  });
}

// Dosierung berechnen
async function berechneDosierung() {
  const medName = medikamentSelect.value;
  const alter = parseInt(alterInput.value);
  const gewicht = parseFloat(gewichtInput.value);

  if (!medName || isNaN(alter) || isNaN(gewicht)) {
    alert("Bitte fülle alle Felder korrekt aus.");
    return;
  }

  const { data: dosisData, error: dosisError } = await supabase.rpc("berechne_dosierung", {
    med_name: medName,
    user_alter: alter,
    user_gewicht: gewicht,
  });

  if (dosisError) {
    console.error("Fehler bei der Dosierungsberechnung:", dosisError);
    return;
  }

  const { data: medDetails, error: detailError } = await supabase
    .from("medikamente")
    .select("*")
    .eq("name", medName)
    .single();

  if (detailError) {
    console.error("Fehler beim Abrufen der Medikamentendetails:", detailError);
    return;
  }

  ergebnisDiv.innerHTML = `
    <h3>${medDetails.name}</h3>
    <p><strong>Empfohlene Dosierung:</strong> ${dosisData}</p>
    <p><strong>Wirkstoff:</strong> ${medDetails.wirkstoff}</p>
    <p><strong>Standarddosierung:</strong> ${medDetails.standard_dosierung}</p>
    <p><strong>Einnahmehinweise:</strong> ${medDetails.einnahmehinweise}</p>
    <p><strong>Unverträgliche Nahrung:</strong> ${medDetails.unvertraegliche_nahrung}</p>
    <p><strong>Wechselwirkungen:</strong> ${medDetails.wechselwirkungen}</p>
    <p><strong>Nebenwirkungen:</strong> ${medDetails.nebenwirkungen}</p>
    <p><strong>Einnahmeart:</strong> ${medDetails.einnahmeart}</p>
    <p><strong>Dosisintervall (Std):</strong> ${medDetails.dosis_intervall_std}</p>
    <p><strong>Kategorie:</strong> ${medDetails.kategorie}</p>
  `;
}

// Event-Listener
document.addEventListener("DOMContentLoaded", ladeMedikamente);
berechnenBtn.addEventListener("click", berechneDosierung);
