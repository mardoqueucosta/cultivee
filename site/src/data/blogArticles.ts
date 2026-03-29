export interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: "Agro" | "Educa" | "Tech";
  categoryColor: string;
  author: string;
  date: string;
  updatedDate?: string;
  readTime: string;
  image: string;
  tldr: string;
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
    updatedDate: "28 Mar 2026",
    readTime: "8 min",
    image: "/blog/microverdes.jpg",
    tldr: "Microverdes são plantas jovens colhidas entre 7-21 dias, com até 40x mais nutrientes que as versões adultas. Você precisa apenas de bandejas rasas, substrato, sementes e luz. Custo inicial: R$ 30-80. Melhores para iniciantes: rabanete (7 dias) e girassol (10 dias).",
    content: `
## O que são microverdes?

Microverdes são plantas jovens colhidas logo após o surgimento das primeiras folhas verdadeiras, geralmente entre 7 e 21 dias após a germinação. São diferentes dos brotos, pois crescem em substrato e são colhidos acima da linha do solo.

Essas pequenas plantas concentram nutrientes de forma impressionante — estudos publicados na *Scientific Reports* (2025) confirmam que microverdes podem conter de **30 a 40 vezes mais vitaminas e carotenoides** que suas versões adultas. Um destaque é o brócolis: seus microverdes possuem de 10 a 100 vezes mais sulforafano que o brócolis maduro, um composto com propriedades anti-inflamatórias e anticancerígenas comprovadas.

## Por que cultivar em casa?

### Vantagens do cultivo doméstico

1. **Frescor garantido**: Colha minutos antes de consumir
2. **Economia**: No mercado brasileiro, uma bandeja de 40g custa entre R$ 6,50 e R$ 16,00 — produza por uma fração do valor
3. **Controle total**: Sem agrotóxicos, você sabe exatamente o que está consumindo
4. **Espaço mínimo**: Uma janela ensolarada ou uma prateleira com luz LED já é suficiente
5. **Ciclo ultra-rápido**: De 7 a 16 dias da semeadura à colheita

O mercado global de microverdes cresce a 10% ao ano e deve atingir US$ 5,99 bilhões até 2034. No Brasil, o consumo de hortaliças em miniatura cresce 15-20% ao ano, impulsionado pela alta gastronomia e pela busca por alimentação saudável.

## Materiais necessários

Para começar seu primeiro cultivo, você vai precisar de:

- **Bandejas rasas** (5-7 cm de profundidade)
- **Substrato**: fibra de coco, vermiculita ou papel toalha
- **Sementes para microverdes** (girassol, rabanete, rúcula, mostarda, ervilha)
- **Borrifador**
- **Luz natural ou artificial** (LED full spectrum ou branco frio 5500-6500K)

### Dica importante

Compre sementes específicas para microverdes ou sementes orgânicas não tratadas. Sementes comuns de jardinagem podem conter fungicidas que você não quer consumir.

### Iluminação LED otimizada

Se for usar luz artificial, o espectro ideal combina 60-85% luz vermelha + 10-20% azul + 10-20% verde. Na prática, LEDs brancos frios (5500-6500K) funcionam excelente para múltiplas variedades. Mantenha as lâmpadas a 15-30 cm da bandeja, ligadas por 12-16 horas/dia. Um setup básico com 3 lâmpadas tubulares de 20W por prateleira é suficiente.

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

| Espécie | Tempo de colheita | Sabor | Destaque |
|---------|-------------------|-------|----------|
| Brócolis | 8-12 dias | Suave, fresco | Líder mundial (21,8% do mercado), mais nutritivo |
| Girassol | 10-12 dias | Nozes, crocante | Ótimo para iniciantes, alta germinação |
| Rabanete | 6-8 dias | Picante, apimentado | O mais rápido, cor vibrante |
| Ervilha | 12-14 dias | Doce, fresco | Bestseller global, versátil |
| Rúcula | 10-12 dias | Levemente amargo | Boa para saladas |
| Mostarda | 8-10 dias | Picante | Fácil cultivo |

## Benefícios comprovados para a saúde

Pesquisas recentes (2025) confirmam propriedades impressionantes:

- **Anti-inflamatório**: Extratos de rabanete vermelho interagem com proteínas reguladoras de inflamação e estresse oxidativo
- **Controle glicêmico**: Ensaio clínico com 97 participantes mostrou que o sulforafano do brócolis reduziu a glicemia de jejum em até 6,5% em diabéticos tipo 2
- **Saúde cardiovascular**: Modulação imunológica e redução de radicais livres
- **Biodisponibilidade superior**: Nutrientes dos microverdes são absorvidos de forma mais eficiente que os de vegetais maduros

### Cuidado com a higiene

Um estudo de 2025 mostrou que patógenos podem migrar da água contaminada para os tecidos internos dos microverdes. Use sempre **água filtrada ou potável** na irrigação.

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
- Montar um sistema com prateleiras e iluminação LED dedicada
- Testar sistemas com IA — a Luya Tech apresentou no CES 2026 um sistema que aumenta a densidade nutricional em 30-50% com controle automatizado
- Começar a comercializar sua produção (rentabilidade de até R$ 688/m²/mês)

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
    updatedDate: "28 Mar 2026",
    readTime: "6 min",
    image: "/blog/tcc-escrita.jpg",
    tldr: "Os 5 erros mais comuns no TCC: começar sem planejamento, revisão bibliográfica sem critério, metodologia vaga, conclusão repetitiva e ignorar normas ABNT. Use ferramentas como Zotero, MORE (gerador ABNT gratuito) e IA de forma ética para evitá-los.",
    content: `
