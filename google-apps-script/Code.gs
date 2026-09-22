/**
 * VÉRTICE DIGITAL · ENGINE DE CITAS & GESTIÓN ADMINISTRATIVA
 *
 * Estructura de almacenamiento:
 * 1. "Citas_Vertice": Registro clasificado con Fecha y Hora en columnas independientes.
 * 2. "Admin_Users": Usuarios y credenciales de acceso al panel institucional.
 */

const SHEET_NAME_CITAS = 'Citas_Vertice';
const SHEET_NAME_ADMIN = 'Admin_Users';

// Inicializa o recupera el registro de administradores
function getOrCreateAdminSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME_ADMIN);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME_ADMIN);
    sheet.appendRow(['Usuario', 'Password', 'Rol', 'Fecha_Creacion']);
    sheet.appendRow(['admin', 'vertice2026', 'Administrador', new Date().toISOString()]);
  }
  return sheet;
}

// Inicializa o adapta el registro de citas con Fecha y Hora separadas
function getOrCreateCitasSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME_CITAS);
  if (!sheet) {
    sheet = ss.getSheetByName('Hoja 1') || ss.insertSheet(SHEET_NAME_CITAS);
  }

  // Si la hoja está totalmente vacía, crear encabezados de columnas
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Marca temporal',
      'Nombre',
      'Correo',
      'Fecha',
      'Hora',
      'Necesidad',
      'Modalidad',
      'Notificación',
      'WhatsApp',
      'Mensaje'
    ]);
  } else {
    // Si ya existen encabezados pero falta la columna de Hora, la insertamos
    const lastCol = sheet.getLastColumn();
    if (lastCol >= 4) {
      const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      const headersLower = headers.map(h => String(h).trim().toLowerCase());
      if (!headersLower.includes('hora')) {
        sheet.insertColumnAfter(4);
        sheet.getRange(1, 5).setValue('Hora');
        sheet.getRange(1, 4).setValue('Fecha');
      }
    }
  }

  return sheet;
}

// Extrae y normaliza Fecha (YYYY-MM-DD) y Hora (HH:mm)
function parseFechaYHora(rawFecha, rawHora) {
  let fecha = String(rawFecha || '').trim();
  let hora = String(rawHora || '').trim();

  // Si la fecha contiene espacio "2026-09-22 10:00"
  if (fecha.includes(' ') && !hora) {
    const parts = fecha.split(' ');
    fecha = parts[0];
    hora = parts.slice(1).join(' ');
  } else if (fecha.includes('T') && !hora) {
    // Formato ISO "2026-09-22T10:00:00.000Z"
    const d = new Date(fecha);
    if (!isNaN(d.getTime())) {
      fecha = d.toISOString().split('T')[0];
      hora = d.toTimeString().split(' ')[0].substring(0, 5);
    }
  }

  return { fecha, hora };
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);

    // ========================================================
    // 1. AUTENTICACIÓN SEGURA AL PANEL
    // ========================================================
    if (data.action === 'login') {
      const adminSheet = getOrCreateAdminSheet(ss);
      let rows = adminSheet.getDataRange().getValues();

      if (rows.length <= 1) {
        adminSheet.appendRow(['admin', 'vertice2026', 'Administrador', new Date().toISOString()]);
        rows = adminSheet.getDataRange().getValues();
      }

      let authenticated = false;
      let userRole = '';

      for (let i = 1; i < rows.length; i++) {
        const sheetUser = String(rows[i][0]).trim();
        const sheetPass = String(rows[i][1]).trim();

        if (sheetUser.toLowerCase() === String(data.usuario).trim().toLowerCase() && sheetPass === String(data.password).trim()) {
          authenticated = true;
          userRole = rows[i][2] || 'Administrador';
          break;
        }
      }

      if (authenticated) {
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          user: data.usuario,
          role: userRole,
          token: Utilities.base64Encode(data.usuario + ':' + new Date().getTime())
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Credenciales inválidas.'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // ========================================================
    // 2. ELIMINAR CITA
    // ========================================================
    if (data.action === 'deleteCita') {
      const sheet = getOrCreateCitasSheet(ss);
      const allData = sheet.getDataRange().getValues();

      const targetFecha = String(data.fecha || '').trim();
      const targetHora = String(data.hora || '').trim();
      const targetTs = String(data.timestamp || '').trim();

      for (let i = 1; i < allData.length; i++) {
        const rowTs = String(allData[i][0]).trim();
        const rowFecha = String(allData[i][3]).trim();
        const rowHora = String(allData[i][4]).trim();

        const matchTs = targetTs && rowTs === targetTs;
        const matchFechaHora = targetFecha && (rowFecha === targetFecha) && (!targetHora || rowHora === targetHora);

        if (matchTs || matchFechaHora) {
          sheet.deleteRow(i + 1);
          return ContentService.createTextOutput(JSON.stringify({ result: 'deleted' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ result: 'not_found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ========================================================
    // 3. REGISTRO DE CITA (FECHA Y HORA EN CELDAS SEPARADAS)
    // ========================================================
    const sheet = getOrCreateCitasSheet(ss);
    const { fecha, hora } = parseFechaYHora(data.fecha, data.hora);
    const allData = sheet.getDataRange().getValues();

    // Verificación de disponibilidad horaria (anti-duplicidad)
    if (fecha && hora) {
      for (let i = 1; i < allData.length; i++) {
        const rowFecha = String(allData[i][3]).trim();
        const rowHora = String(allData[i][4]).trim();
        if (rowFecha === fecha && rowHora === hora) {
          return ContentService.createTextOutput(JSON.stringify({
            error: 'Ese horario ya se encuentra reservado. Por favor seleccione otro turno.'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Guardado clasificado
    sheet.appendRow([
      new Date().toISOString(),
      data.nombre || '',
      data.correo || '',
      fecha,
      hora,
      data.necesidad || '',
      data.modalidad || '',
      data.notificacion || '',
      data.whatsapp || '',
      data.mensaje || ''
    ]);

    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Error en el servidor: ' + error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (e && e.parameter && e.parameter.action === 'getCitas') {
      const sheet = getOrCreateCitasSheet(ss);
      const data = sheet.getDataRange().getValues();

      if (data.length <= 1) {
        return ContentService.createTextOutput(JSON.stringify([]))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const headers = data[0];
      const rows = data.slice(1);

      const result = rows.map(row => {
        let obj = {};
        row.forEach((val, index) => {
          const key = String(headers[index]).toLowerCase().replace(/[\s_]/g, '');
          obj[key] = val;
        });
        return obj;
      });

      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput("API Vértice Digital activa.");
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
