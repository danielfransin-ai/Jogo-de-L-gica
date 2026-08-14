#!/usr/bin/env node
/**
 * PIXEL://ESCAPE — Fuga do Sistema
 * Jogo de lógica em modo texto (terminal), versão JavaScript (Node.js).
 *
 * Um pixel tenta escapar do "Sistema" atravessando 10 portões.
 * Cada portão representa um conceito de lógica computacional
 * (AND, OR, NOT, XOR, NAND, condicional, modus tollens, De Morgan,
 * curto-circuito e inversão binária). O jogador responde SIM ou NÃO
 * para cada pergunta; ao acertar, o jogo narra a lógica por trás do
 * portão e libera o próximo desafio. Ao errar, o pixel perde 1 ponto
 * de vida. O jogo termina quando o pixel escapa (10/10) ou quando as
 * vidas chegam a zero.
 *
 * Execução:
 *     node pixelEscape.js
 */

const readline = require("readline");

const TOTAL_LIVES = 3;

const CHALLENGES = [
  {
    titulo: "PORTÃO 01 — CONJUNÇÃO (AND)",
    cenario:
      "O primeiro portão só destrava se DUAS condições forem\n" +
      "verdadeiras ao mesmo tempo: a chave biométrica (A) e a senha (B).",
    prop: "A = verdadeiro (biometria confere)\nB = falso (senha incorreta)\nRegra: A AND B",
    pergunta: "O portão abre?",
    correta: false,
    logica:
      "Na porta AND, o resultado só é verdadeiro quando TODAS as\n" +
      "entradas são verdadeiras. Como B é falso, A AND B = falso —\n" +
      "o portão permanece trancado, mesmo com A verdadeiro.",
  },
  {
    titulo: "PORTÃO 02 — DISJUNÇÃO (OR)",
    cenario:
      "O alarme deste corredor dispara se PELO MENOS UM sensor\n" +
      "detectar o pixel: movimento (A) ou calor (B).",
    prop: "A = falso (sem movimento)\nB = verdadeiro (calor detectado)\nRegra: A OR B",
    pergunta: "O alarme dispara?",
    correta: true,
    logica:
      "Na porta OR, basta UMA entrada verdadeira para o resultado\n" +
      "ser verdadeiro. Como B é verdadeiro, A OR B = verdadeiro —\n" +
      "o alarme dispara mesmo com A falso.",
  },
  {
    titulo: "PORTÃO 03 — NEGAÇÃO (NOT)",
    cenario:
      "O firewall deixa um pacote de dados passar somente quando\n" +
      "ele NÃO está marcado como bloqueado.",
    prop: "bloqueado = verdadeiro\nRegra de passagem: NOT(bloqueado)",
    pergunta: "O pacote (o pixel disfarçado) passa pelo firewall?",
    correta: false,
    logica:
      "O operador NOT inverte o valor: NOT(verdadeiro) = falso.\n" +
      "Como o pacote está marcado como bloqueado, a condição de\n" +
      "passagem é falsa — ele é barrado.",
  },
  {
    titulo: "PORTÃO 04 — OU EXCLUSIVO (XOR)",
    cenario:
      "Este portão é acionado por duas alavancas. Ele abre apenas\n" +
      "quando EXATAMENTE UMA das duas estiver ativada.",
    prop: "Alavanca 1 = verdadeiro\nAlavanca 2 = verdadeiro\nRegra: Alavanca1 XOR Alavanca2",
    pergunta: "O portão abre?",
    correta: false,
    logica:
      "No XOR, o resultado é verdadeiro só quando as entradas são\n" +
      "DIFERENTES entre si. Com as duas alavancas verdadeiras\n" +
      "(iguais), XOR = falso — o mecanismo trava.",
  },
  {
    titulo: "PORTÃO 05 — NÃO-E (NAND)",
    cenario:
      "A trava de segurança libera quando NÃO for verdade que as\n" +
      "duas câmeras (A e B) detectaram o pixel ao mesmo tempo.",
    prop: "Câmera A = verdadeiro\nCâmera B = verdadeiro\nRegra: NOT(A AND B)",
    pergunta: "A trava libera o pixel?",
    correta: false,
    logica:
      "NAND é a negação do AND: NOT(A AND B). Como A AND B =\n" +
      "verdadeiro, NOT(verdadeiro) = falso — a trava permanece\n" +
      "fechada.",
  },
  {
    titulo: "PORTÃO 06 — CONDICIONAL (SE-ENTÃO)",
    cenario:
      "Regra do sistema: SE a energia estiver estável, ENTÃO a\n" +
      "porta é destravada.",
    prop: "energia_estavel = verdadeiro\nRegra: SE energia_estavel ENTÃO porta_destravada",
    pergunta: "A porta é destravada?",
    correta: true,
    logica:
      "Isso é modus ponens: se P → Q é verdadeira e P é\n" +
      "verdadeiro, então Q também é verdadeiro. Energia estável\n" +
      "(P) é verdadeira, logo a porta destravada (Q) também é.",
  },
  {
    titulo: "PORTÃO 07 — CONTRAPOSITIVA (MODUS TOLLENS)",
    cenario:
      "Regra: SE o alarme está ativo, ENTÃO as luzes vermelhas\n" +
      "acendem. Os sensores mostram que as luzes estão apagadas.",
    prop: "Regra: SE alarme_ativo ENTÃO luzes_vermelhas\nObservado: luzes_vermelhas = falso",
    pergunta: "Isso prova que o alarme está ativo?",
    correta: false,
    logica:
      "Por modus tollens, se P → Q e Q é falso, então P também é\n" +
      "falso. Como as luzes (Q) estão apagadas, o alarme (P)\n" +
      "necessariamente está inativo.",
  },
  {
    titulo: "PORTÃO 08 — LEI DE DE MORGAN",
    cenario:
      "O painel bloqueia o corredor quando NÃO é verdade que o\n" +
      "sensor A ou o sensor B estão ativos: NOT(A OR B).",
    prop: "Sensor A = falso\nSensor B = falso\nRegra: NOT(A OR B)",
    pergunta: "O corredor fica bloqueado?",
    correta: true,
    logica:
      "Pela Lei de De Morgan, NOT(A OR B) equivale a (NOT A) AND\n" +
      "(NOT B). Como A e B são falsos, NOT A e NOT B são ambos\n" +
      "verdadeiros, então a condição é verdadeira — bloqueia.",
  },
  {
    titulo: "PORTÃO 09 — AVALIAÇÃO EM CURTO-CIRCUITO",
    cenario:
      "O sistema testa condição1 AND condição2. condição2 é uma\n" +
      "varredura lenta e pesada que travaria o sistema.",
    prop:
      "condição1 = falso\ncondição2 = (varredura pesada, ainda não executada)\nRegra: condição1 AND condição2",
    pergunta: "O sistema chega a executar a condição2?",
    correta: false,
    logica:
      "Em avaliação de curto-circuito, num AND, se a primeira\n" +
      "condição já é falsa, o resultado final já está definido\n" +
      "como falso — o interpretador nem avalia a segunda condição.",
  },
  {
    titulo: "PORTÃO 10 — BIT DE CONTROLE (INVERSÃO BINÁRIA)",
    cenario:
      "O portão final usa um único bit de controle. Ele abre\n" +
      "quando, após a inversão do bit, o valor resultante for 1.",
    prop: "bit original = 0\nRegra: abre se NOT(bit) = 1",
    pergunta: "O portão final abre e o pixel escapa?",
    correta: true,
    logica:
      "Em lógica binária, NOT inverte o bit: NOT(0) = 1 e\n" +
      "NOT(1) = 0. Como o bit original é 0, NOT(0) = 1 — a regra\n" +
      "de abertura é satisfeita e o pixel escapa.",
  },
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Fila de linhas: evita perder respostas quando a entrada chega via pipe
// (o readline pode disparar 'line' antes de existir um listener ativo).
const lineQueue = [];
const waiters = [];
let inputClosed = false;

rl.on("line", (line) => {
  if (waiters.length > 0) {
    waiters.shift()(line);
  } else {
    lineQueue.push(line);
  }
});

rl.on("close", () => {
  inputClosed = true;
  while (waiters.length > 0) {
    waiters.shift()(null);
  }
});

function proximaLinha() {
  if (lineQueue.length > 0) {
    return Promise.resolve(lineQueue.shift());
  }
  if (inputClosed) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => waiters.push(resolve));
}