## Introdução

O Trabalho de Conclusão de Curso (TCC) representa um dos maiores desafios da graduação. Após anos de estudo, o aluno precisa demonstrar sua capacidade de pesquisa, análise crítica e produção textual acadêmica.

Os dados do INEP mostram que a evasão no ensino superior brasileiro é alta — mais da metade dos alunos sem bolsa não concluem o curso. Entre os que chegam ao TCC, os principais motivos de reprovação são plágio, tema mal delimitado e formatação incorreta. Neste artigo, identificamos os 5 erros mais comuns e mostramos como evitá-los.

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
6. Tópicos de cada seção

Com essa estrutura, você sabe exatamente o que precisa escrever em cada parte. A escrita flui naturalmente porque você tem um mapa.

**Dica**: Ferramentas de IA como o ChatGPT ou Claude podem ajudar no brainstorming de estrutura — mas lembre-se: use como assistente para organizar ideias, nunca para gerar texto final.

## Erro 2: Revisão bibliográfica sem critério

### O problema

Copiar e colar citações aleatórias sem conexão entre elas. O capítulo de revisão bibliográfica vira uma "colcha de retalhos" sem fio condutor.

### A solução

**Organize sua revisão por temas, não por autores.** Em vez de dedicar parágrafos a cada autor isoladamente, agrupe as referências por conceitos ou debates:

Errado:
> Silva (2020) afirma que... Já Santos (2019) diz que... Por outro lado, Oliveira (2021) defende que...

Correto:
> O conceito de sustentabilidade na agricultura tem sido debatido sob diferentes perspectivas. Uma vertente enfatiza os aspectos econômicos (SILVA, 2020; SANTOS, 2019), enquanto outra prioriza os impactos ambientais (OLIVEIRA, 2021).

Use ferramentas de descoberta como **Elicit**, **Consensus** ou **Connected Papers** para encontrar artigos relevantes de forma mais eficiente — pesquisas indicam redução de até 85% no tempo de busca com essas ferramentas.

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

## Erro 5: Ignorar as normas ABNT atualizadas

### O problema

Margens erradas, citações mal formatadas, referências incompletas. Esses "detalhes" transmitem amadorismo e podem custar pontos valiosos.

### A solução

**Domine as normas desde o início.** As principais NBRs atualizadas para trabalhos acadêmicos são:

- **NBR 14724:2024**: Estrutura de trabalhos acadêmicos — agora usa o termo "seções" em vez de "capítulos"; figuras de autoria própria devem indicar "elaboração própria"
- **NBR 10520**: Citações
- **NBR 6023:2025** (3ª edição, maio/2025): Referências — agora inclui posts em redes sociais, podcasts e documentos civis
- **NBR 6024**: Numeração progressiva
- **NBR 6028**: Resumo

Use gerenciadores de referências para automatizar a formatação. Os mais recomendados em 2025:

| Ferramenta | Destaque | Custo |
|------------|----------|-------|
| **Zotero** | Open source, 10.000+ estilos, plugins para Word/Google Docs | Gratuito |
| **Mendeley** | Sincroniza entre dispositivos, rede acadêmica | Gratuito (2GB) |
| **MORE** | Ferramenta brasileira, gera referências ABNT automaticamente | Gratuito |
| **BibGuru** | Gerador online de referências ABNT atualizado | Gratuito |

## Usando IA de forma ética no TCC

Muitas universidades brasileiras já publicaram diretrizes sobre o uso de IA na pesquisa (Unicamp, ANPOCS, SciELO). As regras gerais são:

**Pode usar IA para:**
- Brainstorming e estruturação de ideias
- Revisão gramatical e de estilo
- Organização de referências
- Sumarização de artigos para revisão de literatura

**Não use IA para:**
- Gerar texto integral e apresentar como próprio (é plágio)
- Confiar em citações geradas sem verificar na fonte original (modelos inventam referências)
- Inserir dados sensíveis de pesquisa em plataformas públicas

**Importante**: Declare o uso de IA no seu trabalho — muitas universidades exigem especificar a ferramenta, a versão, a data de uso e a etapa em que foi empregada.

## Bônus: Checklist antes de entregar

Antes de submeter seu TCC, verifique:

