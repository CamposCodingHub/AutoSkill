/**
 * Enriquecimento didático em massa de todas as aulas AutoSkill.
 * Insere blocos profissionais (oficina, procedimento, erros, checklist)
 * e substitui explanations genéricas de quiz.
 */
import fs from 'fs'
import path from 'path'

const ROOT = path.join(process.cwd(), 'src', 'data')
const PUBLIC = path.join(process.cwd(), 'public', 'data')
const MARKER = 'autoskill-enriched-v2'

const MODULE_PACKS = {
  1: {
    focus: 'fundamentos elétricos',
    oficina:
      'Na bancada, traduzir sintoma em grandeza: falta de tensão? queda sob carga? corrente excessiva? Resistência indesejada quase sempre aparece como voltage drop com a carga ligada — continuidade a frio mente.',
    tabela: {
      headers: ['Conceito', 'Pergunta na oficina', 'Medição típica'],
      rows: [
        ['Tensão', 'Chega alimentação no conector?', 'Volts DC vs − bateria'],
        ['Corrente', 'A carga puxa o esperado?', 'Alicate DC / shunt'],
        ['Resistência', 'Há aperto/corrosão no caminho?', 'VD sob carga (não só ohms)'],
        ['Potência', 'O componente consegue trabalhar?', 'P ≈ V × I'],
      ],
    },
    erros:
      'Não meça ohms com circuito energizado. Não use parafuso enferrujado como “massa”. Não troque peça sem número (tensão/VD/corrente).',
    checklist: [
      'Definir o que medir antes de abrir a caixa de ferramentas',
      'Escolher escala/modo corretos no DMM',
      'Registrar valor + condição (IG on/off, carga ligada)',
      'Comparar com especificação ou lado bom',
    ],
  },
  2: {
    focus: 'instrumentos e medição',
    oficina:
      'O multímetro é juiz, não adivinho: volts ao vivo, ohms só desenergizado, corrente com método seguro. Voltage drop sob carga é o teste que mais separa técnico de “trocador de peça”.',
    tabela: {
      headers: ['Modo', 'Use quando', 'Erro clássico'],
      rows: [
        ['V DC', 'Alimentação / sinal / VD', 'Massa de referência ruim'],
        ['Ω / bip', 'Componente isolado', 'Medir com tensão presente'],
        ['A / alicate', 'Consumo / partida / parasita', 'Escala errada / acordar módulos'],
        ['mV no fusível', 'Isolar fuga sem puxar fusível', 'Não esperar sleep do veículo'],
      ],
    },
    erros: 'Ponta no borne 10A sem querer; continuidade como único teste; não zerar/validar o instrumento.',
    checklist: [
      'Inspecionar pontas e fusível interno do DMM',
      'Confirmar COM / VΩ / A',
      'Ao vivo = volts; morto = ohms',
      'Documentar foto da tela quando possível',
    ],
  },
  3: {
    focus: 'componentes (fusível, relé, diodo…)',
    oficina:
      'Fusível aberto é sintoma. Relé que “clicka” só prova bobina — o contato 30–87 pode estar morto. Sempre separe lado de comando e lado de potência.',
    tabela: {
      headers: ['Peça', 'Teste rápido', 'Interpretação'],
      rows: [
        ['Fusível', 'Continuidade / tensão dos dois lados', 'Aberto = achar curto/sobrecorrente'],
        ['Relé', '85/86 ohms + 30/87 sob comando', 'Click ≠ potência ok'],
        ['Diodo', 'Polarização / queda ~0,5–0,7 V', 'Curto ou aberto'],
        ['Conector', 'VD sob carga + inspeção visual', 'Fretting/corrosão'],
      ],
    },
    erros: 'Upar ampère do fusível; trocar relé sem medir 30 e 87; ignorar diagrama de pinagem.',
    checklist: ['Identificar circuito no diagrama', 'Medir antes de substituir', 'Validar carga real após o reparo'],
  },
  4: {
    focus: 'arquitetura 12V e distribuição',
    oficina:
      'Siga o caminho: Bateria → fusível/caixa → relé → carga → massa. Positivo permanente ≠ chaveado. Parasita: espere sleep; prefira mV nos fusíveis para não mascarar o módulo.',
    tabela: {
      headers: ['Trecho', 'O que provar', 'Dica'],
      rows: [
        ['B+', 'Tensão na origem', '12,6 V repouso tipicamente'],
        ['Fusível', 'Passagem e ampère correto', 'Nunca “gambiarra” maior'],
        ['Relé/IG', 'Comando vs potência', 'Pinos 30/87/85/86'],
        ['Massa', 'VD < ~0,1–0,2 V sob carga', 'Limpe e retorque'],
      ],
    },
    erros: 'Desconectar bateria no meio do teste de fuga; misturar B+ permanente com ACC.',
    checklist: ['Mapear power/gnd no diagrama', 'Medir no conector da carga', 'Confirmar massa de retorno'],
  },
  5: {
    focus: 'iluminação e sinalização',
    oficina:
      'Farol fraco unilateral = quase sempre caminho (massa/conector/chicote), não “lâmpada fraca mágica”. Meça tensão no soquete com farol aceso e VD na massa.',
    tabela: {
      headers: ['Sintoma', '1º teste', 'Causa comum'],
      rows: [
        ['Um lado fraco', 'VD massa/positivo desse lado', 'Massa oxidada'],
        ['Ambos fracos', 'Tensão bateria + carga do sistema', 'Subtensão / cabo'],
        ['Fusível queima', 'Isolar curto após fusível', 'Chicote esfolado'],
        ['LED aftermarket', 'Polaridade/driver/queda no adaptador', 'Adaptador ruim'],
      ],
    },
    erros: 'Trocar só a lâmpada com 10 V no soquete; ignorar o lado bom como referência.',
    checklist: ['Comparar lado bom vs ruim', 'Medir sob carga', 'Inspecionar soquete/água'],
  },
  6: {
    focus: 'sensores',
    oficina:
      'Sensor “com código” não é sentença: prove alimentação, massa, sinal e integridade do chicote. Scope ajuda a ver forma; DMM confirma tensão de referência.',
    tabela: {
      headers: ['Verificação', 'Esperado (genérico)', 'Nota'],
      rows: [
        ['Alimentação 5V/12V', 'Conforme diagrama', 'Sem ref = sinal louco'],
        ['Massa do sensor', 'VD baixo', 'Massa compartilhada falha em grupo'],
        ['Sinal', 'Varia com estímulo', 'Compare OEM/lado bom'],
        ['Chicote', 'Sem curto/aberto', 'Wiggle test'],
      ],
    },
    erros: 'Trocar sensor sem medir no conector; ohms com circuito energizado.',
    checklist: ['Ler DTC + freeze', 'Medir no conector', 'Estímulo controlado', 'Só então substituir'],
  },
  7: {
    focus: 'atuadores',
    oficina:
      'Separe falha de comando (ECU/driver) de falha de potência (fusível/relé/massa) e de falha do próprio atuador. Clique de relé não prova corrente na carga.',
    tabela: {
      headers: ['Atuador', 'Prova', 'Armadilha'],
      rows: [
        ['Injetor', 'Pulso + resistência isolada', 'Medir ohms energizado'],
        ['Bobina', 'Comando + primary/secondary', 'Cabo/estalo enganoso'],
        ['Solenoide', 'Alimentação + massa comutada', 'Só bip de continuidade'],
        ['Motor DC', 'Corrente + VD', 'Bind mecânico parece elétrico'],
      ],
    },
    erros: 'Condenar ECU sem provar alimentação/massa/sinal no conector do atuador.',
    checklist: ['Diagrama de pinos', 'Medir comando e potência', 'Validar após reparo'],
  },
  8: {
    focus: 'redes CAN/LIN/diagnóstico',
    oficina:
      'Sem comunicação: IG off, ohms CAN-H↔L (~60 Ω com duas terminações). 120 Ω ≈ uma terminação; ~0 Ω curto; OL aberto. Aftermarket na rede é suspeito clássico.',
    tabela: {
      headers: ['Leitura', 'Significado usual', 'Próximo passo'],
      rows: [
        ['~60 Ω', 'Duas terminações', 'Checar níveis/alimentação'],
        ['~120 Ω', 'Falta uma terminação', 'Achar módulo/resistor aberto'],
        ['~0 Ω', 'Curto H-L', 'Isolar trechos'],
        ['OL', 'Aberto / desconectado', 'Conector/DLC/chicote'],
      ],
    },
    erros: 'Reflashar tudo antes de medir ohms/alimentação; emendar CAN sem diagrama.',
    checklist: ['Medir terminação', 'Power/gnd do módulo offline', 'Inspecionar acessórios'],
  },
  9: {
    focus: 'ECU e estratégias',
    oficina:
      'ECU precisa de B+, IG, massas sólidas e rede ok. Sem isso, “estratégias” parecem defeito de software. Evidência no conector antes de programação.',
    tabela: {
      headers: ['Pino/função', 'Prova', 'Falha típica'],
      rows: [
        ['B+ / IG', 'Tensão estável', 'Fusível/relé'],
        ['Massas', 'VD baixo', 'Oxidação'],
        ['Rede', 'Com scanner/ohms', 'Bus off'],
        ['Driver', 'Scope no comando', 'Curto na carga'],
      ],
    },
    erros: 'Clonar/flashar sem backup e sem tensão estável na bateria.',
    checklist: ['Alimentações', 'Massas', 'Comunicação', 'Depois lógica/software'],
  },
  10: {
    focus: 'segurança ativa/passiva',
    oficina:
      'Airbag e pretensionador: zero improvisação. Use procedimentos OEM, ferramentas adequadas e desarme conforme manual. Diagnóstico elétrico com respeito a squibs.',
    tabela: {
      headers: ['Sistema', 'Cuidado', 'Abordagem'],
      rows: [
        ['Airbag', 'Energia residual', 'Espera/desarme OEM'],
        ['ABS/ESP', 'Módulo + sensores roda', 'Power/rede/sinal'],
        ['Cinto/pré', 'Pirotécnico', 'Não ohm sem método'],
        ['ADAS', 'Calibração', 'Após geometria/vidro'],
      ],
    },
    erros: 'Medir squib “no chute”; alimentar módulo errado; ignorar DTCs de comunicação.',
    checklist: ['SSE/procedimento', 'Scanner adequado', 'Não pular etapas de segurança'],
  },
  11: {
    focus: 'A/C automotivo elétrico',
    oficina:
      'Compressor/embraiaagem/pressostatos/sensores: confirme comando elétrico e pressões. Relé e fusível mentem menos que “gás no olhômetro”.',
    tabela: {
      headers: ['Checagem', 'Elétrica', 'Resultado'],
      rows: [
        ['Relé clutch', '30/87 sob pedido de frio', 'Sem 87 = potência'],
        ['Pressostato', 'Sinal/continuidade conforme OEM', 'Abre por pressão'],
        ['Sensor temp/press', 'Tensão/sinal', 'ECU inibe'],
        ['Ventilador', 'Corrente + comando', 'Sobrepressão'],
      ],
    },
    erros: 'Só completar gás sem provar por que o clutch não engata.',
    checklist: ['Códigos A/C', 'Comando elétrico', 'Depois carga de fluido'],
  },
  12: {
    focus: 'conforto e carroceria',
    oficina:
      'Vidro/trava/retrovisor: localize se o comando local, mestre ou módulo falhou. Fusível de conforto e massa de porta são vilões frequentes.',
    tabela: {
      headers: ['Sintoma', 'Isolar', 'Teste'],
      rows: [
        ['Só um vidro', 'Motor vs interruptor', 'Alimentar motor direto (cuidado)'],
        ['Nenhum conforto', 'Fusível/BCM', 'B+ e rede'],
        ['Após chuva', 'Água na porta', 'Corrosão conector'],
        ['Aftermarket', 'Alarme/som', 'Parasita/CAN'],
      ],
    },
    erros: 'Trocar motor de vidro sem testar interruptor/chicote da porta.',
    checklist: ['Fusíveis conforto', 'Comando vs carga', 'Inspecionar chicote porta'],
  },
  13: {
    focus: 'áudio e telemática',
    oficina:
      'Som aftermarket mal alimentado gera parasita, interferência e até problemas de rede. Use B+ correto, fusível dedicado e massa limpa — nunca “ganze” na CAN.',
    tabela: {
      headers: ['Item', 'Boa prática', 'Risco'],
      rows: [
        ['Alimentação', 'Fusível calibrado', 'Incêndio / parasita'],
        ['Massa', 'Ponto limpo curto', 'Ruído / resets'],
        ['Remote ACC', 'Sinal adequado', 'Rádio não dorme'],
        ['Antena/GPS', 'Blindagem', 'Recepção ruim'],
      ],
    },
    erros: 'Emendar em chicotes de airbag/CAN; deixar amp ligado em B+ sem remote.',
    checklist: ['Diagrama de instalação', 'Medir consumo após sleep', 'Validar funções do veículo'],
  },
  14: {
    focus: '24V / pesados',
    oficina:
      '24V = duas baterias em série tipicamente. Queda de tensão e massas ruins derrubam módulos. Cuidado com retornos de chassi e tomadas de reboque.',
    tabela: {
      headers: ['Tópico', 'Atenção', 'Medição'],
      rows: [
        ['Séries 12+12', 'Balanceamento', 'Tensão por elemento'],
        ['Partida', 'Correntes altas', 'VD cabos'],
        ['Iluminação reboque', 'Terra comum', 'Continuidade/VD'],
        ['ABS/EBS', 'Rede + power', 'Scanner dedicado'],
      ],
    },
    erros: 'Tratar 24V como 12V sem recalcular corrente/potência.',
    checklist: ['Confirmar topologia', 'Medir por bateria', 'Inspecionar terra pesado'],
  },
  15: {
    focus: 'HV / híbridos / BEV',
    oficina:
      'Sem PPE + service plug/LOTO + verificação 0 V conforme OEM, não há serviço. 12 V auxiliar fraca impede READY. Isolation fault exige fluxo do fabricante.',
    tabela: {
      headers: ['Etapa', 'Obrigatório', 'Por quê'],
      rows: [
        ['PPE', 'Classe adequada', 'Arco/choque'],
        ['LOTO', 'Service plug', 'Isolar pack'],
        ['0 V', 'Medir pontos OEM', 'Energia residual'],
        ['12 V aux', 'Estável', 'Contatores'],
      ],
    },
    erros: 'Abrir capa laranja por curiosidade; saltar interlock.',
    checklist: ['Treinamento/autorização', 'PPE', 'Procedimento OEM completo'],
  },
  16: {
    focus: 'osciloscópio e formas de onda',
    oficina:
      'Scope mostra o tempo: glitch, drop, duty e sincronismo que o DMM média. Comece com acoplamento DC, escala e trigger coerentes com o sinal.',
    tabela: {
      headers: ['Sinal', 'O que olhar', 'Falha típica'],
      rows: [
        ['CKP/CMP', 'Amplitude/dentes', 'Entreferro / chicote'],
        ['Injetor', 'Indutivo kick', 'Aberto / driver'],
        ['Primary ign', 'Dwell/burn', 'Bobina/carga'],
        ['CAN', 'Níveis diferenciais', 'Ruído/terminação'],
      ],
    },
    erros: 'Trigger errado; sonda no lugar errado; comparar sem referência boa.',
    checklist: ['Setup de escala', 'Trigger estável', 'Salvar print no RO'],
  },
  17: {
    focus: 'flash / coding / calibração',
    oficina:
      'Sequência segura: backup → checksum → tensão estável → cabo bom → gravar → verificar comunicação/funções. Sem fonte, brick é questão de tempo.',
    tabela: {
      headers: ['Passo', 'Critério', 'Falha se pular'],
      rows: [
        ['Backup', 'Arquivo + hash', 'Sem volta'],
        ['Checksum', 'Bate com esperado', 'Arquivo errado'],
        ['Tensão', '≥13,5 V tipicamente', 'Abort mid-flash'],
        ['Verify', 'Com + DTCs', 'Entrega incompleta'],
      ],
    },
    erros: 'Flash em bateria fraca; arquivo de outro VIN/hw.',
    checklist: ['Ferramenta adequada', 'Energia estável', 'Validação pós'],
  },
  18: {
    focus: 'alarme / rastreador / segurança',
    oficina:
      'Instalação invasiva é causa nº1 de parasita e U-codes. Documente pontos de emenda e meça consumo após sleep.',
    tabela: {
      headers: ['Sintoma pós-instação', 'Suspeita', 'Ação'],
      rows: [
        ['Bateria morre', 'B+ errado / módulo acordado', 'Parasita + diagrama'],
        ['Sem com', 'Emenda CAN', 'Ohms/rede'],
        ['No-start', 'IMMO/corte combustível', 'Scanner + fiação'],
        ['Ruído rádio', 'Massa/alimentação', 'Refazer terra'],
      ],
    },
    erros: 'Cortar chicote original sem identificação; alimentar sirene em circuito crítico.',
    checklist: ['Plano de instalação', 'Fusível dedicado', 'Teste de sleep'],
  },
  19: {
    focus: 'gestão de oficina',
    oficina:
      'RO claro: sintoma → testes → evidências → peça → validação. Técnico excelente documenta; retrabalho come margem.',
    tabela: {
      headers: ['Prática', 'Benefício', 'KPI'],
      rows: [
        ['Checklist diagnóstico', 'Menos chute', 'Retrabalho %'],
        ['Foto de medições', 'Prova para cliente', 'Aprovação orçamento'],
        ['Tempo por RO', 'Produtividade', 'Horas faturáveis'],
        ['Estoque crítico', 'Menos espera', 'Giro'],
      ],
    },
    erros: 'Orçar peça antes da evidência; não validar após o reparo.',
    checklist: ['RO padronizado', 'Evidência anexada', 'Teste final registrado'],
  },
  20: {
    focus: 'diagramas elétricos',
    oficina:
      'Diagrama é GPS: marque power, gnd, sinal, fusível e conector. Sem leitura de esquema, medição vira turismo no chicote.',
    tabela: {
      headers: ['Elemento', 'Pergunta', 'Ação'],
      rows: [
        ['Símbolo', 'O que é o componente?', 'Legenda OEM'],
        ['Código fio', 'Qual circuito?', 'Trace no carro'],
        ['Conector', 'Onde medir?', 'Vista de pinos'],
        ['Splice', 'Onde divide?', 'Isolar trechos'],
      ],
    },
    erros: 'Seguir cor de fio de outro modelo/ano; medir sem identificar pino.',
    checklist: ['Abrir diagrama do VIN', 'Marcar caminho', 'Medir nos pontos marcados'],
  },
  21: {
    focus: 'partida e carga',
    oficina:
      'No-crank: tensão repouso + crank + VD cabos + corrente. Carga: 13,8–14,5 V típico com motor ligado (OEM). Parasita depois do sleep.',
    tabela: {
      headers: ['Teste', 'Alvo típico*', 'Interpretação'],
      rows: [
        ['Repouso', '~12,4–12,7 V', 'Estado de carga'],
        ['Crank', 'Não colapsar demais', 'CCA/cabos'],
        ['Carga', '~13,8–14,5 V', 'Alternador/regulador'],
        ['Parasita', 'OEM (muitos <50–100 mA)', 'Fuga'],
      ],
    },
    erros: 'Trocar arranque sem VD; trocar alternador com 14 V na bateria e luz acesa (circuito da lâmpada).',
    checklist: ['Números anotados', 'Cabos/terminais', 'Validar após carga'],
  },
  22: {
    focus: 'solda e emendas',
    oficina:
      'Emenda profissional: limpeza, mecânica firme, solda adequada quando indicada, isolação e alívio de tração. Emenda fria = falha intermitente futura.',
    tabela: {
      headers: ['Prática', 'Bom', 'Ruim'],
      rows: [
        ['Crimp', 'Ferramenta certa', 'Alicate “amassa”'],
        ['Solda', 'Fluxo limpo', 'Frio/excesso'],
        ['Isolação', 'Termo + adesivo', 'Fita frouxa'],
        ['Local', 'Longe de calor/água', 'No assoalho aberto'],
      ],
    },
    erros: 'Torcer fio e cobrir com fita; soldar CAN sem padrão OEM.',
    checklist: ['Preparar condutor', 'União mecânica', 'Isolar e testar sob carga'],
  },
  23: {
    focus: 'casos práticos / laboratório',
    oficina:
      'Trate cada case como RO real: hipótese → teste que mata hipótese → evidência → correção → reteste. Tempo sem método é tempo perdido.',
    tabela: {
      headers: ['Passo', 'Pergunta', 'Saída'],
      rows: [
        ['Sintoma', 'O que o cliente vê?', 'Reprodução'],
        ['Hipótese', 'O que explicaria?', 'Lista curta'],
        ['Teste', 'O que prova/refuta?', 'Número'],
        ['Fechamento', 'Validou?', 'RO completo'],
      ],
    },
    erros: 'Mudar três peças de uma vez; não registrar o que já foi testado.',
    checklist: ['Uma variável por vez', 'Anotar resultados', 'Comparar com lado bom'],
  },
  24: {
    focus: 'segurança de oficina',
    oficina:
      'EPI, ordem no posto, isolamento de HV, e não “testar curto com fio grosso”. Segurança é competência técnica, não burocracia.',
    tabela: {
      headers: ['Risco', 'Controle', 'Exemplo'],
      rows: [
        ['Choque/arco', 'PPE/LOTO', 'HV'],
        ['Incêndio', 'Fusível correto', 'Aftermarket'],
        ['Química', 'EPIs bateria', 'Ácido/térmica'],
        ['Ergonomia', 'Apoios/cavaletes', 'Queda de veículo'],
      ],
    },
    erros: 'Anel metálico em bancada energizada; pular espera de airbag.',
    checklist: ['Avaliar risco', 'Preparar EPI', 'Procedimento escrito quando HV'],
  },
  25: {
    focus: 'certificação / ASE mindset',
    oficina:
      'Provas tipo ASE cobram raciocínio: VD, interpretação de sintoma, ordem de teste. Treine com timer e revise por área fraca — não só “ler PDF”.',
    tabela: {
      headers: ['Área A6', 'Peso mental', 'Treino AutoSkill'],
      rows: [
        ['Geral/VD', 'Alto', 'M1–M4, M20'],
        ['Partida', 'Alto', 'M21'],
        ['Carga', 'Médio', 'M21'],
        ['Body/redes', 'Alto', 'M5, M8, M12'],
      ],
    },
    erros: 'Decorar gabarito; ignorar explicação do erro.',
    checklist: ['Simulado cronometrado', 'Revisão por área', 'Refazer labs fracos'],
  },
  26: {
    focus: 'tendências 48V/zonal/IA',
    oficina:
      '48V reduz corrente para mesma potência; zonal concentra falhas por zona. Smart fuse reporta DTC — “só trocar fusível” ficou velho.',
    tabela: {
      headers: ['Arquitetura', 'Impacto no diagnóstico', 'Ação'],
      rows: [
        ['48V', 'Domínio de tensão', 'Identificar LV/HV'],
        ['Zonal', 'Vários sistemas caem juntos', 'Power da zone ECU'],
        ['eFuse', 'DTC de distribuição', 'Ler PDU'],
        ['OTA', 'Software', 'Histórico de update'],
      ],
    },
    erros: 'Diagnosticar 48V com mentalidade só 12V sem PPE/OEM.',
    checklist: ['Identificar domínio', 'Ler módulos de energia', 'Seguir fluxos novos'],
  },
  27: {
    focus: 'nichos e especialização',
    oficina:
      'Escolha um nicho (EV, coding, pesados, body) depois da base sólida. Especialista sem fundamentos vira dependente de sorte.',
    tabela: {
      headers: ['Nicho', 'Pré-requisito', 'Diferencial'],
      rows: [
        ['EV/HV', 'Segurança + 12V', 'Isolation/BMS'],
        ['Coding', 'Rede + energia', 'Procedimento'],
        ['Pesados', '24V', 'EBS/rede'],
        ['Áudio', 'Parasita/massa', 'Instalação limpa'],
      ],
    },
    erros: 'Abrir nicho HV sem base e sem EPI.',
    checklist: ['Fechar base A6', 'Escolher nicho', 'Montar portfólio de cases'],
  },
  28: {
    focus: 'projetos e portfólio',
    oficina:
      'Portfólio técnico: RO com fotos de medição, diagrama marcado e validação. Isso vende confiança melhor que discurso.',
    tabela: {
      headers: ['Entrega', 'Conteúdo', 'Uso'],
      rows: [
        ['Case PDF/MD', 'Sintoma→teste→fixo', 'Cliente/emprego'],
        ['Prints DMM/scope', 'Evidência', 'Auditoria'],
        ['Antes/depois', 'Validação', 'Marketing técnico'],
        ['Lições aprendidas', 'Erro evitado', 'Melhoria contínua'],
      ],
    },
    erros: 'Portfólio só com “troquei a peça” sem números.',
    checklist: ['3 cases documentados', 'Medições legíveis', 'Resultado validado'],
  },
  29: {
    focus: 'empreendedorismo de oficina elétrica',
    oficina:
      'Preço justo exige método: menos retrabalho, orçamento com evidência, especialização. Elétrica bem feita tem margem — chute não.',
    tabela: {
      headers: ['Frente', 'Ação', 'Métrica'],
      rows: [
        ['Comercial', 'Orçar após diagnóstico', 'Taxa de aprovação'],
        ['Operação', 'Checklist padrão', 'Retrabalho'],
        ['Financeiro', 'Hora técnica real', 'Margem'],
        ['Reputação', 'Garantia com evidência', 'Indicações'],
      ],
    },
    erros: 'Aceitar “olha aí rapidinho” sem RO; trabalhar no prejuízo por insegurança técnica.',
    checklist: ['Definir escopo', 'Cobrar diagnóstico', 'Entregar validação'],
  },
}

