"use client";
import { FormEvent, useState } from "react";

const portfolio = [
  { tag:"Gestión académica", title:"Control estudiantil", text:"Una experiencia pensada para ordenar registro, consulta y seguimiento académico.", code:"01", action:"Ver demostración" },
  { tag:"Operación institucional", title:"Sistema de horarios", text:"Información clara para docentes, estudiantes y coordinación, sin cruces innecesarios.", code:"02", action:"Solicitar acceso" },
  { tag:"Presencia profesional", title:"Estudio jurídico", text:"Un sitio institucional que transmite confianza y guía al visitante hacia el contacto.", code:"03", action:"Ver caso" },
];

export default function Home() {
  const [portfolioMessage, setPortfolioMessage] = useState("");
  const [bookingState, setBookingState] = useState<"idle"|"submitting"|"ready">("idle");
  const [modality, setModality] = useState("virtual");
  const [notification, setNotification] = useState("Correo");

  // Configura aquí tu URL de Apps Script cuando la tengas
  const bookingEndpoint = "https://script.google.com/macros/s/AKfycbx3swhCUwmoGW7Y2pspvjthqHaJfaNAVkwnjmqjNvAUclLPd76K7VDahIpsI3e5JanH2w/exec"; 

  const today = new Date().toISOString().split("T")[0]; // Para validar fechas pasadas

  async function bookingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingState("submitting");
    const form = new FormData(event.currentTarget);
    const formData = Object.fromEntries(form);

    // Formatear los datos para que coincidan con las columnas de Google Sheets (Apps Script)
    const payload = {
      nombre: formData.name,
      correo: formData.email,
      fecha: `${formData.date} ${formData.time}`,
      necesidad: formData.project,
      modalidad: formData.modality,
      notificacion: formData.modality === 'virtual' ? formData.notification : '',
      whatsapp: formData.modality === 'virtual' && formData.notification === 'WhatsApp' ? formData.whatsapp : '',
      mensaje: formData.message || ''
    };

    if (bookingEndpoint) {
      try {
        const res = await fetch(bookingEndpoint, { 
          method:"POST", 
          body:JSON.stringify(payload), 
          headers:{"Content-Type":"text/plain;charset=utf-8"} 
        });
        
        // Intentar leer la respuesta (requiere que el Apps Script envíe los headers CORS)
        const responseData = await res.json();
        if (responseData.error) {
          alert(responseData.error);
          setBookingState("idle");
          return; // Detener flujo si hay error (ej. cita ocupada)
        }
      } catch(e) {
        console.error("Error al conectar con Sheets:", e);
      }
    }
    
    setBookingState("ready");
  }

  return <main>
    <nav className="nav wrap"><a className="brand" href="#inicio" aria-label="Vértice Digital, inicio"><i><img src="/vertice-mark.png" alt=""/></i><span>Vértice<br/>Digital</span></a><div className="nav-links"><a href="#servicios">Servicios</a><a href="#portafolio">Portafolio</a><a href="#nosotros">Nosotros</a></div><a className="nav-contact" href="#agenda">Agendar <b>↗</b></a></nav>

    <section id="inicio" className="hero wrap"><div className="hero-copy reveal"><p className="eyebrow">Estudio digital · Ecuador</p><h1>Su operación<br/>más clara.<br/><em>Su marca</em> más visible.</h1><p className="hero-text">Creamos sistemas y sitios web que convierten procesos dispersos en experiencias simples para su equipo y sus clientes.</p><div className="hero-actions"><a className="button" href="#agenda">Conversemos sobre su proyecto <span>→</span></a><a className="text-link" href="#portafolio">Conozca nuestro trabajo ↓</a></div><p className="proof">Desarrollo a medida · Sitios institucionales · Acompañamiento remoto</p></div><div className="hero-art reveal delay"><img className="hero-photo" src="/vertice-hero.png" alt="Composición abstracta sobre orden, estrategia y tecnología"/><div className="hero-shade"/><img className="hero-mark" src="/vertice-mark.png" alt=""/><div className="art-caption"><span>Desarrollo + estrategia</span><span>2026</span></div></div></section>

    <section className="intro wrap reveal"><p className="eyebrow">Nuestro punto de partida</p><p className="statement">No se trata de tener más tecnología. Se trata de contar con la herramienta adecuada, bien diseñada y fácil de usar.</p></section>

    <section id="servicios" className="services wrap"><div className="section-head reveal"><p className="eyebrow">Lo que hacemos</p><h2>Diseño digital<br/>con propósito.</h2></div><div className="service-list"><article className="service reveal"><span>01</span><div><h3>Sistemas web</h3><p>Plataformas a medida para organizar procesos y centralizar información importante.</p></div><b>↗</b></article><article className="service reveal delay-1"><span>02</span><div><h3>Presencia institucional</h3><p>Sitios claros, rápidos y administrables para mostrar una organización con seriedad.</p></div><b>↗</b></article><article className="service reveal delay-2"><span>03</span><div><h3>Estrategia digital</h3><p>Una propuesta concreta para que su marca comunique mejor y llegue a las personas correctas.</p></div><b>↗</b></article></div></section>

    <section id="portafolio" className="portfolio"><div className="wrap"><div className="section-head light reveal"><p className="eyebrow">Experiencia seleccionada</p><h2>Proyectos que<br/>puede explorar.</h2></div><div className="project-grid">{portfolio.map((project,index)=><article className={`project reveal delay-${index}`} key={project.title}><div className={`project-visual visual-${index}`}><span>{project.code}</span><strong>{index===0?"{ }":index===1?"09:30":"§"}</strong><em>Explorar</em></div><p className="project-type">{project.tag}</p><h3>{project.title}</h3><p className="project-description">{project.text}</p><button className="project-button" onClick={()=>setPortfolioMessage(`La demostración de “${project.title}” se entregará con datos ficticios para proteger la información real. Agende una conversación y la prepararemos para usted.`)}>{project.action} <span>→</span></button></article>)}</div>{portfolioMessage&&<div className="portfolio-note" role="status"><span>↗</span><p>{portfolioMessage}</p><button onClick={()=>setPortfolioMessage("")}>Cerrar</button></div>}</div></section>

    <section id="nosotros" className="about"><div className="wrap"><div className="about-heading reveal"><p className="eyebrow">Detrás de Vértice</p><h2>Un sueño compartido:<br/><em>crear soluciones</em><br/>que abran camino.</h2><p>Vértice Digital nace de dos desarrolladores que creen que las buenas ideas merecen una ejecución clara, cercana y bien hecha.</p></div><div className="founders"><article className="founder-card reveal"><div className="founder-top"><span>01</span><p className="initials">FR</p></div><p className="role">Ingeniería de Software · UDLA</p><h3>Francis Ríos</h3><p>Desarrollador de software orientado a convertir necesidades complejas en soluciones funcionales, ordenadas y escalables.</p><div className="founder-line"/><small>Desarrollo · Arquitectura · Lógica</small></article><article className="founder-card reveal delay"><div className="founder-top"><span>02</span><p className="initials">KP</p></div><p className="role">Desarrollo de Software · ITSQMET</p><h3>Kevin Pedrera</h3><p>Desarrollador web con experiencia práctica creando y administrando soluciones digitales para el entorno educativo.</p><div className="founder-line"/><small>Web · Instituciones · Experiencia digital</small></article></div></div></section>

    <section id="agenda" className="booking wrap"><div className="booking-copy reveal"><p className="eyebrow">Primera conversación</p><h2>Hagamos espacio<br/>para su idea.</h2><p>Elija el tipo de proyecto y cómo prefiere conversar. La primera orientación es remota o presencial según disponibilidad.</p><div className="booking-steps"><span>01 · Cuéntenos qué necesita</span><span>02 · Elegimos fecha y modalidad</span><span>03 · Le confirmamos la cita</span></div></div><form className="booking-form reveal delay" onSubmit={bookingSubmit}>{bookingState==="ready"?<div className="booking-success"><span>✓</span><h3>Cita solicitada exitosamente.</h3><p>Hemos recibido sus datos en nuestro sistema. Nos pondremos en contacto con usted pronto.</p><button type="button" onClick={()=>setBookingState("idle")}>Agendar otra cita</button></div>:<><div className="form-row"><label>Nombre<input required name="name" placeholder="Su nombre"/></label><label>Correo<input required type="email" name="email" placeholder="nombre@correo.com"/></label></div><label>¿Qué necesita?<select required name="project" defaultValue=""><option value="" disabled>Seleccione una opción</option><option>Página web</option><option>Programa o sistema web</option><option>Consultoría — aún no tengo claro qué necesito</option><option>Otro proyecto</option></select></label><label>Modalidad<select required name="modality" value={modality} onChange={(e) => setModality(e.target.value)}><option value="virtual">Virtual</option><option value="presencial">Presencial</option></select></label>
      
      {modality === "virtual" && (
        <div className="form-row">
          <label>¿Dónde desea recibir el enlace?<select required name="notification" value={notification} onChange={(e) => setNotification(e.target.value)}><option value="Correo">Correo Electrónico</option><option value="WhatsApp">WhatsApp</option></select></label>
          {notification === "WhatsApp" ? (
            <label>Número de WhatsApp<input required type="tel" name="whatsapp" placeholder="Ej: +593987654321"/></label>
          ) : <label style={{visibility: 'hidden'}}><input/></label>}
        </div>
      )}

      <div className="form-row"><label>Fecha preferida<input required type="date" name="date" min={today}/></label><label>Hora preferida<select required name="time" defaultValue=""><option value="" disabled>Seleccione una hora</option><option>09:00</option><option>11:00</option><option>15:00</option><option>17:00</option></select></label></div><label>Cuéntenos brevemente (Opcional)<textarea name="message" rows={3} placeholder="¿Qué le gustaría lograr?"/></label><button className="button submit" type="submit" disabled={bookingState === "submitting"}>{bookingState === "submitting" ? "Enviando..." : "Solicitar cita <span>→</span>"}</button><p className="form-note">Responderemos para confirmar disponibilidad antes de reservar.</p></>}</form></section>
    <footer className="wrap"><a className="brand" href="#inicio"><i><img src="/vertice-mark.png" alt=""/></i><span>Vértice Digital</span></a><p>Desarrollo web y estrategia digital</p><a href="#inicio">Volver arriba ↑</a></footer>
  </main>;
}