- [ ] O título reflete o conteúdo do trabalho?
- [ ] O problema de pesquisa está claro e é respondido na conclusão?
- [ ] Todas as citações têm referência correspondente?
- [ ] A metodologia é replicável?
- [ ] O texto foi revisado por outra pessoa?
- [ ] As normas ABNT estão na versão mais recente (2024/2025)?
- [ ] O uso de IA foi declarado, se aplicável?

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
    excerpt: "Introdução prática ao Arduino e ESP32 para quem quer começar a automatizar projetos e criar protótipos funcionais.",
    category: "Tech",
    categoryColor: "bg-tech",
    author: "Equipe Cultivee",
    date: "30 Jan 2025",
    updatedDate: "28 Mar 2026",
    readTime: "10 min",
    image: "/blog/arduino.jpg",
    tldr: "Arduino é uma plataforma open-source ideal para aprender eletrônica e automação. Para agricultura e IoT, o ESP32 é a melhor escolha (Wi-Fi + Bluetooth integrados, a partir de R$ 25). Comece com o projeto \"piscar LED\" e evolua para sensores de temperatura e umidade.",
    content: `
## O que é Arduino?

Arduino é uma plataforma de prototipagem eletrônica open-source que combina hardware (placas com microcontroladores) e software (ambiente de programação). Criado em 2005 na Itália, democratizou o acesso à eletrônica e programação embarcada.

Com Arduino, você pode criar desde projetos simples (piscar um LED) até sistemas complexos (automação residencial, robôs, instrumentação científica, agricultura de precisão).

## Por que começar com Arduino?

### Vantagens para iniciantes

1. **Curva de aprendizado suave**: Você vê resultados rapidamente
2. **Comunidade gigante**: Milhares de tutoriais e projetos disponíveis
3. **Custo acessível**: Kits iniciais a partir de R$ 50
4. **Versatilidade**: Da arte interativa à agricultura de precisão
5. **Base para avançar**: Conceitos aplicáveis a ESP32, Raspberry Pi e outras plataformas

## Arduino vs ESP32: qual escolher?

| Característica | Arduino Uno | ESP32 |
|---------------|-------------|-------|
| Processador | Single-core 16 MHz | Dual-core 240 MHz |
| Wi-Fi | Não (precisa de shield) | Integrado |
| Bluetooth | Não | Integrado |
| Preço (Brasil) | R$ 30-50 (clone) | R$ 40-70 |
| Ideal para | Aprender fundamentos | Projetos IoT e conectados |

**Recomendação**: Comece com Arduino para entender os fundamentos. Quando estiver confortável, migre para ESP32 — a melhor relação custo-benefício para projetos conectados.

### Variantes ESP32 em destaque (2025-2026)

- **ESP32-S3**: Foco em IA embarcada, aceleração de machine learning
- **ESP32-C3**: Primeiro RISC-V da Espressif, ultra-baixo consumo (~40 µA em deep sleep)
- **ESP32-C6**: Wi-Fi 6, Bluetooth 5.3 e suporte a Thread/Zigbee/Matter — ideal para smart home

## Componentes essenciais

Para começar, você precisa de um kit básico:

### Hardware

| Componente | Função | Preço estimado |
|------------|--------|----------------|
| Arduino Uno (clone) | Placa principal | R$ 30-50 |
| Cabo USB | Alimentação e comunicação | Incluso |
| Protoboard | Montagem sem solda | R$ 10-15 |
| Jumpers | Fios de conexão | R$ 8-12 |
| LEDs | Saída visual | R$ 5-10 |
| Resistores | Proteção dos componentes | R$ 5-10 |
| Botões | Entrada de usuário | R$ 5 |
| DHT22 | Temperatura e umidade | R$ 17-25 |

### Software

- **Arduino IDE 2.3.8** (versão mais recente): Ambiente de programação gratuito com autocompletar inteligente, debugger integrado e compilação mais rápida
- Disponível para Windows, Mac e Linux
- Download em: arduino.cc/en/software

**Novidade**: O Arduino IDE 2.x é baseado em Eclipse Theia (similar ao VS Code), muito mais moderno que o IDE 1.x. Inclui debugging estável desde a versão 2.3.

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

Agora vamos ler dados do ambiente usando o sensor DHT22 (mais preciso que o DHT11).

### Materiais adicionais

- Sensor DHT22 (temperatura e umidade, precisão ±0.5°C)
- Resistor 10kΩ
- 3 jumpers

### Circuito

1. VCC do DHT22 → 5V do Arduino
2. GND do DHT22 → GND do Arduino
3. DATA do DHT22 → Pino 2 do Arduino (com resistor pull-up de 10kΩ)

### Código

\`\`\`cpp
#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT22

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

O Arduino e o ESP32 têm papel central na agricultura de precisão:

- **Monitoramento de solo**: Sensores de umidade, pH, temperatura
- **Irrigação automatizada**: Acionamento de bombas e válvulas baseado em dados dos sensores
- **Estufas inteligentes**: Controle de ventilação e iluminação — pesquisadores na China obtiveram aumento de 22% na produção e redução de 35% no uso de água com ESP32
- **Hidroponia**: Monitoramento de pH e condutividade elétrica

Na Cultivee, usamos ESP32 para automatizar nossos sistemas de cultivo indoor — e ensinamos essas técnicas no Curso de Instrumentação.

## Projetos em alta para 2025-2026

- **Smart Home**: Automação de luzes e tomadas via Wi-Fi, integração com Home Assistant
- **Estação meteorológica**: BME280 + display OLED com upload para nuvem
- **Horta inteligente**: Irrigação automática com sensor de umidade do solo
- **IA embarcada**: Reconhecimento de imagem e voz no ESP32-S3

## Recursos recomendados

**Tutoriais e comunidades:**
- **Random Nerd Tutorials** (randomnerdtutorials.com) — 250+ tutoriais ESP32/Arduino
- **Embarcados** (embarcados.com.br) — comunidade e cursos em português
- **Hackster.io** — maior comunidade de projetos hardware

**Simuladores online gratuitos:**
- **Wokwi** (wokwi.com) — melhor simulador: Arduino, ESP32, STM32, Raspberry Pi Pico
- **Tinkercad** (tinkercad.com) — simulador Arduino ideal para iniciantes

**Lojas no Brasil:**
Eletrogate, MakerHero, Curto Circuito, Usinainfo, RoboCore

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
    updatedDate: "28 Mar 2026",
    readTime: "7 min",
    image: "/blog/hidroponia.jpg",
    tldr: "NFT (Nutrient Film Technique) é o sistema hidropônico mais usado no Brasil (90% dos produtores). Usa 90% menos água, produz 4,47 kg/m² e cabe em espaços pequenos. Um sistema caseiro para 30 plantas custa R$ 200-400 e produz alface em 30-45 dias.",
    content: `
