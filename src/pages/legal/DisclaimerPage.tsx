import { ContactEmail, LegalPage, Owner, type LegalSection } from '@/components/legal/LegalPage'

const sections: LegalSection[] = [
  {
    title: 'Iniciativa independiente y no oficial',
    body: (
      <p>
        itti talentos es una iniciativa personal e independiente de <Owner />. <strong>No es un sitio oficial</strong> de
        ITTI ni de Grupo Vázquez, y no está afiliada, patrocinada ni respaldada por esas organizaciones ni por ninguna
        empresa vinculada a ellas.
      </p>
    ),
  },
  {
    title: 'No somos una agencia de empleo',
    body: (
      <p>
        itti talentos es un directorio. <Owner /> no actúa como agencia de colocación, intermediario laboral ni empleador,
        no participa de los procesos de selección y no cobra comisiones por contrataciones.
      </p>
    ),
  },
  {
    title: 'Información de los perfiles',
    body: (
      <p>
        Cada profesional carga y es responsable de la información de su perfil y de su CV. No verificamos la identidad,
        los títulos, la experiencia ni la veracidad de lo publicado. Recomendamos a quienes reclutan hacer sus propias
        verificaciones.
      </p>
    ),
  },
  {
    title: 'Contrataciones y resultados',
    body: (
      <p>
        Las decisiones de contactar, entrevistar o contratar son exclusivas de cada empresa o reclutador. No garantizamos
        que un perfil consiga empleo, ni que una persona esté disponible, ni el resultado de ningún proceso.
      </p>
    ),
  },
  {
    title: 'Uso de los datos descargados',
    body: (
      <p>
        Quien descarga un CV o usa los datos de un perfil es responsable de usarlos solo para selección de personal y de
        cumplir la normativa de protección de datos personales. No podemos controlar ni recuperar copias que ya se hayan
        descargado.
      </p>
    ),
  },
  {
    title: 'Mención de ITTI y Grupo Vázquez',
    body: (
      <p>
        Los nombres ITTI y Grupo Vázquez se usan solo para identificar a la comunidad de profesionales a la que está
        dirigida la plataforma. Su mención no implica relación, respaldo ni responsabilidad de esas organizaciones sobre la
        plataforma o los perfiles publicados.
      </p>
    ),
  },
  {
    title: 'Enlaces externos y disponibilidad',
    body: (
      <p>
        Los perfiles pueden incluir enlaces a sitios de terceros (por ejemplo, LinkedIn) sobre los que no tenemos control.
        El servicio se ofrece tal como está y puede tener interrupciones o errores.
      </p>
    ),
  },
  {
    title: 'Contacto',
    body: (
      <p>
        Si encontrás información incorrecta o inapropiada, usá la opción "Reportar" del perfil o escribí a <ContactEmail />.
      </p>
    ),
  },
]

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Descargo de responsabilidad"
      intro={<p>Alcance y límites de lo que ofrece itti talentos.</p>}
      sections={sections}
    />
  )
}