function alreadyEnriched(content) {
  return (content || []).some(
    (b) => b.type === 'callout' && typeof b.text === 'string' && b.text.includes(MARKER),
  )
}

function buildBlocks(modId, title) {
  const pack = MODULE_PACKS[modId] || MODULE_PACKS[1]
  return [
    {
      type: 'text',
      value: `Objetivo didático: dominar ${pack.focus} aplicado a “${title}”. Ao final, você deve saber o que medir primeiro, quais valores interpretam o sintoma e quais erros de iniciante evitar nesta aula.`,
    },
    {
      type: 'callout',
      style: 'info',
      title: 'Na oficina (aplicação real)',
      text: `${pack.oficina} [${MARKER}]`,
    },
    {
      type: 'table',
      headers: pack.tabela.headers,
      rows: pack.tabela.rows,
    },
    {
      type: 'callout',
      style: 'danger',
      title: 'Erros clássicos nesta área',
      text: pack.erros,
    },
    {
      type: 'callout',
      style: 'tip',
      title: 'Método em 4 passos',
      text: '1) Reproduzir sintoma 2) Inspeção visual/diagrama 3) Medir sob condição correta (carga/sleep/IG) 4) Corrigir causa raiz e validar.',
    },
    {
      type: 'list',
      ordered: true,
      items: pack.checklist,
    },
    {
      type: 'callout',
      style: 'analogy',
      title: 'Como estudar esta aula',
      text: 'Leia → faça o lab → responda o quiz lendo a explicação → explique o fluxo em voz alta como se fosse para um ajudante na oficina.',
    },
  ]
}