## O que é o sistema NFT?

NFT significa "Nutrient Film Technique" (Técnica do Filme Nutriente). É um sistema hidropônico onde uma fina camada de solução nutritiva flui continuamente pelas raízes das plantas, mantidas em canais inclinados.

Desenvolvido na Inglaterra nos anos 1960, o NFT se tornou o sistema mais popular no Brasil — cerca de **90% dos produtores hidropônicos brasileiros** utilizam essa técnica. O mercado global de sistemas NFT foi avaliado em US$ 1,2 bilhão em 2024, com projeção de atingir US$ 5,8 bilhões até 2033 (crescimento de 18,5% ao ano).

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

### Eficiência comprovada

- **Economia de água**: Até **90% menos** que cultivo em solo (sistema fechado recirculante)
- **Produtividade**: 4,47 kg/m² por ciclo de alface (espaçamento 25x20cm), ou 40-70 kg/m²/ano — até **11x mais** que agricultura convencional
- **Ciclos rápidos**: Alface em 30-40 dias
- **Automação fácil**: Timer na bomba + sensores IoT para monitoramento completo

## Erros comuns de iniciantes (e como evitar)

| Erro | Solução |
|------|---------|
| Ignorar o pH | Monitore diariamente; mantenha entre 5.5-6.5; invista em medidor digital |
| Excesso de nutrientes ("mais = melhor") | Siga as diretrizes de EC; comece baixo e aumente gradualmente |
| Sem bomba reserva / nobreak | Instale backup — plantas no NFT morrem rápido sem fluxo |
| Não limpar o sistema (algas/podridão) | Esterilize a cada 2-3 semanas com peróxido de hidrogênio diluído |
| Raízes entupindo canais | Verifique inclinação, pode os excessos, garanta fluxo constante |
| Escolher culturas erradas | Comece com alface, manjericão, espinafre; evite tomates no início |
| Solução nutritiva muito quente | Mantenha a 18-24°C; calor = menos oxigênio = podridão |

## Montando seu sistema NFT

### Lista de materiais

**Estrutura:**
- Perfis de alumínio ou madeira tratada
- Parafusos e cantoneiras

