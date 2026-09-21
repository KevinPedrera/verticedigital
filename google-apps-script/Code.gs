/**
 * Vértice Digital — agenda de primeras conversaciones.
 *
 * 1. Crea una hoja de cálculo y pega su ID en SPREADSHEET_ID.
 * 2. Opcional: pega el ID de un calendario compartido en CALENDAR_ID.
 * 3. Implementar > Nueva implementación > Aplicación web.
 *    Ejecutar como: tú. Acceso: cualquier persona.
 * 4. Copia la URL /exec en bookingEndpoint de app/page.tsx.
 */
const SPREADSHEET_ID = "REEMPLAZAR_CON_ID_DE_HOJA";
const CALENDAR_ID = ""; // Vacío: usa el calendario principal del propietario del Script.

function doPost(event) {
  const data = JSON.parse(event.postData.contents || "{}");
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  if (sheet.getLastRow() === 0) sheet.appendRow(["Fecha de envío", "Nombre", "Correo", "Proyecto", "Modalidad", "Fecha preferida", "Hora preferida", "Mensaje", "Estado"]);
  sheet.appendRow([new Date(), data.name || "", data.email || "", data.project || "", data.modality || "", data.date || "", data.time || "", data.message || "", "Pendiente de confirmación"]);

  if (data.date && data.time) {
    const start = new Date(`${data.date}T${data.time}:00`);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const calendar = CALENDAR_ID ? CalendarApp.getCalendarById(CALENDAR_ID) : CalendarApp.getDefaultCalendar();
    calendar.createEvent(`Solicitud Vértice Digital: ${data.name || "Nueva consulta"}`, start, end, {description:`Proyecto: ${data.project}\nModalidad: ${data.modality}\nCorreo: ${data.email}\nMensaje: ${data.message}`});
  }
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}
