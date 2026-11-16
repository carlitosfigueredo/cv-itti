import { ContactEmail, LegalPage, Owner, type LegalSection } from '@/components/legal/LegalPage'

const sections: LegalSection[] = [
  {
    title: 'Responsable',
    body: (
      <p>
        El responsable del tratamiento de los datos es <Owner />, a título personal. ITTI y Grupo Vázquez no son
        responsables ni tienen acceso a estos datos. Para consultas o para ejercer tus derechos escribí a <ContactEmail />.
      </p>
    ),
  },
  {
    title: 'Qué datos tratamos',
    body: (
      <ul>
        <li><strong>Cuenta:</strong> nombre, email e identificador que entrega Google al iniciar sesión.</li>
        <li>
          <strong>Perfil profesional:</strong> nombre público, titular, área, país, ciudad, años de experiencia,
          habilidades, modalidad, disponibilidad, resumen y enlaces que vos cargues.
        </li>
        <li><strong>Contacto opcional:</strong> email y teléfono públicos, solo si elegís mostrarlos.</li>
        <li><strong>CV:</strong> el archivo PDF que subas.</li>
        <li>
          <strong>Grupo Vázquez:</strong> tu respuesta a si fuiste afectado. Es privada por defecto y solo se muestra si das
          tu consentimiento por separado.
        </li>
        <li><strong>Reportes:</strong> el motivo y comentario de los reportes que envíes, y quién los envió.</li>
        <li>
          <strong>Datos técnicos:</strong> tu navegador guarda la sesión iniciada y la preferencia de tema claro u oscuro.
          No usamos herramientas de analítica ni cookies publicitarias.
        </li>
      </ul>
    ),
  },
  {
    title: 'Para qué los usamos',
    body: (
      <ul>
        <li>Mostrar tu perfil y tu CV a empresas y reclutadores cuando decidís publicarlos.</li>
        <li>Permitir búsquedas y filtros en el directorio.</li>
        <li>Moderar contenido, prevenir abusos y mantener la seguridad del sitio.</li>
        <li>Generar estadísticas internas agregadas (por ejemplo, cuántos perfiles hay publicados).</li>
      </ul>
    ),
  },
  {
    title: 'Tu consentimiento',
    body: (
      <p>
        Tratamos tus datos con tu consentimiento. Publicar el perfil, mostrar tu email, tu teléfono o tu respuesta sobre
        Grupo Vázquez son decisiones separadas y voluntarias. Podés retirar tu consentimiento en cualquier momento dejando de
        publicar tu perfil o editándolo.
      </p>
    ),
  },
  {
    title: 'Qué se hace público',
    body: (
      <>
        <p>
          Solo mientras tu perfil está publicado, cualquier persona puede ver los datos de tu perfil que elegiste mostrar y
          descargar tu CV. Tu email de la cuenta, tu respuesta privada sobre Grupo Vázquez y los datos de tu cuenta nunca se
          publican.
        </p>
        <p>
          Si dejás de publicar tu perfil, deja de estar disponible en la plataforma de inmediato. No podemos recuperar
          copias de tu CV o de tus datos que otras personas ya hayan descargado.
        </p>
      </>
    ),
  },
  {
    title: 'Quién más accede',
    body: (
      <ul>
        <li><strong>Administración de la plataforma:</strong> puede ver todos los perfiles y cuentas para moderar y dar soporte.</li>
        <li>
          <strong>Proveedor de infraestructura:</strong> el sitio funciona sobre Firebase y Google Cloud (Google LLC), que
          almacena y procesa los datos por cuenta nuestra.
        </li>
        <li>No vendemos ni cedemos tus datos a terceros.</li>
      </ul>
    ),
  },
  {
    title: 'Dónde se guardan',
    body: (
      <p>
        Los datos y los CV se guardan en servidores de Google ubicados en Estados Unidos (región us-central1). Esto implica
        una transferencia internacional de datos, que se realiza con un proveedor que aplica medidas de seguridad como el
        cifrado de la información.
      </p>
    ),
  },
  {
    title: 'Cuánto tiempo los conservamos',
    body: (
      <p>
        Conservamos tus datos mientras tu cuenta exista. Si eliminás tu cuenta, se borran tu perfil, tu CV y los datos de tu
        cuenta. Se conserva un registro mínimo de la acción (identificadores y fecha, sin el contenido de tu perfil ni de tu
        CV) durante al menos un año, por seguridad y control. El proveedor de infraestructura puede tardar un tiempo
        adicional en eliminar definitivamente la información de sus sistemas.
      </p>
    ),
  },
  {
    title: 'Tus derechos',
    body: (
      <>
        <p>
          Podés acceder a tus datos, actualizarlos o corregirlos desde tu perfil; oponerte a su publicación dejando de
          publicarlo; y pedir su eliminación eliminando tu cuenta o escribiendo a <ContactEmail />.
        </p>
        <p>
          Esta política toma como referencia la Ley N.º 7593/2025 de Protección de Datos Personales de la República del
          Paraguay.
        </p>
      </>
    ),
  },
  {
    title: 'Seguridad',
    body: (
      <p>
        La conexión al sitio es cifrada (HTTPS). El acceso a los datos está limitado por reglas de seguridad: nadie puede
        modificar el perfil de otra persona y solo la administración tiene permisos especiales. Las acciones de moderación
        quedan registradas. Ningún sistema es completamente infalible; si detectás un problema, avisanos.
      </p>
    ),
  },
  {
    title: 'Cambios',
    body: <p>Podemos actualizar esta política. La fecha de la última actualización figura arriba.</p>,
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacidad y tratamiento de datos"
      intro={<p>Qué datos personales tratamos en itti talentos, para qué, quién accede y cómo podés controlarlos.</p>}
      sections={sections}
    />
  )
}