**Hidráulico:**
- Reservatório (caixa d'água 50-100L)
- Bomba submersa (vazão mínima 400L/h)
- Tubos de PVC 100mm (canais)
- Conexões e registros
- Mangueira de retorno

**Cultivo:**
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

**Diluição típica para alface:**
- Parte A: 1,5 mL/L
- Parte B: 1,5 mL/L
- EC final: 1.0-1.5 mS/cm
- pH: 5.5-6.5

### Faixas de EC por cultura

| Cultura | EC ideal (mS/cm) |
|---------|------------------|
| Alface | 1.0 - 1.5 |
| Rúcula | 1.2 - 1.8 |
| Morango | 1.0 - 1.5 |
| Tomate | 2.0 - 3.5 |
| Manjericão | 1.0 - 1.6 |

### Manutenção semanal

1. Verifique o nível do reservatório
2. Meça pH e EC
3. Complete com água ou ajuste concentração
4. Troque a solução completamente a cada 2-3 semanas

### Inovação: dosagem inteligente

Sistemas mais avançados em 2026 já usam sensores IoT (ESP32 + sensor de pH e EC) com dosagem automática de nutrientes baseada em leituras em tempo real. Isso elimina o ajuste manual e reduz o desperdício de nutrientes em até 37-59%.

## Espécies recomendadas

### Folhosas (ciclo 30-40 dias)
- Alface (todos os tipos) — cultivares Tropicana e Starfighter se destacam com produtividade de até 14 kg/m² por ciclo
- Rúcula — até 4 kg/m² por ciclo, com ganho de 35% sobre cultivo em solo
- Agrião, espinafre, couve

### Ervas (ciclo 40-60 dias)
- Manjericão, hortelã, cebolinha, salsa, coentro

### Morangos
Adaptam-se bem ao NFT! Ciclo mais longo (90-120 dias), mas alta produtividade.

## Escala e custos

| Escala | Investimento | Produção | Retorno |
|--------|-------------|----------|---------|
| Hobby (1-2 canais) | R$ 180-500 | 10-20 plantas | Consumo próprio |
| Semi-comercial (4-8 canais) | R$ 1.000-3.500 | 50-100 plantas | Vizinhos e feiras |
| Comercial (bancadas múltiplas) | R$ 5.000-50.000 | 500+ plantas | Mercados e restaurantes |

Agricultores reportam faturamento bruto acima de **R$ 30.000/mês** com sistemas comerciais bem geridos.

## Conclusão

O sistema NFT é a porta de entrada ideal para quem quer produzir alimentos em espaços reduzidos. Com baixo investimento inicial e curva de aprendizado acessível, você pode ter folhosas frescas o ano todo — usando 90% menos água que o cultivo convencional.

Na Cultivee, praticamos o que ensinamos. Nossas hortaliças são cultivadas em sistemas NFT e vendemos para clientes locais. No curso de Hidroponia, você aprende a montar, operar e até comercializar sua produção.

---

*Quer montar seu sistema NFT? Conheça nosso [Curso de Hidroponia e Cultivo Indoor](/agro) e aprenda do zero à comercialização.*
    `,
  },
  {
    id: 5,
    slug: "como-estruturar-revisao-bibliografica-eficiente",
    title: "Como estruturar uma revisão bibliográfica eficiente",
    excerpt: "Método passo a passo para organizar e escrever a revisão de literatura do seu trabalho acadêmico — com ferramentas de IA.",
    category: "Educa",
    categoryColor: "bg-educa",
    author: "Equipe Cultivee",
    date: "25 Jan 2025",
    updatedDate: "28 Mar 2026",
    readTime: "9 min",
    image: "/blog/revisao-bibliografica.jpg",
    tldr: "Revisão bibliográfica eficiente em 5 passos: defina a pergunta, busque nas bases certas (Scopus, PubMed, Google Scholar), filtre com ferramentas de IA (Elicit, ASReview), organize no Zotero e sintetize por temas. Ferramentas de IA reduzem o tempo de triagem em até 85%.",
    content: `
## O que é revisão bibliográfica?

A revisão bibliográfica (ou revisão de literatura) é a seção do trabalho acadêmico onde você apresenta o estado atual do conhecimento sobre seu tema. Não é apenas um resumo de obras — é uma análise crítica e organizada das principais contribuições existentes.

Com mais de 5 milhões de artigos acadêmicos publicados anualmente, encontrar e organizar as fontes certas se tornou um desafio enorme. Ferramentas de IA surgiram para ajudar — mas a análise crítica continua sendo humana.

Uma boa revisão bibliográfica:
- Contextualiza seu problema de pesquisa
- Demonstra domínio do tema
- Identifica lacunas que seu trabalho pretende preencher
- Fundamenta suas escolhas metodológicas

## Ferramentas de IA para revisão bibliográfica

Antes de começar, conheça as ferramentas que podem acelerar drasticamente seu trabalho:

### Descoberta de artigos

| Ferramenta | O que faz | Custo |
|------------|-----------|-------|
| **Elicit** | Síntese de evidências, extração estruturada de dados | Freemium |
| **Consensus** | Busca por consenso científico sobre perguntas | Freemium |
| **Connected Papers** | Visualiza grafos de citações a partir de um artigo semente | Gratuito |
| **Semantic Scholar** | Busca acadêmica com IA sobre milhões de artigos | Gratuito |
| **ResearchRabbit** | Descobre papers via mapeamento de citações ("Spotify dos artigos") | Gratuito |

### Triagem para revisões sistemáticas

| Ferramenta | O que faz | Custo |
|------------|-----------|-------|
| **Rayyan** | Aprende com suas decisões de inclusão/exclusão; ~40% menos tempo | Gratuito |
| **ASReview** | Active learning prioriza artigos para triagem | Gratuito, open-source |

### Economia de tempo comprovada

- Descoberta de artigos: **4 horas → 45 minutos** (85% de redução)
- Triagem de resumos: **8 horas → 3 horas** (62% de redução)
- Extração de dados: **6 horas → 1,5 hora** (75% de redução)

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
> Recorte: 2015-2025, foco em América Latina
> Áreas: Agronomia, Sociologia, Políticas Públicas

### Passo 2: Busque de forma sistemática

Use bases de dados acadêmicas com estratégia:

**Bases recomendadas:**
- Google Scholar (abrangente, gratuito — cobre ~93% do Web of Science e ~95% do Scopus)
- Scopus (artigos internacionais, use TITLE-ABS-KEY para buscas abrangentes)
- Web of Science (alto impacto)
- SciELO (Brasil e América Latina, acesso aberto total)
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
- No Scopus, use \`TITLE-ABS-KEY("search term")\` para buscas completas
- Filtre por ano, tipo de documento, idioma
- Use pelo menos 2-3 bases para garantir cobertura completa

### Passo 3: Selecione e organize

Nem tudo que aparece na busca merece entrar na revisão.

**Critérios de seleção:**
- Relevância para sua questão de pesquisa
- Qualidade do periódico (verifique no DOAJ ou Scimago Journal Rank)
- Citações recebidas (indicador de impacto)
- Atualidade (para temas em evolução rápida)

**Organize com gerenciadores de referências:**

| Ferramenta | Destaque | Recomendação |
|------------|----------|--------------|
| **Zotero** | Open-source, plugins de IA (PapersGPT, Aria), 10.000+ estilos | Mais recomendado por bibliotecas brasileiras |
| **Mendeley** | Rede acadêmica, sincronização multi-dispositivo | Em declínio (apps mobile descontinuados) |
| **Paperpile** | Integração Google Docs, interface limpa | Pago (US$ 2.99/mês acadêmico) |

**Crie uma planilha de controle:**

| Autor/Ano | Título | Conceito principal | Metodologia | Achados-chave | Útil para qual seção? |
|-----------|--------|-------------------|-------------|---------------|----------------------|

### Passo 4: Leia ativamente e fiche

Ler academicamente não é ler passivamente.

**Método de fichamento:**

Para cada texto relevante, registre:

1. **Referência completa** (já formatada em ABNT 6023:2025)
2. **Objetivo** do estudo
3. **Metodologia** usada
4. **Principais resultados**
5. **Citações diretas** potencialmente úteis (com página!)
6. **Suas observações**: concordâncias, críticas, conexões com outros textos

### Passo 5: Escreva por temas, não por autores

Este é o erro mais comum: escrever um parágrafo para cada autor.

**Errado (organização por autor):**

> Silva (2019) estudou hortas em São Paulo e concluiu que...
>
> Já Santos (2020) pesquisou hortas no Rio de Janeiro e afirmou que...

**Correto (organização por tema):**

> O impacto social das hortas comunitárias tem sido documentado em diversas capitais brasileiras. Estudos em São Paulo (SILVA, 2019), Rio de Janeiro (SANTOS, 2020) e Curitiba (OLIVEIRA, 2018) convergem ao identificar o fortalecimento de vínculos comunitários como benefício central. No entanto, diferem quanto ao papel das políticas públicas: enquanto Silva (2019) destaca iniciativas municipais como catalisadoras, Oliveira (2018) enfatiza a organização autônoma dos moradores.

**Estrutura recomendada para a revisão:**

1. **Introdução da seção**: Apresente a organização do capítulo
2. **Bloco temático 1**: Conceito A + autores que o discutem
3. **Bloco temático 2**: Conceito B + autores que o discutem
4. **Bloco temático 3**: Conexões entre conceitos + debates/lacunas
5. **Síntese final**: O que a literatura diz (e o que falta)

## Cuidados com IA na revisão

### O que a IA faz bem
- Descobrir artigos relevantes rapidamente
- Resumir papers para triagem inicial
- Identificar conexões entre estudos

### O que a IA NÃO faz bem
- Análise crítica (precisa do pesquisador)
- Verificação de citações (modelos inventam referências que não existem!)
- Avaliação de qualidade metodológica
- Posicionamento autoral

**Regra de ouro**: Use IA para descobrir e organizar; faça a análise e a escrita com sua voz.

### Verificadores de plágio

Antes de submeter, passe seu texto por:
- **Turnitin** (96% de precisão, o mais usado em universidades)
- **CopySpider** (gratuito, popular no Brasil)
- **Compilatio** (detecta texto gerado por IA)

## Checklist final

Antes de considerar sua revisão pronta:

- [ ] Os conceitos-chave estão bem definidos e fundamentados?
- [ ] Há equilíbrio entre autores clássicos e estudos recentes?
- [ ] O texto tem fio condutor claro entre os parágrafos?
- [ ] Predominam paráfrases (citações indiretas)?
- [ ] Sua voz aparece, analisando e conectando ideias?
- [ ] A lacuna que justifica sua pesquisa está identificada?
- [ ] Todas as citações têm referência correspondente?
- [ ] Citações geradas por IA foram verificadas na fonte original?

## Conclusão

Uma revisão bibliográfica bem feita é metade do caminho para um TCC, dissertação ou tese de qualidade. Com as ferramentas de IA disponíveis em 2025, a descoberta e triagem de artigos ficou muito mais rápida — mas a análise crítica e a voz autoral continuam sendo o diferencial de um bom trabalho acadêmico.

---

*Quer dominar a escrita acadêmica do início ao fim? Conheça nosso [Curso MEAD - Escrita Acadêmica Descomplicada](/educa) e transforme seu TCC.*
    `,
  },
  {
    id: 6,
    slug: "sensores-agricultura-guia-escolha-implementacao",
    title: "Sensores para agricultura: guia de escolha e implementação",
    excerpt: "Conheça os principais sensores usados em agricultura de precisão e como integrá-los aos seus projetos com ESP32.",
    category: "Tech",
    categoryColor: "bg-tech",
    author: "Equipe Cultivee",
    date: "22 Jan 2025",
    updatedDate: "28 Mar 2026",
    readTime: "12 min",
    image: "/blog/sensores-agricultura.jpg",
    tldr: "Os sensores essenciais para agricultura de precisão: solo (umidade, pH, NPK), ambiente (temperatura, umidade, luminosidade) e planta (NDVI, dendrômetro). O ESP32 é a melhor plataforma para integração. Uma estação solar autônoma com LoRaWAN custa R$ 200-400.",
    content: `
## Introdução à agricultura de precisão

A agricultura de precisão usa tecnologia para otimizar a produção agrícola. Em vez de tratar uma lavoura inteira de forma uniforme, ela permite decisões específicas para cada ponto do campo — ou cada planta, no caso de sistemas controlados.

O mercado global de sensores agrícolas foi avaliado em **US$ 2,3 bilhões em 2025**, com projeção de US$ 6,9 bilhões até 2035. Fazendas que utilizam sensores de precisão reportam até **21% mais produtividade** e redução significativa no uso de água.

Sensores são os "olhos" dessa agricultura inteligente. Eles coletam dados que, quando bem interpretados, se transformam em economia de insumos, aumento de produtividade e sustentabilidade.

## Tipos de sensores para agricultura

### 1. Sensores de umidade do solo

**O que medem**: Teor de água no solo

**Tecnologias principais:**

| Tipo | Princípio | Precisão | Preço (Brasil) |
|------|-----------|----------|----------------|
| Resistivo | Resistência elétrica | Baixa | R$ 5-10 |
| Capacitivo | Capacitância dielétrica | Média | R$ 10-15 |
| TDR | Reflexometria no tempo | Alta | R$ 200+ |
| NPK (Modbus) | RS485, multiparâmetro | Alta | R$ 150-400 |

**Recomendação para iniciantes**: Sensor capacitivo V2.0 (R$ 9,99 na Eletrogate). Custo baixíssimo, precisão aceitável, resistente à corrosão.

**Código exemplo (ESP32):**

\`\`\`cpp
const int SENSOR_PIN = 34;  // ADC1 no ESP32
const int SECO = 3200;
const int MOLHADO = 1400;

void setup() {
  Serial.begin(115200);
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

**Opções populares:**

| Sensor | Temp. range | Precisão temp. | Preço (Brasil) |
|--------|-------------|----------------|----------------|
| DHT11 | 0-50°C | ±2°C | R$ 8-12 |
| DHT22 | -40 a 80°C | ±0.5°C | R$ 17-25 |
| BME280 | -40 a 85°C | ±1°C | R$ 25-40 |
| SHT31 | -40 a 125°C | ±0.2°C | R$ 40-60 |

**Recomendação**: DHT22 para projetos simples; BME280 para aplicações que também precisem de pressão atmosférica.

### 3. Sensores de luminosidade

**O que medem**: Intensidade da luz ambiente

- **LDR (fotoresistor)**: Simples e barato (R$ 3-5), leitura analógica, não calibrado
- **BH1750**: Digital, mede em lux, alta precisão (R$ 10-20)
- **TSL2591**: Alta sensibilidade, separa luz visível de infravermelho

**Aplicação em agricultura**: Controle de iluminação artificial em estufas e cultivo indoor. O ideal é medir PAR (Radiação Fotossinteticamente Ativa).

**Alternativa econômica**: Use BH1750 e aplique fator de conversão aproximado: PAR ≈ lux × 0.019 (para luz solar).

### 4. Sensores de pH

**O que medem**: Acidez/alcalinidade da solução ou solo

- **Módulo pH4502C**: Popular com Arduino/ESP32, precisão moderada (R$ 40-80)
- **Atlas Scientific**: Qualidade profissional, maior custo

**Cuidados importantes:**
- Armazene a sonda em solução de armazenamento (não água pura!)
- Calibre regularmente com soluções tampão (pH 4.0, 7.0)
- Não deixe secar

**Faixa ideal para hidroponia**: pH 5.5 - 6.5

### 5. Sensores de condutividade elétrica (EC)

**O que medem**: Concentração de sais/nutrientes dissolvidos

**Por que é importante**: Em hidroponia, a EC indica se a solução nutritiva está na concentração correta.

**Faixas típicas de EC:**

| Cultura | EC ideal (mS/cm) |
|---------|------------------|
| Alface | 1.0 - 1.5 |
| Tomate | 2.0 - 3.5 |
| Morango | 1.0 - 1.5 |
| Pimenta | 1.5 - 2.5 |

### 6. Sensores de nível de água

- **Boia mecânica**: Simples, confiável (R$ 10-20)
- **Sensor ultrassônico (HC-SR04)**: Mede distância até a superfície (R$ 10-15)
- **Sensor de pressão**: Para tanques fechados

## Por que o ESP32 é a melhor plataforma

Para projetos agrícolas conectados, o ESP32 se destaca:

| Característica | ESP32 | Arduino Uno | Raspberry Pi |
|----------------|-------|-------------|--------------|
| Wi-Fi + Bluetooth | Integrado | Não | Integrado |
| Canais ADC | 18 | 6 | Nenhum nativo |
| Deep sleep | ~10 µA | N/A | Alto consumo |
| Custo do sistema | R$ 60-90 | R$ 100+ (com shield Wi-Fi) | R$ 300+ |
| Indicação | **IoT agrícola** | Educação | Gateway/Hub |

Um sistema completo de monitoramento com ESP32 custa **~R$ 60-90** vs mais de R$ 2.500 para soluções comerciais equivalentes.

## LoRaWAN: alcance de quilômetros para o campo

Para áreas rurais sem Wi-Fi, o LoRaWAN é a solução:

- **Alcance**: 2 a 15+ km dependendo do terreno
- **Consumo ultra-baixo**: Sensores operam por **anos** com bateria
- **Frequência no Brasil**: 915 MHz (AU915)
- **Mercado**: US$ 10,88 bilhões em 2025, crescendo 33% ao ano

**Placas ESP32 + LoRa:**
- LILYGO T3S3 (ESP32-S3 + SX1262) — R$ 80-150
- Heltec WiFi LoRa 32 — R$ 80-120
- TTGO LoRa32 com OLED — R$ 70-100

**Infraestrutura:**
- The Things Network (TTN): rede comunitária gratuita de gateways
- Chirpstack: servidor LoRaWAN open-source auto-hospedado

## Estação solar autônoma

Para monitoramento remoto sem rede elétrica:

**Componentes:**
- Painel solar 5-20W (R$ 30-150)
- Bateria 18650 3.7V 3000mAh (R$ 15-25)
- Módulo MPPT TP4056 (R$ 5-10)
- ESP32 com deep sleep (acordo a cada 15-60 min para ler e transmitir)

**Custo total**: R$ 200-400 para uma estação completa (vs R$ 2.500-10.000 comercial)

**Autonomia**: Com deep sleep (<10 µA entre leituras) e painel solar, funciona indefinidamente.

## Plataformas de dashboard (gratuitas)

| Plataforma | Destaque |
|------------|----------|
| **ThingsBoard** (Community) | Dashboards customizáveis, alertas, MQTT/HTTP |
| **Home Assistant** | 2.500+ integrações, foco em privacidade |
| **Node-RED** | Fluxos visuais para lógica de irrigação |
| **Thinger.io** | Gratuito para testes e educação |

## Projeto integrado: Estufa automatizada

Combinando os sensores apresentados, você pode criar uma estufa que:

1. **Monitora**: Temperatura, umidade do ar, umidade do solo, luminosidade
2. **Aciona**: Irrigação quando solo seco, ventilação quando quente, iluminação quando escuro
3. **Registra**: Dados históricos na nuvem (ThingsBoard ou Home Assistant)
4. **Alerta**: Notificações via Telegram Bot quando há problemas

### Projetos open-source de referência

- **FarmBot** (farm.bot): Robô agrícola CNC 100% open-source
- **FarmVibes.AI** (Microsoft): Modelos de ML para agricultura e sustentabilidade
- **Tania**: Sistema de gerenciamento agrícola gratuito

## Conclusão

Sensores são a base de qualquer sistema de agricultura inteligente. Em 2025, o ecossistema está mais acessível do que nunca: um ESP32 de R$ 50 + sensores de R$ 10-25 + painel solar de R$ 30 já formam uma estação de monitoramento completa.

Começar com projetos simples — um sensor de umidade controlando irrigação — e evoluir gradualmente é o caminho mais seguro.

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