async function pergunta(texto) {
  process.stdout.write(texto);
  const linha = await proximaLinha();
  if (linha === null) {
    throw Object.assign(new Error("input stream closed"), {
      code: "ERR_INPUT_CLOSED",
    });
  }
  return linha;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function linha(char = "─", n = 54) {
  console.log(char.repeat(n));
}

function mostrarVidas(vidas) {
  const coracoes = "■ ".repeat(vidas) + "· ".repeat(TOTAL_LIVES - vidas);
  console.log(`VIDAS: ${coracoes.trim()}`);
}

async function perguntarSimNao() {
  while (true) {
    const resp = (await pergunta("Resposta (S = sim / N = não): "))
      .trim()
      .toLowerCase();
    if (resp === "s" || resp === "sim") {
      return true;
    }
    if (resp === "n" || resp === "não" || resp === "nao") {
      return false;
    }
    console.log("  > Entrada inválida. Digite S ou N.");
  }
}

async function jogar() {
  let vidas = TOTAL_LIVES;

  console.log();
  linha("═");
  console.log("  PIXEL://ESCAPE — FUGA DO SISTEMA");
  linha("═");
  console.log("Você é um pixel preso no Sistema. Atravesse 10 portões");
  console.log(
    "respondendo corretamente às perguntas de lógica computacional."
  );
  console.log("Cada erro custa 1 ponto de vida. Boa sorte.\n");

  for (let i = 1; i <= CHALLENGES.length; i++) {
    const desafio = CHALLENGES[i - 1];

    linha();
    console.log(`[${i}/${CHALLENGES.length}] ${desafio.titulo}`);
    linha();
    mostrarVidas(vidas);
    console.log();
    console.log(desafio.cenario);
    console.log();
    console.log(desafio.prop);
    console.log();
    console.log(`>> ${desafio.pergunta}`);

    const resposta = await perguntarSimNao();
    const acertou = resposta === desafio.correta;

    console.log();
    if (acertou) {
      console.log("✔ LÓGICA CORRETA — o pixel avança para o próximo portão.");
    } else {
      vidas -= 1;
      console.log(
        `✘ FALHA LÓGICA — 1 ponto de vida perdido. (Vidas restantes: ${vidas})`
      );
    }

    console.log("\n— Por trás do portão —");
    console.log(desafio.logica);
    console.log();

    if (vidas <= 0) {
      linha("═");
      console.log("  SISTEMA VENCEU. O pixel foi capturado.");
      console.log(`  Você chegou até o portão ${i} de ${CHALLENGES.length}.`);
      linha("═");
      rl.close();
      return;
    }

    await sleep(300);
  }

  linha("═");
  console.log("  VOCÊ ESCAPOU! 10/10 portões vencidos com lógica pura.");
  console.log(`  Vidas restantes: ${vidas}/${TOTAL_LIVES}`);
  linha("═");
  rl.close();
}

jogar().catch(() => {
  console.log("\n\nConexão com o Sistema interrompida. Até a próxima fuga.");
  rl.close();
  process.exit(0);
});

rl.on("SIGINT", () => {
  console.log("\n\nConexão com o Sistema interrompida. Até a próxima fuga.");
  rl.close();
  process.exit(0);
});
