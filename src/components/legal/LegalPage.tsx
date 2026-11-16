import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { PageContainer } from '@/components/common/PageContainer'
import { LEGAL_LINKS, legalComplete, legalConfig } from '@/config/legal'

export interface LegalSection {
  title: string
  body: ReactNode
}

interface LegalPageProps {
  title: string
  intro: ReactNode
  sections: LegalSection[]
}

export function Owner() {
  return <>{legalConfig.owner ?? '[responsable a definir]'}</>
}

export function ContactEmail() {
  return legalConfig.contactEmail ? (
    <Link href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</Link>
  ) : (
    <>[email de contacto a definir]</>
  )
}

export function LegalPage({ title, intro, sections }: LegalPageProps) {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} | itti talentos`
    return () => {
      document.title = previous
    }
  }, [title])

  return (
    <PageContainer maxWidth="md">
      <Stack spacing={3}>
        <Box>
          <Typography variant="h1" sx={{ mb: 1 }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary">Última actualización: {legalConfig.updatedAt}</Typography>
        </Box>

        {!legalComplete && (
          <Alert severity="warning" role="note">
            Borrador: falta completar el nombre del responsable y el email de contacto. Estos textos deben ser revisados
            por un profesional del derecho antes de la publicación.
          </Alert>
        )}

        <Box sx={{ color: 'text.secondary', fontSize: { sm: '1.05rem' } }}>{intro}</Box>

        <Box component="nav" aria-label="Otros textos legales" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {LEGAL_LINKS.map((l) => (
            <Link key={l.to} component={RouterLink} to={l.to} variant="body2">{l.label}</Link>
          ))}
        </Box>

        {sections.map((section, index) => (
          <Box component="section" key={section.title} aria-labelledby={`seccion-${index}`}>
            <Typography id={`seccion-${index}`} variant="h3" component="h2" gutterBottom>
              {index + 1}. {section.title}
            </Typography>
            <Box
              sx={{
                '& p': { mt: 0, mb: 1.5, lineHeight: 1.7 },
                '& ul': { mt: 0, mb: 1.5, pl: 3, lineHeight: 1.7 },
                '& li': { mb: 0.5 },
                overflowWrap: 'anywhere',
              }}
            >
              {section.body}
            </Box>
          </Box>
        ))}
      </Stack>
    </PageContainer>
  )
}