function improveExplanation(quiz, modId, title) {
  const q = `${quiz.question || ''} ${(quiz.options || []).join(' ')}`.toLowerCase()
  const ans = quiz.options?.[quiz.correct] ?? ''
  if (q.includes('ohm') || q.includes('resist')) {
    return `Resposta: ${ans}. Ohms/continuidade exige circuito desenergizado e, quando necessário, componente isolado. Ao vivo, use volts ou voltage drop.`
  }
  if (q.includes('voltage drop') || q.includes('queda')) {
    return `Resposta: ${ans}. Voltage drop só faz sentido sob carga (corrente fluindo). Compare com limites típicos/OEM e isole o trecho.`
  }
  if (q.includes('can') || q.includes('60') || q.includes('120') || q.includes('termina')) {
    return `Resposta: ${ans}. Em CAN clássica, duas terminações de 120 Ω em paralelo ≈ 60 Ω (IG off). 120 Ω sugere uma terminação; ~0 Ω curto.`
  }
  if (q.includes('parasita') || q.includes('fuga') || q.includes('descarga')) {
    return `Resposta: ${ans}. Meça após sleep. Desconectar a bateria pode mascarar o módulo. Isolar por fusível ou mV no fusível.`
  }
  if (q.includes('partida') || q.includes('arranque') || q.includes('crank') || q.includes('click')) {
    return `Resposta: ${ans}. No-crank: tensão em repouso e no crank + VD nos cabos + corrente. Click não prova o motor de partida.`
  }
  if (q.includes('alternador') || q.includes('carga') || q.includes('14')) {
    return `Resposta: ${ans}. Com motor ligado, tensão de carga tipicamente ~13,8–14,5 V (confirme OEM). Sem isso, investigue alternador/correia/excitação/cabos.`
  }
  if (q.includes('hv') || q.includes('alta tensão') || q.includes('loto') || q.includes('híbrid')) {
    return `Resposta: ${ans}. HV: PPE + service plug/LOTO + verificar 0 V conforme OEM. Sem isso não há diagnóstico seguro.`
  }
  if (q.includes('fusível') || q.includes('fuse')) {
    return `Resposta: ${ans}. Fusível aberto protege o circuito — ache a causa (curto/sobrecorrente). Nunca aumente o ampère por conveniência.`
  }
  if (q.includes('relé') || q.includes('rele')) {
    return `Resposta: ${ans}. Separe bobina (85/86) de contato (30/87). Click ≠ passagem de potência.`
  }
  if (q.includes('massa') || q.includes('terra') || q.includes('gnd')) {
    return `Resposta: ${ans}. Massa ruim aparece como VD elevado sob carga entre o ponto e o − da bateria.`
  }
  const pack = MODULE_PACKS[modId] || MODULE_PACKS[1]
  return `Resposta: ${ans}. Em ${pack.focus} (“${title}”), priorize evidência medida antes de substituir componente. Confirme sempre a especificação OEM.`
}

