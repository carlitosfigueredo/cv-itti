import Link from '@mui/material/Link'
import { Link as RouterLink } from 'react-router-dom'
import { ContactEmail, LegalPage, Owner, type LegalSection } from '@/components/legal/LegalPage'

const sections: LegalSection[] = [
  {
    title: 'Qué es itti talentos',
    body: (
      <>
        <p>
          itti talentos es un directorio en línea donde profesionales de la comunidad de ITTI y Grupo Vázquez pueden
          crear un perfil laboral y publicar su CV, y donde empresas y personas que reclutan pueden buscarlos y
          contactarlos. Es una iniciativa personal, independiente y no oficial administrada por <Owner />, sin relación
          con ITTI ni con Grupo Vázquez.
        </p>
        <p>Al usar el sitio aceptás estos términos. Si no estás de acuerdo, no lo uses.</p>
      </>
    ),
  },
  {
    title: 'Cuentas y perfiles',
    body: (
      <ul>
        <li>Para crear un perfil tenés que iniciar sesión con una cuenta de Google. Sos responsable del uso de tu cuenta.</li>
        <li>La información de tu perfil y tu CV tiene que ser verdadera, propia y estar actualizada.</li>
        <li>Tu perfil es privado hasta que decidas publicarlo. Podés dejar de publicarlo, editarlo o eliminar tu CV cuando quieras.</li>
        <li>Seguís siendo titular de tu contenido. Al publicarlo, nos autorizás a mostrarlo en la plataforma mientras esté publicado.</li>
      </ul>
    ),
  },
  {
    title: 'Uso permitido para quienes reclutan',
    body: (
      <>
        <p>Los perfiles y CV publicados se pueden usar solamente para procesos de selección de personal. No está permitido:</p>
        <ul>
          <li>Armar bases de datos, revender o ceder la información a terceros.</li>
          <li>Enviar publicidad, cadenas o comunicaciones que no estén relacionadas con una oportunidad laboral.</li>
          <li>Descargar perfiles de forma automatizada (scraping) o sobrecargar el sitio.</li>
          <li>Usar los datos para discriminar por motivos prohibidos por la ley.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Contenido no permitido',
    body: (
      <>
        <p>No se puede publicar contenido que:</p>
        <ul>
          <li>Sea falso, engañoso o suplante la identidad de otra persona.</li>
          <li>Incluya datos personales de terceros sin su autorización.</li>
          <li>Sea ofensivo, discriminatorio, ilegal o con fines publicitarios.</li>
          <li>Contenga archivos dañinos o que no sean un CV en PDF.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Moderación',
    body: (
      <p>
        Cualquier persona con sesión iniciada puede reportar un perfil. El equipo de administración puede dejar de publicar
        perfiles, eliminar CV, suspender o eliminar cuentas que no cumplan estos términos. Estas acciones quedan
        registradas.
      </p>
    ),
  },
  {
    title: 'Disponibilidad del servicio',
    body: (
      <p>
        Hacemos lo posible para que el sitio funcione de forma continua, pero puede haber interrupciones, cambios o el
        cierre del servicio. Ver también el{' '}
        <Link component={RouterLink} to="/legal/responsabilidad">descargo de responsabilidad</Link>.
      </p>
    ),
  },
  {
    title: 'Datos personales',
    body: (
      <p>
        El tratamiento de tus datos se explica en la{' '}
        <Link component={RouterLink} to="/legal/privacidad">política de privacidad y tratamiento de datos</Link>.
      </p>
    ),
  },
  {
    title: 'Cambios y contacto',
    body: (
      <p>
        Podemos actualizar estos términos. La fecha de la última actualización figura arriba. Para consultas escribí a{' '}
        <ContactEmail />. Estos términos se rigen por las leyes de la República del Paraguay.
      </p>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      title="Términos y condiciones"
      intro={<p>Reglas de uso de itti talentos para profesionales y para quienes buscan talento.</p>}
      sections={sections}
    />
  )
}
