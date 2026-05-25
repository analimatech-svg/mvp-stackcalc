# Cria a estrutura '00. Governanca e Gestao' na pasta atual (ou passe -Root)
param([string]$Root = '.')
$base = Join-Path $Root '00. Governança e Gestão'
$folders = @(
  '00. Framework e Metodologia',
  '10. Jira e Ferramentas',
  '20. CoE Salesforce',
  '30. Kit de Governança por Projeto',
  '30. Kit de Governança por Projeto/60-template-projeto',
  '30. Kit de Governança por Projeto/60-template-projeto/00-prompts',
  '30. Kit de Governança por Projeto/60-template-projeto/10-docs-padrao',
  '40. Jornada por Público e Dashboards',
  '50. SharePoint e Documentação',
  '60. Capacitação',
  '60. Capacitação/20-materiais-sysmap-university-sf',
  '60. Capacitação/20-materiais-sysmap-university-sf/00-fundamentos-sf',
  '60. Capacitação/20-materiais-sysmap-university-sf/10-desenvolvedor-apex-lwc',
  '60. Capacitação/20-materiais-sysmap-university-sf/20-arquiteto-solucao',
  '60. Capacitação/20-materiais-sysmap-university-sf/30-fabrica-agentica',
  '70. Status e Acompanhamento',
  '70. Status e Acompanhamento/30-atas-reunioes',
  '80. Fábrica Agêntica',
  '80. Fábrica Agêntica/30-knowledge-base-arquitetural',
)
foreach ($f in $folders) {
  $p = Join-Path $base $f
  New-Item -ItemType Directory -Force -Path $p | Out-Null
  Write-Host ('  criado: ' + $f)
}
Write-Host ('OK -> ' + $base) -ForegroundColor Green