function enrichLesson(filePath, modId) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const lesson = JSON.parse(raw)
  const title = lesson.title || path.basename(filePath)
  let content = Array.isArray(lesson.content) ? [...lesson.content] : []

  // Improve quiz explanations always
  let quizFixed = 0
  content = content.map((b) => {
    if (b.type !== 'quiz') return b
    const expl = b.explanation || ''
    if (!expl || expl.includes('Revise a medição') || expl.includes('Na oficina, evidência')) {
      quizFixed += 1
      return { ...b, explanation: improveExplanation(b, modId, title) }
    }
    return b
  })

  let inserted = false
  if (!alreadyEnriched(content)) {
    const enrichBlocks = buildBlocks(modId, title)
    // Insert before first quiz or simulator; if none, append before end
    let idx = content.findIndex((b) => b.type === 'quiz' || b.type === 'simulator')
    if (idx < 0) idx = content.length
    // Prefer after existing educational text: skip leading texts/callouts/tables until we hit sim/quiz
    // Actually insert just before first quiz/sim is fine
    content = [...content.slice(0, idx), ...enrichBlocks, ...content.slice(idx)]
    inserted = true
  }

  lesson.content = content
  fs.writeFileSync(filePath, JSON.stringify(lesson, null, 4) + '\n')
  return { inserted, quizFixed, title }
}

function copyToPublic(modName, file) {
  const src = path.join(ROOT, modName, file)
  const destDir = path.join(PUBLIC, modName)
  fs.mkdirSync(destDir, { recursive: true })
  fs.copyFileSync(src, path.join(destDir, file))
}

let stats = { lessons: 0, inserted: 0, quizFixed: 0, modules: 0 }

for (const ent of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!ent.isDirectory() || !/^modulo\d+$/.test(ent.name)) continue
  const modId = Number(ent.name.replace('modulo', ''))
  stats.modules += 1
  const dir = path.join(ROOT, ent.name)
  for (const file of fs.readdirSync(dir)) {
    if (!/^aula\d+\.json$/.test(file)) continue
    const r = enrichLesson(path.join(dir, file), modId)
    copyToPublic(ent.name, file)
    stats.lessons += 1
    if (r.inserted) stats.inserted += 1
    stats.quizFixed += r.quizFixed
  }
  // sync index if exists
  const idx = path.join(dir, 'index.json')
  if (fs.existsSync(idx)) copyToPublic(ent.name, 'index.json')
}

console.log(JSON.stringify(stats, null, 2))
