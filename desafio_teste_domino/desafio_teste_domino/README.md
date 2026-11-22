# desafio_teste_domino

Desafio de testes: casos de teste para testar uma partida de **Dominó** (duplo-seis) para **2 jogadores**, com **casos de teste em JavaScript para testar JavaScript** (Jest + Testing Library).

## Identificação

**Autor:** MatheusCosta

## Como rodar

Requisitos: Node.js 18 ou superior.

```bash
npm install                 # instala as dependências
npm test                    # roda todos os casos de teste
npm run verificar           # confere o motivo de cada falha e o ID de cada teste
npm run verificar:completo  # idem + confere que todo caso do plano tem teste
npx jest tests/<arquivo>.spec.js -t "CT-XX-NN"   # um caso só
```

## Como os testes funcionam

**Situação atual:** esta entrega contém somente os casos de teste. O jogo ainda não está implementado, então **todos os testes falham de propósito**, e pelo motivo certo (o elemento ou valor esperado ainda não existe). O `npm run verificar` confere isso e reprova qualquer teste que passe sem o jogo.

- **Ferramentas:** [Jest](https://jestjs.io) executa; [Testing Library](https://testing-library.com) (`dom`, `user-event`, `jest-dom`) simula o jogador; o [jsdom](https://github.com/jsdom/jsdom) faz o papel do navegador.
- **Testes de interface:** cada teste abre o `index.html` por `abrirJogo(params)` (em `tests/helpers.js`), clica como um jogador e confere o que aparece na tela. Nenhum teste chama função interna do jogo.
- **Elementos da tela:** localizados por `data-testid` (contrato na seção 3 do `PLANEJAMENTO.md`).
- **Sem depender de sorte:** os cenários são montados por parâmetros de URL. O tempo usa relógio falso (`jest.useFakeTimers()`).
- **Rastreabilidade:** o título de cada teste começa com o ID do caso (`CT-XX-NN`), o mesmo da tabela abaixo e do `PLANEJAMENTO.md`.

## Casos de teste (26)

| ID | Cenário | Arquivo | Resultado esperado |
|---|---|---|---|
| CT-DM-01 | Distribuição | `partida.spec.js` | 7 peças em cada mão; `estoque-qtd` = 14; mesa vazia |
| CT-DM-02 | Peças diferentes e válidas | `partida.spec.js` | As 14 peças das mãos são todas diferentes, com 0 ≤ A ≤ B ≤ 6 |
| CT-DM-03 | Só a mão da vez de frente | `partida.spec.js` | Antes: mão 1 `cima`, mão 2 `baixo`; depois: invertido |
| CT-DM-04 | Maior dupla começa | `partida.spec.js` | Vez do Jogador 1; só `5-5` habilitada (`1-2` e `0-3` `disabled`) |
| CT-DM-05 | Sem duplas: maior soma | `partida.spec.js` | Vez do Jogador 2; só `5-6` habilitada |
| CT-DM-06 | Primeira peça | `jogadas.spec.js` | Mesa `[6-6]`; extremos 6 e 6; peça sai da mão |
| CT-DM-07 | Peça gira | `jogadas.spec.js` | Mesa `[6-6, 6-3]`; extremos 6 e 3 |
| CT-DM-08 | Extremos iguais | `jogadas.spec.js` | Mesa `[6-6, 6-1]`; sem pergunta de lado |
| CT-DM-09 | Pergunta o lado | `jogadas.spec.js` | Aparecem os dois botões de lado; mesa inalterada; ainda vez do J2 |
| CT-DM-10 | Lado esquerdo | `jogadas.spec.js` | Mesa `[1-6, 6-6, 6-3, 3-1]`; extremos 1 e 1; botões somem; vez do J1 |
| CT-DM-11 | Lado direito | `jogadas.spec.js` | Mesa `[6-6, 6-3, 3-1, 1-6]`; extremos 6 e 6 |
| CT-DM-12 | Peça sem encaixe | `jogadas.spec.js` | `2-2` desabilitada; mesa e vez não mudam |
| CT-DM-13 | Alternância | `jogadas.spec.js` | Vez: J2, J1, J2 |
| CT-DM-14 | Comprar bloqueado | `compra.spec.js` | J2 tem jogável; monte 2; `btn-comprar` desabilitado |
| CT-DM-15 | Comprar uma | `compra.spec.js` | `0-1` na mão do J2; monte 1; vez continua do J2 |
| CT-DM-16 | Comprar até servir | `compra.spec.js` | `2-6` na mão, habilitada; monte 0; comprar desabilitado; ao jogá-la a vez vai ao J1 |
| CT-DM-17 | Passar liberado | `compra.spec.js` | Vez do J1; comprar desabilitado; passar habilitado |
| CT-DM-18 | Regra do passe | `compra.spec.js` | (a) e (b) passar desabilitado; (c) passa e a vez vai ao J2 |
| CT-DM-19 | Dica de peça | `compra.spec.js` | `3-6` e `1-6` com `data-jogavel`; `2-2` sem |
| CT-DM-20 | Dica de compra | `compra.spec.js` | Só no `COMPRA` o `btn-comprar` tem `data-sugerido` |
| CT-DM-21 | Batida | `fim.spec.js` | `Jogador 2 bateu!`; placar 0 × 3 |
| CT-DM-22 | Jogo trancado | `fim.spec.js` | `Jogo trancado — Jogador 1 venceu!`; placar 4 × 0 |
| CT-DM-23 | Trancado empatado | `fim.spec.js` | Aviso `Empate`; placar 0 × 0 |
| CT-DM-24 | Nova partida | `fim.spec.js` | Mesa vazia; 7 + 7; monte 14; aviso e histórico vazios; placar do J2 continua 3 |
| CT-DM-25 | Histórico com compras | `historico.spec.js` | `jogou, comprou, comprou, jogou` pelos jogadores `1, 2, 2, 2` |
| CT-DM-26 | Histórico com passe | `historico.spec.js` | `jogou, jogou, passou, jogou` pelos jogadores `1, 2, 1, 2` |

## Estrutura

```
desafio_teste_domino/
├── index.html                    esqueleto da tela (elementos fixos do contrato)
├── js/main.js                    ponto de entrada do jogo (vazio nesta entrega)
├── tests/helpers.js              abrirJogo(), cenários fixos e atalhos
├── tests/*.spec.js               casos de teste
├── scripts/verificar-testes.mjs  verificador (npm run verificar)
├── .github/workflows/testes.yml  integração contínua
└── PLANEJAMENTO.md               regras, contrato e tabela de casos
```
