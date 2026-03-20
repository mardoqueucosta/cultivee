export interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: "Agro" | "Educa" | "Tech";
  categoryColor: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
}

export const blogArticles: BlogArticle[] = [
  {
    id: 1,
    slug: "como-iniciar-cultivo-microverdes-em-casa",
    title: "Como iniciar seu cultivo de microverdes em casa",
    excerpt: "Guia completo para começar a cultivar microverdes na sua cozinha com poucos recursos e colher em até 14 dias.",
    category: "Agro",
    categoryColor: "bg-agro",
    author: "Equipe Cultivee",
    date: "05 Fev 2025",
    readTime: "8 min",
    image: "/placeholder.svg",
    content: `
## O que são microverdes?

Microverdes são plantas jovens colhidas logo após o surgimento das primeiras folhas verdadeiras, geralmente entre 7 e 21 dias após a germinação. São diferentes dos brotos, pois crescem em substrato e são colhidos acima da linha do solo.

Essas pequenas plantas concentram nutrientes de forma impressionante — estudos indicam que podem conter de 4 a 40 vezes mais nutrientes que suas versões adultas. Além disso, adicionam cor, textura e sabor intenso aos pratos.

## Por que cultivar em casa?

### Vantagens do cultivo doméstico

1. **Frescor garantido**: Colha minutos antes de consumir
2. **Economia**: Pacotes de microverdes no mercado custam caro; produza por uma fração do valor
3. **Controle total**: Sem agrotóxicos, você sabe exatamente o que está consumindo
4. **Espaço mínimo**: Uma janela ensolarada ou uma prateleira com luz LED já é suficiente

## Materiais necessários

Para começar seu primeiro cultivo, você vai precisar de:

- **Bandejas rasas** (5-7 cm de profundidade)
- **Substrato**: fibra de coco, vermiculita ou papel toalha
- **Sementes para microverdes** (girassol, rabanete, rúcula, mostarda, ervilha)
- **Borrifador**
- **Luz natural ou artificial** (LED full spectrum)

### Dica importante

Compre sementes específicas para microverdes ou sementes orgânicas não tratadas. Sementes comuns de jardinagem podem conter fungicidas que você não quer consumir.

## Passo a passo do cultivo

### Dia 1: Preparação e semeadura

1. Higienize as bandejas com água e sabão
2. Adicione 2-3 cm de substrato úmido
3. Espalhe as sementes de forma densa, mas sem sobreposição
4. Borrife água para umedecer
5. Cubra com outra bandeja ou pano escuro

### Dias 2-4: Fase de blackout

Mantenha as sementes cobertas em local escuro. Isso força as plantas a crescerem em busca de luz, resultando em caules mais longos. Borrife água 1-2x por dia.

### Dias 5-10: Exposição à luz

Retire a cobertura e exponha à luz. As folhas começarão a ficar verdes através da fotossíntese. Continue regando diariamente, mantendo o substrato úmido mas não encharcado.

### Dias 10-14: Colheita

Quando as primeiras folhas verdadeiras estiverem desenvolvidas, é hora de colher! Use uma tesoura limpa e corte acima da linha do substrato.

## Espécies recomendadas para iniciantes

| Espécie | Tempo de colheita | Sabor |
|---------|-------------------|-------|
| Girassol | 10-12 dias | Nozes, crocante |
| Rabanete | 6-8 dias | Picante, apimentado |
| Ervilha | 12-14 dias | Doce, fresco |
| Mostarda | 8-10 dias | Picante, mostarda |
| Rúcula | 10-12 dias | Levemente amargo |

## Problemas comuns e soluções

### Mofo branco nas sementes

**Causa**: Excesso de umidade e pouca ventilação.
**Solução**: Reduza a rega e aumente a circulação de ar. Atenção: não confunda mofo com os pelos radiculares brancos das raízes — esses são normais!

### Plantas tombando (damping-off)

**Causa**: Fungo causado por substrato muito úmido.
**Solução**: Use substrato estéril e não encharcue.

### Crescimento lento

**Causa**: Pouca luz ou temperatura baixa.
**Solução**: Forneça 12-16 horas de luz e mantenha temperatura entre 18-24°C.

## Próximos passos

Depois de dominar o básico, você pode:

- Experimentar espécies mais desafiadoras (beterraba, coentro, manjericão)
- Montar um sistema com prateleiras e iluminação LED
- Começar a comercializar sua produção

Na Cultivee, oferecemos um curso completo de microverdes que vai do básico à comercialização. Você aprende na prática com quem produz e vende microverdes há anos.

---

*Quer aprofundar seus conhecimentos? Conheça nosso [Curso de Microverdes](/agro) e comece sua jornada no cultivo profissional.*
    `,
  },
  {
    id: 2,
    slug: "5-erros-comuns-escrita-tcc",
    title: "5 erros comuns na escrita do TCC e como evitá-los",
    excerpt: "Descubra os principais erros que estudantes cometem ao escrever o TCC e aprenda estratégias para produzir um trabalho de excelência.",
    category: "Educa",
    categoryColor: "bg-educa",
    author: "Equipe Cultivee",
    date: "02 Fev 2025",
    readTime: "6 min",
    image: "/placeholder.svg",
    content: `
## Introdução

O Trabalho de Conclusão de Curso (TCC) representa um dos maiores desafios da graduação. Após anos de estudo, o aluno precisa demonstrar sua capacidade de pesquisa, análise crítica e produção textual acadêmica.

Infelizmente, muitos estudantes cometem erros evitáveis que comprometem a qualidade do trabalho — e, consequentemente, suas notas. Neste artigo, identificamos os 5 erros mais comuns e mostramos como evitá-los.

## Erro 1: Começar a escrever sem planejamento

### O problema

Muitos estudantes abrem o documento em branco e começam a escrever a introdução sem ter clareza sobre o resto do trabalho. O resultado? Textos desconexos, retrabalho constante e a temida "síndrome da página em branco".

### A solução

**Estruture antes de escrever.** Crie um esqueleto do trabalho com:

1. Título provisório
2. Problema de pesquisa (pergunta central)
3. Objetivo geral e específicos
4. Hipótese ou tese
5. Metodologia resumida
6. Tópicos de cada capítulo

Com essa estrutura, você sabe exatamente o que precisa escrever em cada seção. A escrita flui naturalmente porque você tem um mapa.

## Erro 2: Revisão bibliográfica sem critério

### O problema

Copiar e colar citações aleatórias sem conexão entre elas. O capítulo de revisão bibliográfica vira uma "colcha de retalhos" sem fio condutor.

### A solução

**Organize sua revisão por temas, não por autores.** Em vez de dedicar parágrafos a cada autor isoladamente, agrupe as referências por conceitos ou debates:

❌ Errado:
> Silva (2020) afirma que... Já Santos (2019) diz que... Por outro lado, Oliveira (2021) defende que...

✅ Correto:
> O conceito de sustentabilidade na agricultura tem sido debatido sob diferentes perspectivas. Uma vertente enfatiza os aspectos econômicos (SILVA, 2020; SANTOS, 2019), enquanto outra prioriza os impactos ambientais (OLIVEIRA, 2021).

## Erro 3: Metodologia vaga ou genérica

### O problema

Descrever a metodologia de forma superficial: "Foi realizada uma pesquisa bibliográfica e documental." Isso não permite que outro pesquisador replique seu estudo.

### A solução

**Seja específico e detalhado.** Responda:

- **O que** foi analisado? (corpus, amostra, dados)
- **Como** foi coletado? (instrumento, período, fonte)
- **Como** foi analisado? (método, software, categorias)
- **Por que** essas escolhas? (justificativa metodológica)

Exemplo melhorado:
> Foram analisados 45 artigos publicados entre 2018 e 2023 na base Scopus, utilizando os descritores "urban agriculture" AND "food security". Os dados foram categorizados através de análise de conteúdo temática (BARDIN, 2011), com apoio do software NVivo 12.

## Erro 4: Conclusão que apenas repete a introdução

### O problema

A conclusão se limita a repetir o que já foi dito na introdução, sem trazer síntese crítica ou contribuições originais.

### A solução

**A conclusão deve mostrar o que você descobriu, não o que pretendia descobrir.** Estruture assim:

1. **Retome o problema** (1 parágrafo)
2. **Sintetize os achados principais** (2-3 parágrafos)
3. **Destaque contribuições e limitações** (1 parágrafo)
4. **Sugira estudos futuros** (1 parágrafo)

Dica: Se sua conclusão faz sentido antes de você ter feito a pesquisa, ela está errada.

## Erro 5: Ignorar as normas ABNT

### O problema

Margens erradas, citações mal formatadas, referências incompletas. Esses "detalhes" transmitem amadorismo e podem custar pontos valiosos.

### A solução

**Domine as normas desde o início.** As principais NBRs para trabalhos acadêmicos são:

- **NBR 14724**: Estrutura de trabalhos acadêmicos
- **NBR 10520**: Citações
- **NBR 6023**: Referências
- **NBR 6024**: Numeração progressiva
- **NBR 6028**: Resumo

Use ferramentas como Mendeley ou Zotero para gerenciar referências automaticamente. Configure seu editor de texto (Word ou Google Docs) com as margens corretas desde o primeiro dia.

## Bônus: Checklist antes de entregar

Antes de submeter seu TCC, verifique:

- [ ] O título reflete o conteúdo do trabalho?
- [ ] O problema de pesquisa está claro e é respondido na conclusão?
- [ ] Todas as citações têm referência correspondente?
- [ ] A metodologia é replicável?
- [ ] O texto foi revisado por outra pessoa?
- [ ] As normas ABNT estão corretas?

## Conclusão

Evitar esses cinco erros já coloca seu TCC acima da média. Mas se você quer um método estruturado para escrever com confiança e excelência, conheça o Método MEAD — Escrita Acadêmica Descomplicada.

---

*Está escrevendo seu TCC, dissertação ou tese? Conheça nosso [Curso de Escrita Acadêmica](/educa) e transforme sua produção científica.*
    `,
  },
  {
    id: 3,
    slug: "arduino-iniciantes-primeiros-passos-automacao",
    title: "Arduino para iniciantes: primeiros passos na automação",
    excerpt: "Introdução prática ao Arduino para quem quer começar a automatizar projetos e criar protótipos funcionais.",
    category: "Tech",
    categoryColor: "bg-tech",
    author: "Equipe Cultivee",
    date: "30 Jan 2025",
    readTime: "10 min",
    image: "/placeholder.svg",
    content: `
## O que é Arduino?

Arduino é uma plataforma de prototipagem eletrônica open-source que combina hardware (placas com microcontroladores) e software (ambiente de programação). Criado em 2005 na Itália, democratizou o acesso à eletrônica e programação embarcada.

Com Arduino, você pode criar desde projetos simples (piscar um LED) até sistemas complexos (automação residencial, robôs, instrumentação científica).

## Por que começar com Arduino?

### Vantagens para iniciantes

1. **Curva de aprendizado suave**: Você vê resultados rapidamente
2. **Comunidade gigante**: Milhares de tutoriais e projetos disponíveis
3. **Custo acessível**: Kits iniciais por menos de R$ 100
4. **Versatilidade**: Da arte interativa à agricultura de precisão
5. **Base para avançar**: Conceitos aplicáveis a outras plataformas (ESP32, Raspberry Pi)

## Componentes essenciais

Para começar, você precisa de um kit básico:

### Hardware

| Componente | Função |
|------------|--------|
| Arduino Uno | Placa principal (cérebro do projeto) |
| Cabo USB | Alimentação e comunicação com PC |
| Protoboard | Montagem de circuitos sem solda |
| Jumpers | Fios de conexão |
| LEDs | Saída visual |
| Resistores | Proteção dos componentes |
| Botões | Entrada de usuário |
| Sensores | Leitura do ambiente (temperatura, luz, etc.) |

### Software

- **Arduino IDE**: Ambiente de programação gratuito
- Disponível para Windows, Mac e Linux
- Download em: arduino.cc/en/software

## Seu primeiro projeto: Piscar um LED

Vamos fazer o "Hello World" do Arduino — piscar um LED.

### Circuito

O Arduino Uno já possui um LED embutido conectado ao pino 13. Para este primeiro projeto, não precisamos montar nada externamente.

### Código

\`\`\`cpp
// Define o pino do LED
const int LED_PIN = 13;

void setup() {
  // Configura o pino como saída
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);  // Liga o LED
  delay(1000);                   // Espera 1 segundo
  digitalWrite(LED_PIN, LOW);   // Desliga o LED
  delay(1000);                   // Espera 1 segundo
}
\`\`\`

### Entendendo o código

- **setup()**: Executa uma vez quando o Arduino liga. Usamos para configurações iniciais.
- **loop()**: Executa infinitamente após o setup. É o coração do programa.
- **pinMode()**: Define se um pino será entrada (INPUT) ou saída (OUTPUT)
- **digitalWrite()**: Envia sinal alto (HIGH = 5V) ou baixo (LOW = 0V)
- **delay()**: Pausa a execução por X milissegundos

## Segundo projeto: Leitura de sensor de temperatura

Agora vamos ler dados do ambiente usando o sensor DHT11.

### Materiais adicionais

- Sensor DHT11 (temperatura e umidade)
- Resistor 10kΩ
- 3 jumpers

### Circuito

1. VCC do DHT11 → 5V do Arduino
2. GND do DHT11 → GND do Arduino
3. DATA do DHT11 → Pino 2 do Arduino (com resistor pull-up de 10kΩ)

### Código

\`\`\`cpp
#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float temperatura = dht.readTemperature();
  float umidade = dht.readHumidity();
  
  if (isnan(temperatura) || isnan(umidade)) {
    Serial.println("Erro na leitura do sensor!");
    return;
  }
  
  Serial.print("Temperatura: ");
  Serial.print(temperatura);
  Serial.print("°C | Umidade: ");
  Serial.print(umidade);
  Serial.println("%");
  
  delay(2000);
}
\`\`\`

### Instalando bibliotecas

1. Abra o Arduino IDE
2. Vá em Sketch > Incluir Biblioteca > Gerenciar Bibliotecas
3. Pesquise "DHT sensor library" by Adafruit
4. Clique em Instalar

## Conceitos fundamentais

### Entradas e saídas

- **Digitais**: Apenas dois estados (HIGH/LOW, 1/0, 5V/0V)
- **Analógicas**: Valores de 0 a 1023 (entrada) ou 0 a 255 (saída PWM)

### Comunicação Serial

O Arduino pode enviar dados para o computador via USB. Use o Monitor Serial (Ctrl+Shift+M) para visualizar.

### PWM (Pulse Width Modulation)

Simula saída analógica variando a proporção de tempo ligado/desligado. Útil para controlar intensidade de LEDs ou velocidade de motores.

## Aplicações na agricultura

O Arduino tem papel central na agricultura de precisão:

- **Monitoramento de solo**: Sensores de umidade, pH, temperatura
- **Irrigação automatizada**: Acionamento de bombas e válvulas
- **Estufas inteligentes**: Controle de ventilação e iluminação
- **Hidroponia**: Monitoramento de pH e condutividade elétrica

Na Cultivee, usamos Arduino e ESP32 para automatizar nossos sistemas de cultivo indoor — e ensinamos essas técnicas no Curso de Instrumentação.

## Próximos passos

Depois de dominar o básico:

1. Explore mais sensores (ultrassônico, LDR, acelerômetro)
2. Aprenda sobre displays (LCD, OLED)
3. Conecte à internet com ESP8266 ou ESP32
4. Integre com aplicativos mobile
5. Desenvolva projetos completos para resolver problemas reais

## Recursos recomendados

- **Documentação oficial**: docs.arduino.cc
- **Simulador online**: Tinkercad Circuits
- **Comunidade**: Forum do Arduino, Stack Overflow

---

*Quer aprender instrumentação de forma estruturada? Conheça nosso [Curso de Instrumentação](/tech) e construa suas próprias soluções tecnológicas.*
    `,
  },
  {
    id: 4,
    slug: "hidroponia-nft-sistema-eficiente-pequenos-espacos",
    title: "Hidroponia NFT: o sistema mais eficiente para pequenos espaços",
    excerpt: "Entenda como funciona o sistema NFT de hidroponia e por que ele é ideal para cultivo em ambientes urbanos.",
    category: "Agro",
    categoryColor: "bg-agro",
    author: "Equipe Cultivee",
    date: "28 Jan 2025",
    readTime: "7 min",
    image: "/placeholder.svg",
    content: `
## O que é o sistema NFT?

NFT significa "Nutrient Film Technique" (Técnica do Filme Nutriente). É um sistema hidropônico onde uma fina camada de solução nutritiva flui continuamente pelas raízes das plantas, mantidas em canais inclinados.

Desenvolvido na Inglaterra nos anos 1960, o NFT se tornou um dos sistemas mais populares para cultivo comercial de folhosas, especialmente alface e rúcula.

## Como funciona

### Componentes principais

1. **Reservatório**: Armazena a solução nutritiva
2. **Bomba submersa**: Circula a solução
3. **Canais de cultivo**: Tubos ou calhas onde ficam as plantas
4. **Suportes para mudas**: Copos de rede ou cubos de espuma
5. **Retorno**: Tubulação que devolve a solução ao reservatório

### O princípio

A bomba eleva a solução nutritiva até a extremidade mais alta dos canais. Por gravidade, a solução desce formando uma película fina (film) de 2-3mm que banha as raízes.

As raízes ficam parcialmente expostas ao ar, garantindo oxigenação, enquanto absorvem água e nutrientes do filme que passa.

## Vantagens do NFT

### Para pequenos espaços

| Vantagem | Benefício |
|----------|-----------|
| Vertical | Empilhe múltiplos níveis de canais |
| Leve | Não usa substrato pesado |
| Limpo | Sem terra, menos bagunça |
| Compacto | Alta densidade de plantas/m² |

### Eficiência

- **Economia de água**: 90% menos que cultivo em solo
- **Ciclos rápidos**: Alface em 30-40 dias
- **Sem perda de nutrientes**: Sistema fechado recirculante
- **Automação fácil**: Timer na bomba, pronto

## Desvantagens (e como contornar)

### Dependência de energia

Se a bomba para, as raízes secam rapidamente.

**Solução**: Tenha um nobreak ou gerador para sistemas maiores. Para hobby, o risco é menor.

### Controle de pH e EC

A solução precisa de monitoramento regular.

**Solução**: Medidores de pH e condutividade elétrica (EC). Sistemas profissionais usam controladores automáticos.

### Não serve para todas as plantas

Raízes grandes ou plantas pesadas não se adaptam bem.

**Solução**: Use NFT para folhosas e ervas. Para tomates e pimentões, prefira sistemas com substrato.

## Montando seu sistema NFT

### Lista de materiais

**Estrutura**:
- Perfis de alumínio ou madeira tratada
- Parafusos e cantoneiras

**Hidráulico**:
- Reservatório (caixa d'água 50-100L)
- Bomba submersa (vazão mínima 400L/h)
- Tubos de PVC 100mm (canais)
- Conexões e registros
- Mangueira de retorno

**Cultivo**:
- Copos de rede 5cm
- Espuma fenólica ou lã de rocha
- Solução nutritiva para hidroponia

### Passo a passo resumido

1. **Monte a estrutura** com inclinação de 2-4%
2. **Prepare os canais** fazendo furos para os copos
3. **Instale o reservatório** na parte mais baixa
4. **Conecte a bomba** e o sistema de distribuição
5. **Faça o retorno** para o reservatório
6. **Teste com água limpa** antes de adicionar nutrientes
7. **Calibre pH e EC** da solução
8. **Transplante as mudas** e inicie o cultivo

## Solução nutritiva

### Preparo básico

Use fertilizantes solúveis específicos para hidroponia. Os mais comuns vêm em duas partes (A+B) que não podem ser misturadas concentradas.

**Diluição típica para alface**:
- Parte A: 1,5 mL/L
- Parte B: 1,5 mL/L
- EC final: 1.2-1.8 mS/cm
- pH: 5.5-6.5

### Manutenção semanal

1. Verifique o nível do reservatório
2. Meça pH e EC
3. Complete com água ou ajuste concentração
4. Troque a solução completamente a cada 2-3 semanas

## Espécies recomendadas para NFT

### Folhosas (ciclo 30-40 dias)
- Alface (todos os tipos)
- Rúcula
- Agrião
- Espinafre
- Couve

### Ervas (ciclo 40-60 dias)
- Manjericão
- Hortelã
- Cebolinha
- Salsa
- Coentro

### Morangos
Sim, morangos se adaptam bem ao NFT! Ciclo mais longo (90-120 dias para primeira produção), mas alta produtividade.

## Escala: do hobby ao comercial

### Hobby (1-2 canais)
- 10-20 plantas
- Reservatório de 20-50L
- Produção para consumo próprio

### Semi-comercial (4-8 canais)
- 50-100 plantas
- Reservatório de 100-200L
- Venda para vizinhos e feiras

### Comercial (bancadas múltiplas)
- 500+ plantas
- Reservatórios de 500-1000L
- Controle automatizado
- Venda para mercados e restaurantes

## Custos estimados

| Escala | Investimento inicial | Custo mensal |
|--------|---------------------|--------------|
| Hobby | R$ 300-500 | R$ 50-80 |
| Semi-comercial | R$ 1.000-2.500 | R$ 150-300 |
| Comercial | R$ 5.000-15.000 | R$ 500-1.500 |

*Valores aproximados, podem variar por região e fornecedores.*

## Conclusão

O sistema NFT é a porta de entrada ideal para quem quer produzir alimentos em espaços reduzidos. Com baixo investimento inicial e curva de aprendizado acessível, você pode ter folhosas frescas o ano todo.

Na Cultivee, praticamos o que ensinamos. Nossas hortaliças são cultivadas em sistemas NFT e vendemos para clientes locais. No curso de Hidroponia, você aprende a montar, operar e até comercializar sua produção.

---

*Quer montar seu sistema NFT? Conheça nosso [Curso de Hidroponia e Cultivo Indoor](/agro) e aprenda do zero à comercialização.*
    `,
  },
  {
    id: 5,
    slug: "como-estruturar-revisao-bibliografica-eficiente",
    title: "Como estruturar uma revisão bibliográfica eficiente",
    excerpt: "Método passo a passo para organizar e escrever a revisão de literatura do seu trabalho acadêmico.",
    category: "Educa",
    categoryColor: "bg-educa",
    author: "Equipe Cultivee",
    date: "25 Jan 2025",
    readTime: "9 min",
    image: "/placeholder.svg",
    content: `
## O que é revisão bibliográfica?

A revisão bibliográfica (ou revisão de literatura) é a seção do trabalho acadêmico onde você apresenta o estado atual do conhecimento sobre seu tema. Não é apenas um resumo de obras — é uma análise crítica e organizada das principais contribuições existentes.

Uma boa revisão bibliográfica:
- Contextualiza seu problema de pesquisa
- Demonstra domínio do tema
- Identifica lacunas que seu trabalho pretende preencher
- Fundamenta suas escolhas metodológicas

## Por que tantos estudantes têm dificuldade?

### Problemas comuns

1. **Não saber por onde começar**: Milhares de artigos, qual escolher?
2. **Falta de organização**: Ler muito, anotar pouco, esquecer tudo
3. **Escrita fragmentada**: Parágrafos desconexos, sem fio condutor
4. **Excesso de citações diretas**: O texto vira colagem de citações
5. **Ausência de voz autoral**: Onde está sua análise crítica?

## O método dos 5 passos

### Passo 1: Defina seu escopo

Antes de sair lendo tudo, delimite:

**Perguntas orientadoras:**
- Qual é minha questão central de pesquisa?
- Quais são os 3-5 conceitos-chave que preciso fundamentar?
- Qual recorte temporal faz sentido? (últimos 5 anos? 10 anos?)
- Há áreas do conhecimento específicas ou interdisciplinares?

**Exemplo:**
> Tema: Agricultura urbana e segurança alimentar
> Conceitos-chave: agricultura urbana, segurança alimentar, hortas comunitárias, soberania alimentar
> Recorte: 2015-2024, foco em América Latina
> Áreas: Agronomia, Sociologia, Políticas Públicas

### Passo 2: Busque de forma sistemática

Use bases de dados acadêmicas com estratégia:

**Bases recomendadas:**
- Google Scholar (abrangente, gratuito)
- Scopus (artigos internacionais)
- Web of Science (alto impacto)
- SciELO (Brasil e América Latina)
- Periódicos CAPES (acesso institucional)

**Construa strings de busca:**

\`\`\`
("agricultura urbana" OR "urban agriculture") 
AND 
("segurança alimentar" OR "food security")
AND
(Brasil OR Brazil)
\`\`\`

**Dicas de busca:**
- Use aspas para termos exatos
- OR expande resultados (sinônimos)
- AND restringe resultados (intersecção)
- Filtre por ano, tipo de documento, idioma

### Passo 3: Selecione e organize

Nem tudo que aparece na busca merece entrar na revisão.

**Critérios de seleção:**
- Relevância para sua questão de pesquisa
- Qualidade do periódico ou editora
- Citações recebidas (indicador de impacto)
- Atualidade (para temas em evolução rápida)

**Organize com ferramentas:**

| Ferramenta | Função |
|------------|--------|
| Mendeley | Gerenciador de referências + PDF |
| Zotero | Similar ao Mendeley, open source |
| Notion/Obsidian | Notas interligadas |
| Planilha | Controle simples de leitura |

**Crie uma planilha de controle:**

| Autor/Ano | Título | Conceito principal | Metodologia | Achados-chave | Útil para qual seção? |
|-----------|--------|-------------------|-------------|---------------|----------------------|

### Passo 4: Leia ativamente e fichue

Ler academicamente não é ler passivamente.

**Método de fichamento:**

Para cada texto relevante, registre:

1. **Referência completa** (já formatada em ABNT)
2. **Objetivo** do estudo
3. **Metodologia** usada
4. **Principais resultados**
5. **Citações diretas** potencialmente úteis (com página!)
6. **Suas observações**: concordâncias, críticas, conexões com outros textos

**Exemplo de ficha:**

> **SOUZA, M. A. (2020)**. Hortas urbanas e coesão social. *Revista de Estudos Urbanos*, v. 15, n. 2, p. 45-67.
>
> **Objetivo**: Analisar impactos sociais de hortas comunitárias em São Paulo
>
> **Metodologia**: Estudo de caso qualitativo, 3 hortas, 25 entrevistas
>
> **Achados**: Hortas fortalecem vínculos comunitários e reduzem insegurança alimentar leve
>
> **Citação útil**: "A horta comunitária funciona como espaço de encontro e produção de saberes, transcendendo sua função alimentar" (p. 58)
>
> **Minha análise**: Confirma hipótese sobre dimensão social. Limitação: não avalia impacto nutricional quantitativo.

### Passo 5: Escreva por temas, não por autores

Este é o erro mais comum: escrever um parágrafo para cada autor.

**❌ Errado (organização por autor):**

> Silva (2019) estudou hortas em São Paulo e concluiu que...
> 
> Já Santos (2020) pesquisou hortas no Rio de Janeiro e afirmou que...
>
> Por sua vez, Oliveira (2018) analisou hortas em Curitiba e descobriu que...

**✅ Correto (organização por tema):**

> O impacto social das hortas comunitárias tem sido documentado em diversas capitais brasileiras. Estudos em São Paulo (SILVA, 2019), Rio de Janeiro (SANTOS, 2020) e Curitiba (OLIVEIRA, 2018) convergem ao identificar o fortalecimento de vínculos comunitários como benefício central. No entanto, diferem quanto ao papel das políticas públicas: enquanto Silva (2019) destaca iniciativas municipais como catalisadoras, Oliveira (2018) enfatiza a organização autônoma dos moradores.

**Estrutura recomendada para a revisão:**

1. **Introdução da seção**: Apresente a organização do capítulo
2. **Bloco temático 1**: Conceito A + autores que o discutem
3. **Bloco temático 2**: Conceito B + autores que o discutem
4. **Bloco temático 3**: Conexões entre conceitos + debates/lacunas
5. **Síntese final**: O que a literatura diz (e o que falta)

## Erros a evitar

### Excesso de citações diretas

Citação direta (entre aspas) deve ser usada quando:
- As palavras exatas do autor são essenciais
- A formulação é especialmente eloquente
- Você vai analisar criticamente aquela frase

Para o resto, use paráfrase (citação indireta).

### Falta de transições

Use conectivos para criar fluxo:
- Adição: além disso, também, igualmente
- Contraste: no entanto, por outro lado, em contrapartida
- Causa: portanto, assim, consequentemente
- Exemplificação: por exemplo, especificamente, como demonstra

### Ausência de posicionamento crítico

Não seja apenas porta-voz dos autores. Comente:
- Convergências e divergências entre estudos
- Pontos fortes e limitações metodológicas
- Como cada contribuição se relaciona com sua pesquisa

## Checklist final

Antes de considerar sua revisão pronta:

- [ ] Os conceitos-chave estão bem definidos e fundamentados?
- [ ] Há equilíbrio entre autores clássicos e estudos recentes?
- [ ] O texto tem fio condutor claro entre os parágrafos?
- [ ] Predominam paráfrases (citações indiretas)?
- [ ] Sua voz aparece, analisando e conectando ideias?
- [ ] A lacuna que justifica sua pesquisa está identificada?
- [ ] Todas as citações têm referência correspondente?

## Conclusão

Uma revisão bibliográfica bem feita é metade do caminho para um TCC, dissertação ou tese de qualidade. Mais do que demonstrar leitura, ela mostra que você entende o campo e sabe onde seu trabalho se posiciona.

O método apresentado aqui — escopo → busca → seleção → fichamento → escrita temática — funciona para qualquer nível acadêmico e área do conhecimento.

---

*Quer dominar a escrita acadêmica do início ao fim? Conheça nosso [Curso MEAD - Escrita Acadêmica Descomplicada](/educa) e transforme seu TCC.*
    `,
  },
  {
    id: 6,
    slug: "sensores-agricultura-guia-escolha-implementacao",
    title: "Sensores para agricultura: guia de escolha e implementação",
    excerpt: "Conheça os principais sensores usados em agricultura de precisão e como integrá-los aos seus projetos.",
    category: "Tech",
    categoryColor: "bg-tech",
    author: "Equipe Cultivee",
    date: "22 Jan 2025",
    readTime: "12 min",
    image: "/placeholder.svg",
    content: `
## Introdução à agricultura de precisão

A agricultura de precisão usa tecnologia para otimizar a produção agrícola. Em vez de tratar uma lavoura inteira de forma uniforme, ela permite decisões específicas para cada ponto do campo — ou cada planta, no caso de sistemas controlados.

Sensores são os "olhos" dessa agricultura inteligente. Eles coletam dados que, quando bem interpretados, se transformam em economia de insumos, aumento de produtividade e sustentabilidade.

## Tipos de sensores para agricultura

### 1. Sensores de umidade do solo

**O que medem**: Teor de água no solo

**Tecnologias principais**:

| Tipo | Princípio | Precisão | Custo |
|------|-----------|----------|-------|
| Resistivo | Resistência elétrica | Baixa | Muito baixo |
| Capacitivo | Capacitância dielétrica | Média | Baixo |
| TDR | Reflexometria no tempo | Alta | Alto |
| FDR | Reflexometria na frequência | Alta | Médio-alto |

**Recomendação para iniciantes**: Sensores capacitivos como o YL-69 ou Capacitive Soil Moisture Sensor v1.2. Custo baixo, precisão aceitável para projetos experimentais.

**Código exemplo (Arduino)**:

\`\`\`cpp
const int SENSOR_PIN = A0;
const int SECO = 800;      // Valor em solo seco
const int MOLHADO = 400;   // Valor em solo saturado

void setup() {
  Serial.begin(9600);
}

void loop() {
  int leitura = analogRead(SENSOR_PIN);
  int umidade = map(leitura, SECO, MOLHADO, 0, 100);
  umidade = constrain(umidade, 0, 100);
  
  Serial.print("Umidade do solo: ");
  Serial.print(umidade);
  Serial.println("%");
  
  delay(1000);
}
\`\`\`

### 2. Sensores de temperatura e umidade do ar

**O que medem**: Temperatura ambiente e umidade relativa do ar

**Opções populares**:

| Sensor | Temp. range | Precisão temp. | Precisão umidade | Interface |
|--------|-------------|----------------|------------------|-----------|
| DHT11 | 0-50°C | ±2°C | ±5% | Digital 1-wire |
| DHT22 | -40 a 80°C | ±0.5°C | ±2-5% | Digital 1-wire |
| BME280 | -40 a 85°C | ±1°C | ±3% | I2C/SPI |
| SHT31 | -40 a 125°C | ±0.2°C | ±2% | I2C |

**Recomendação**: DHT22 para projetos simples; BME280 para aplicações que também precisem de pressão atmosférica.

### 3. Sensores de luminosidade

**O que medem**: Intensidade da luz ambiente

**Opções**:

- **LDR (fotoresistor)**: Simples e barato, leitura analógica, não calibrado
- **BH1750**: Digital, mede em lux, alta precisão
- **TSL2591**: Alta sensibilidade, separa luz visível de infravermelho

**Aplicação em agricultura**: Controle de iluminação artificial em estufas e cultivo indoor. O ideal é medir PAR (Radiação Fotossinteticamente Ativa), mas sensores específicos são caros.

**Alternativa econômica**: Use BH1750 e aplique fator de conversão aproximado: PAR ≈ lux × 0.019 (para luz solar).

### 4. Sensores de pH

**O que medem**: Acidez/alcalinidade da solução ou solo

**Tipos**:

- **Sonda de pH analógica**: Requer calibração frequente, desgasta com uso
- **Módulo pH4502C**: Popular com Arduino, precisão moderada
- **Atlas Scientific**: Qualidade profissional, maior custo

**Cuidados importantes**:
- Armazene a sonda em solução de armazenamento (não água pura!)
- Calibre regularmente com soluções tampão (pH 4.0, 7.0)
- Não deixe secar

**Faixa ideal para hidroponia**: pH 5.5 - 6.5

### 5. Sensores de condutividade elétrica (EC)

**O que medem**: Concentração de sais/nutrientes dissolvidos

**Por que é importante**: Em hidroponia, a EC indica se a solução nutritiva está na concentração correta.

**Opções**:
- **Módulos analógicos**: Baratos, mas requerem compensação de temperatura
- **Atlas Scientific EC**: Profissional, compensação automática

**Faixas típicas de EC**:
| Cultura | EC ideal (mS/cm) |
|---------|------------------|
| Alface | 1.0 - 1.5 |
| Tomate | 2.0 - 3.5 |
| Morango | 1.0 - 1.5 |
| Pimenta | 1.5 - 2.5 |

### 6. Sensores de nível de água

**O que medem**: Presença ou nível de água em reservatórios

**Opções**:
- **Boia mecânica**: Simples, confiável, barata
- **Sensor ultrassônico (HC-SR04)**: Mede distância até a superfície
- **Sensor de pressão**: Para tanques fechados

**Código exemplo (HC-SR04)**:

\`\`\`cpp
const int TRIG = 9;
const int ECHO = 10;
const float ALTURA_TANQUE = 50.0; // cm

void setup() {
  Serial.begin(9600);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
}

void loop() {
  // Envia pulso
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  
  // Calcula distância
  long duracao = pulseIn(ECHO, HIGH);
  float distancia = duracao * 0.034 / 2;
  float nivel = ALTURA_TANQUE - distancia;
  float percentual = (nivel / ALTURA_TANQUE) * 100;
  
  Serial.print("Nível: ");
  Serial.print(percentual);
  Serial.println("%");
  
  delay(1000);
}
\`\`\`

## Arquitetura de um sistema de monitoramento

### Componentes básicos

1. **Sensores**: Coleta de dados
2. **Microcontrolador**: Processamento (Arduino, ESP32)
3. **Atuadores**: Ações (relés, válvulas, bombas)
4. **Comunicação**: Envio de dados (WiFi, LoRa, GSM)
5. **Dashboard**: Visualização (ThingSpeak, Blynk, Grafana)

### Fluxo de dados

\`\`\`
Sensores → Microcontrolador → Internet → Nuvem → Dashboard
                ↓
           Atuadores (irrigação, ventilação, etc.)
\`\`\`

### Escolhendo o microcontrolador

| Plataforma | Conectividade | Custo | Indicação |
|------------|---------------|-------|-----------|
| Arduino Uno | Nenhuma nativa | Baixo | Prototipagem inicial |
| ESP8266 | WiFi | Muito baixo | IoT simples |
| ESP32 | WiFi + Bluetooth | Baixo | IoT completo |
| Raspberry Pi | WiFi + Ethernet | Médio | Processamento local |

**Para projetos agrícolas conectados, o ESP32 é a melhor relação custo-benefício.**

## Considerações práticas

### Proteção dos componentes

Agricultura significa ambiente hostil: umidade, poeira, sol, chuva.

- Use caixas de proteção IP65 ou superior
- Aplique conformal coating nas placas
- Proteja conexões com fita auto-fusão
- Posicione painéis solares para alimentação autônoma

### Calibração e manutenção

Sensores descalibrados geram decisões erradas.

- **pH e EC**: Calibre semanalmente em sistemas críticos
- **Umidade do solo**: Verifique em amostras de referência
- **Temperatura**: Compare com termômetro de referência

### Consumo de energia

Para sistemas remotos movidos a bateria/solar:

- Use deep sleep no microcontrolador
- Ligue sensores apenas no momento da leitura
- Transmita dados em intervalos espaçados
- Escolha sensores de baixo consumo

## Projeto integrado: Estufa automatizada

Combinando os sensores apresentados, você pode criar uma estufa que:

1. **Monitora**: Temperatura, umidade do ar, umidade do solo, luminosidade
2. **Aciona**: Irrigação quando solo seco, ventilação quando quente, iluminação quando escuro
3. **Registra**: Dados históricos na nuvem
4. **Alerta**: Notificações por app quando há problemas

Este tipo de projeto une os três pilares da Cultivee:
- **Agro**: Conhecimento sobre cultivo e necessidades das plantas
- **Educa**: Metodologia de projeto e documentação
- **Tech**: Instrumentação e programação

## Conclusão

Sensores são a base de qualquer sistema de agricultura inteligente. Começar com projetos simples — um sensor de umidade controlando irrigação — e evoluir gradualmente é o caminho mais seguro.

Na Cultivee, ensinamos não apenas a conectar fios, mas a entender o sistema como um todo: da planta ao código, do sensor à decisão agronômica.

---

*Quer aprender instrumentação aplicada à agricultura? Conheça nosso [Curso de Instrumentação Prática](/tech) e construa seus próprios sistemas de monitoramento.*
    `,
  },
];

export const getArticleBySlug = (slug: string): BlogArticle | undefined => {
  return blogArticles.find((article) => article.slug === slug);
};

export const getRelatedArticles = (currentId: number, category: string, limit: number = 3): BlogArticle[] => {
  return blogArticles
    .filter((article) => article.id !== currentId)
    .sort((a, b) => (a.category === category ? -1 : 1))
    .slice(0, limit);
};
