"use client";
import { FormEvent, useState } from "react";

const portfolio = [
  { tag:"Gestión Académica", title:"Control Estudiantil", text:"Plataforma para centralizar expedientes, seguimiento de notas, asistencia y consultas de estudiantes sin demoras ni inconsistencias.", code:"01", symbol:"{ }" },
  { tag:"Operación Institucional", title:"Sistema de Horarios", text:"Algoritmo y matriz de visualización clara para coordinación de aulas, asignación docente y sincronización sin cruces ni fricciones.", code:"02", symbol:"09:30" },
  { tag:"Presencia Profesional", title:"Estudio Jurídico", text:"Portal institucional de alta distinción diseñado para despachos legales, con sistema confidencial de toma de casos y agendamiento por etapas.", code:"03", symbol:"§" },
];

const hourSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

export default function Home() {
  const [step, setStep] = useState<number>(1);
  const [bookingState, setBookingState] = useState<"idle" | "submitting" | "ready">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Datos de las 4 fases
  const [service, setService] = useState<string>("Página Web Institucional");
  const [modality, setModality] = useState<string>("Virtual");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("10:00");
  const [notification, setNotification] = useState<string>("Correo");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const bookingEndpoint = "https://script.google.com/macros/s/AKfycbyspvm4_98Ebwin6esVxe9OOO83ZC3WkbudrkKORE839ryOcNuIyU6Y2mFsjySIHQAbww/exec";
  const today = new Date().toISOString().split("T")[0];

  function validateStep(targetStep: number): boolean {
    setErrorMessage("");
    if (targetStep === 2 && step === 1) return true;

    if (targetStep === 3 && step === 2) {
      if (!date) {
        setErrorMessage("Por favor elija una fecha para la cita.");
        return false;
      }
      const selected = new Date(date + "T00:00:00");
      const curToday = new Date();
      curToday.setHours(0,0,0,0);
      if (selected < curToday) {
        setErrorMessage("No es posible agendar en fechas pasadas.");
        return false;
      }
      if (!time) {
        setErrorMessage("Por favor seleccione un horario disponible.");
        return false;
      }
      if (selected.getTime() === curToday.getTime()) {
        const curHour = new Date().getHours();
        const selectedHour = parseInt(time.split(":")[0], 10);
        if (selectedHour <= curHour) {
          setErrorMessage("Ese horario ya no está disponible el día de hoy.");
          return false;
        }
      }
      if (modality === "Virtual" && notification === "WhatsApp" && !whatsapp.trim()) {
        setErrorMessage("Por favor ingrese su número de WhatsApp para el enlace.");
        return false;
      }
      return true;
    }

    if (targetStep === 4 && step === 3) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name.trim()) {
        setErrorMessage("Por favor ingrese su nombre y apellido completo.");
        return false;
      }
      if (!email.trim() || !emailRegex.test(email)) {
        setErrorMessage("Por favor ingrese un correo electrónico válido.");
        return false;
      }
      return true;
    }

    return true;
  }

  function nextStep(target: number) {
    if (validateStep(target)) {
      setStep(target);
    }
  }

  async function bookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingState("submitting");
    setErrorMessage("");

    const payload = {
      nombre: name.trim(),
      correo: email.trim(),
      fecha: date,
      hora: time,
      necesidad: service,
      modalidad: modality,
      notificacion: modality === "Virtual" ? notification : "",
      whatsapp: modality === "Virtual" && notification === "WhatsApp" ? whatsapp.trim() : "",
      mensaje: message.trim() || ""
    };

    try {
      const res = await fetch(bookingEndpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "text/plain;charset=utf-8" }
      });
      const responseData = await res.json();
      if (responseData.error) {
        setErrorMessage(responseData.error);
        setBookingState("idle");
        return;
      }
      setBookingState("ready");
    } catch (e) {
      console.error(e);
      setErrorMessage("Error de conexión al registrar la cita. Intente nuevamente.");
      setBookingState("idle");
    }
  }

  return (
    <main>
      {/* Navegación Blanca */}
      <nav className="nav wrap">
        <a className="brand" href="#inicio" aria-label="Vértice Digital">
          <i><img src="/vertice-logo.svg" alt="Emblema Vértice" style={{width:"100%", height:"100%"}}/></i>
          <span>VÉRTICE<br/>ATELIER DIGITAL</span>
        </a>
        <div className="nav-links">
          <a href="#manifiesto">Filosofía</a>
          <a href="#servicios">Ingeniería</a>
          <a href="#portafolio">Obras</a>
          <a href="#nosotros">Fundadores</a>
        </div>
        <a className="nav-contact" href="#agenda">Agendar Sesión <b>↗</b></a>
      </nav>

      {/* Hero */}
      <section id="inicio" className="hero wrap">
        <div className="hero-copy reveal">
          <p className="eyebrow">Arte e Scienza Digital · 1+ Año de Trayectoria</p>
          <h1>Ingeniería precisa.<br/><em>Elegancia</em> sin concesiones.</h1>
          <p className="hero-text">
            Diseñamos y programamos plataformas web institucionales y sistemas a medida para organizaciones que exigen sobriedad, rendimiento milimétrico y una distinción indeleble.
          </p>
          <div className="hero-actions">
            <a className="button" href="#agenda">Iniciar Consulta Privada <span>→</span></a>
            <a className="text-link" href="#portafolio">Explorar Obras ↓</a>
          </div>
          <p className="proof">Est. 2025 · 14+ Proyectos Entregados · Código 100% Propietario</p>
        </div>

        <div className="hero-art reveal delay">
          <img className="hero-photo" src="/vertice-hero.png" alt="Ingeniería Vértice"/>
          <div className="hero-shade"/>
          <img className="hero-mark" src="/vertice-logo.svg" alt="" style={{opacity:0.75}}/>
          <div className="art-caption">
            <span>Precisión & Estrategia</span>
            <span>Edición 2025–2026</span>
          </div>
        </div>
      </section>

      {/* Manifiesto */}
      <section id="manifiesto" className="intro wrap reveal">
        <p className="eyebrow">La Filosofía</p>
        <p className="statement">
          "Donde el rigor del código se funde con la armonía de la belleza."
        </p>
      </section>

      {/* Servicios */}
      <section id="servicios" className="services wrap">
        <div className="section-head reveal">
          <p className="eyebrow">Disciplinas del Atelier</p>
          <h2>Soluciones forjadas a medida de su desafío.</h2>
        </div>
        <div className="service-list">
          <article className="service reveal" onClick={() => { setService("Sistemas & Plataformas a Medida"); window.location.href="#agenda"; }}>
            <span>01</span>
            <div>
              <h3>Sistemas & Plataformas</h3>
              <p>Estructuramos plataformas para ordenar procesos críticos, control de datos, gestión académica o flujos internos con seguridad y escalabilidad.</p>
            </div>
            <b>↗</b>
          </article>
          <article className="service reveal delay-1" onClick={() => { setService("Página Web Institucional"); window.location.href="#agenda"; }}>
            <span>02</span>
            <div>
              <h3>Presencia Institucional</h3>
              <p>Sitios web de porte solemne y alta velocidad para firmas jurídicas, empresas y consultorías que requieren proyectar solidez y reputación.</p>
            </div>
            <b>↗</b>
          </article>
          <article className="service reveal delay-2" onClick={() => { setService("Consultoría & Auditoría Digital"); window.location.href="#agenda"; }}>
            <span>03</span>
            <div>
              <h3>Consultoría Estratégica</h3>
              <p>Evaluamos su infraestructura tecnológica actual y diseñamos una hoja de ruta clara para modernizar sus canales y automatizar tareas operativas.</p>
            </div>
            <b>↗</b>
          </article>
        </div>
      </section>

      {/* Portafolio */}
      <section id="portafolio" className="portfolio">
        <div className="wrap">
          <div className="section-head light reveal">
            <p className="eyebrow">Catálogo de Obras</p>
            <h2>Experiencia comprobada en entornos reales.</h2>
          </div>
          <div className="project-grid">
            {portfolio.map((project, index) => (
              <article className={`project reveal delay-${index}`} key={project.title}>
                <div className={`project-visual visual-${index}`}>
                  <span>{project.code}</span>
                  <strong>{project.symbol}</strong>
                  <em>Explorar</em>
                </div>
                <p className="project-type">{project.tag}</p>
                <h3>{project.title}</h3>
                <p className="project-description">{project.text}</p>
                <a className="project-button" href="#agenda" onClick={() => setService(project.title)}>
                  Solicitar demostración <span>→</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Fundadores */}
      <section id="nosotros" className="about">
        <div className="wrap">
          <div className="about-heading reveal">
            <p className="eyebrow">Dirección Técnica</p>
            <h2>Las mentes detrás de cada obra.</h2>
            <p>Dos artesanos del software que creen que las buenas ideas merecen una ejecución técnica sin fisuras.</p>
          </div>
          <div className="founders">
            <article className="founder-card reveal">
              <div className="founder-top">
                <span>01 · ARQUITECTURA</span>
                <p className="initials">FR</p>
              </div>
              <p className="role">Ingeniería de Software · UDLA</p>
              <h3>Francis Ríos</h3>
              <p>Especialista en estructuración de plataformas complejas, diseño de bases de datos de alto rendimiento y lógica de negocio escalable.</p>
              <div className="founder-line"/>
              <small>Lógica de Negocio · Seguridad · Escalabilidad</small>
            </article>
            <article className="founder-card reveal delay">
              <div className="founder-top">
                <span>02 · EXPERIENCIA</span>
                <p className="initials">KP</p>
              </div>
              <p className="role">Desarrollo Web & Plataformas · ITSQMET</p>
              <h3>Kevin Pedrera</h3>
              <p>Desarrollador web enfocado en la interacción armónica, la estética editorial y la adopción intuitiva en entornos corporativos y educativos.</p>
              <div className="founder-line"/>
              <small>Experiencia de Usuario · Frontend Editorial · Fidelización</small>
            </article>
          </div>
        </div>
      </section>

      {/* Sistema de Agendamiento por Fases */}
      <section id="agenda" className="booking wrap">
        <div className="booking-copy reveal">
          <p className="eyebrow">Consulta Inicial Confidencial</p>
          <h2>Hagamos espacio para su visión.</h2>
          <p>
            Al igual que en los despachos jurídicos de alta jerarquía, llevamos a cabo una consulta inicial confidencial para evaluar la factibilidad técnica y estratégica de su proyecto.
          </p>
          <div className="booking-steps">
            <span>Fase 01 · Materia y Modalidad</span>
            <span>Fase 02 · Agenda y Canal de Acceso</span>
            <span>Fase 03 · Perfil del Solicitante</span>
            <span>Fase 04 · Ficha Técnica y Confirmación</span>
          </div>
        </div>

        <form className="booking-form reveal delay" onSubmit={bookingSubmit}>
          {errorMessage && (
            <div style={{ background: "#fde8e8", borderLeft: "3px solid #b83d31", padding: "12px", color: "#991b1b", fontSize: "0.85rem", marginBottom: "18px" }}>
              {errorMessage}
            </div>
          )}

          {bookingState === "ready" ? (
            <div className="booking-success">
              <span>✓</span>
              <h3>Sesión Acreditada</h3>
              <p>Estimado(a) {name}, hemos acreditado su cita para el {date} a las {time}. En breve recibirá las credenciales en su {modality === "Virtual" && notification === "WhatsApp" ? "WhatsApp" : "correo electrónico"}.</p>
              <button type="button" onClick={() => { setBookingState("idle"); setStep(1); }}>Agendar otra consulta</button>
            </div>
          ) : (
            <>
              {/* Stepper Header */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", borderBottom: "1px solid rgba(45,26,50,0.12)", paddingBottom: "12px", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em" }}>
                <span style={{ color: step === 1 ? "var(--gold)" : "inherit" }}>01. MATERIA</span>
                <span style={{ color: step === 2 ? "var(--gold)" : "inherit" }}>02. AGENDA</span>
                <span style={{ color: step === 3 ? "var(--gold)" : "inherit" }}>03. PERFIL</span>
                <span style={{ color: step === 4 ? "var(--gold)" : "inherit" }}>04. CONFIRMAR</span>
              </div>

              {/* FASE 1 */}
              {step === 1 && (
                <div>
                  <label>Tipo de Requerimiento
                    <select value={service} onChange={(e) => setService(e.target.value)}>
                      <option value="Página Web Institucional">Página Web Institucional</option>
                      <option value="Sistema Web o Plataforma a Medida">Sistema Web o Plataforma a Medida</option>
                      <option value="Consultoría & Transformación Digital">Consultoría & Transformación Digital</option>
                      <option value="Otro Desarrollo Especializado">Otro Desarrollo Especializado</option>
                    </select>
                  </label>

                  <label>Modalidad de la Sesión
                    <select value={modality} onChange={(e) => setModality(e.target.value)}>
                      <option value="Virtual">Sesión Virtual Privada (Videollamada)</option>
                      <option value="Presencial">Reunión Presencial (Quito, Ecuador)</option>
                    </select>
                  </label>

                  <button type="button" className="button submit" onClick={() => nextStep(2)}>
                    Continuar a la Agenda <span>→</span>
                  </button>
                </div>
              )}

              {/* FASE 2 */}
              {step === 2 && (
                <div>
                  <div className="form-row">
                    <label>Fecha Preferida
                      <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
                    </label>
                    <label>Horario Preferido
                      <select value={time} onChange={(e) => setTime(e.target.value)}>
                        {hourSlots.map(h => <option key={h} value={h}>{h} {parseInt(h,10) < 12 ? "AM" : "PM"}</option>)}
                      </select>
                    </label>
                  </div>

                  {modality === "Virtual" && (
                    <div className="form-row">
                      <label>¿Por cuál medio desea recibir el enlace?
                        <select value={notification} onChange={(e) => setNotification(e.target.value)}>
                          <option value="Correo">Correo Electrónico</option>
                          <option value="WhatsApp">WhatsApp</option>
                        </select>
                      </label>
                      {notification === "WhatsApp" ? (
                        <label>Número de WhatsApp
                          <input type="tel" value={whatsapp} placeholder="Ej: +593987654321" onChange={(e) => setWhatsapp(e.target.value)} required />
                        </label>
                      ) : <div/>}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                    <button type="button" onClick={() => setStep(1)} style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontSize: "0.8rem" }}>← Volver</button>
                    <button type="button" className="button" onClick={() => nextStep(3)}>Continuar a Datos <span>→</span></button>
                  </div>
                </div>
              )}

              {/* FASE 3 */}
              {step === 3 && (
                <div>
                  <div className="form-row">
                    <label>Nombre y Apellido *
                      <input type="text" value={name} placeholder="Su nombre completo" onChange={(e) => setName(e.target.value)} required />
                    </label>
                    <label>Correo Electrónico *
                      <input type="email" value={email} placeholder="nombre@organizacion.com" onChange={(e) => setEmail(e.target.value)} required />
                    </label>
                  </div>

                  <label>Contexto previo del requerimiento (Opcional)
                    <textarea value={message} rows={3} placeholder="Breve contexto de su proyecto..." onChange={(e) => setMessage(e.target.value)} />
                  </label>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                    <button type="button" onClick={() => setStep(2)} style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontSize: "0.8rem" }}>← Volver</button>
                    <button type="button" className="button" onClick={() => nextStep(4)}>Revisar Resumen <span>→</span></button>
                  </div>
                </div>
              )}

              {/* FASE 4 */}
              {step === 4 && (
                <div>
                  <div style={{ background: "#ffffff", border: "1px solid rgba(179,134,68,0.35)", padding: "18px", marginBottom: "20px", fontSize: "0.85rem", lineHeight: "1.7", boxShadow: "0 4px 16px rgba(32,23,38,0.05)" }}>
                    <div style={{ fontWeight: 700, color: "var(--ink)", marginBottom: "8px", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.1em" }}>Ficha Técnica de Audiencia Preliminar</div>
                    <div><strong>Materia:</strong> {service}</div>
                    <div><strong>Modalidad:</strong> {modality}</div>
                    <div><strong>Fecha & Hora:</strong> {date} a las {time} (GMT-5)</div>
                    <div><strong>Solicitante:</strong> {name} ({email})</div>
                    {modality === "Virtual" && <div><strong>Canal de Enlace:</strong> {notification === "WhatsApp" ? `WhatsApp (${whatsapp})` : `Correo (${email})`}</div>}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                    <button type="button" onClick={() => setStep(3)} style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontSize: "0.8rem" }}>← Modificar Datos</button>
                    <button type="submit" className="button submit" disabled={bookingState === "submitting"}>
                      {bookingState === "submitting" ? "Creando cita..." : "Confirmar y Registrar Cita →"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </form>
      </section>

      {/* Footer */}
      <footer className="wrap">
        <a className="brand" href="#inicio">
          <i><img src="/vertice-logo.svg" alt="Vértice" style={{width:"100%", height:"100%"}}/></i>
          <span>Vértice Digital Atelier</span>
        </a>
        <p>© 2025–2026 · 1+ Año de Trayectoria · Quito, Ecuador</p>
        <a href="#inicio">Volver arriba ↑</a>
      </footer>
    </main>
  );
}
