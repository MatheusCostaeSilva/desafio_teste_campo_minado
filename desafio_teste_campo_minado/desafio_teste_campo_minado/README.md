# desafio_teste_campo_minado

Desafio de testes: casos de teste para testar campo minado de tabuleiro **18 × 14** com **40 bombas**, com **casos de teste em JavaScript para testar JavaScript** (Jest + Testing Library).

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

**Situação atual:** esta entrega contém somente os casos de teste. O campo minado ainda não está implementado, então **todos os testes falham de propósito**, e pelo motivo certo (o elemento ou valor esperado ainda não existe). O `npm run verificar` confere isso e reprova qualquer teste que passe sem o jogo.

- **Ferramentas:** [Jest](https://jestjs.io) executa; [Testing Library](https://testing-library.com) (`dom`, `user-event`, `jest-dom`) simula o jogador; o [jsdom](https://github.com/jsdom/jsdom) faz o papel do navegador.
- **Testes de interface:** cada teste abre o `index.html` por `abrirJogo(params)` (em `tests/helpers.js`), clica como um jogador e confere o que aparece na tela. Nenhum teste chama função interna do jogo.
- **Elementos da tela:** localizados por `data-testid` (contrato na seção 3 do `PLANEJAMENTO.md`).
- **Sem depender de sorte:** os cenários são montados por parâmetros de URL. O tempo usa relógio falso (`jest.useFakeTimers()`).
- **Rastreabilidade:** o título de cada teste começa com o ID do caso (`CT-XX-NN`), o mesmo da tabela abaixo e do `PLANEJAMENTO.md`.

## Casos de teste (27)

| ID | Cenário | Arquivo | Resultado esperado |
|---|---|---|---|
| CT-CM-01 | Tamanho do campo | `campo.spec.js` | 252 casas `oculta` (14 × 18); não existem `casa-14-0` nem `casa-0-18` |
| CT-CM-02 | Estado inicial | `campo.spec.js` | `bombas-restantes` = 40, `tempo` = 0, `aviso` vazio |
| CT-CM-03 | Primeiro clique seguro | `campo.spec.js` | `casa-13-17` sempre `aberta` |
| CT-CM-04 | Primeiro clique abre área livre | `campo.spec.js` | `data-vizinhas` = 0 e as 8 vizinhas `aberta` |
| CT-CM-05 | Números das vizinhas | `campo.spec.js` | Valores 2, 3, 2, 3, 2, 1 |
| CT-CM-06 | Cascata de cima | `abrir.spec.js` | 108 casas `aberta`, nenhuma abaixo da linha 5; `casa-8-0` fica `oculta` |
| CT-CM-07 | Cascata de baixo | `abrir.spec.js` | 104 casas `aberta`, nenhuma acima da linha 8; `casa-13-3` e `casa-5-0` ficam `oculta` |
| CT-CM-08 | Zero e borda da cascata | `abrir.spec.js` | `0-0` e `4-9` valem 0; `5-9` vale 3 |
| CT-CM-09 | Casa aberta não muda | `abrir.spec.js` | Continua `aberta` valor 3; 1 casa aberta; contador 40 |
| CT-CM-10 | Tempo | `abrir.spec.js` | Antes do clique = 0; depois ≥ 2 e crescendo |
| CT-CM-11 | Colocar marca | `marcas.spec.js` | `marcada`; contador 39 |
| CT-CM-12 | Tirar marca | `marcas.spec.js` | `oculta`; contador 40 |
| CT-CM-13 | Marca protege | `marcas.spec.js` | Continua `marcada`; `aviso` vazio |
| CT-CM-14 | Limite de 40 marcas | `marcas.spec.js` | 41ª fica `oculta`; contador 0; 40 `marcada` |
| CT-CM-15 | Cascata não abre marca | `marcas.spec.js` | `2-2` continua `marcada`; 107 `aberta`; contador 39 |
| CT-CM-16 | Abertura rápida | `marcas.spec.js` | 4-0, 4-1 e 5-1 viram `aberta`; sem derrota |
| CT-CM-17 | Abertura rápida com marcas a menos | `marcas.spec.js` | 4-0, 4-1 e 5-1 continuam `oculta` |
| CT-CM-18 | Abertura rápida com marca errada | `marcas.spec.js` | `6-1` = `bomba-detonada`; `aviso` de derrota; `4-1` = `marca-errada` |
| CT-CM-19 | Modo marcação | `marcas.spec.js` | `marcada` + contador 39; depois `oculta` + contador 40 |
| CT-CM-20 | Modo marcação sobre bomba | `marcas.spec.js` | 7-0 `marcada`, sem derrota; 0-0 abre |
| CT-CM-21 | Derrota | `fim-de-jogo.spec.js` | `6-0` = `bomba-detonada`; 39 `bomba`; `aviso` de derrota; 0-0 continua `oculta` |
| CT-CM-22 | Tempo para na derrota | `fim-de-jogo.spec.js` | `tempo` fica parado em um valor ≥ 2 |
| CT-CM-23 | Marcas na derrota | `fim-de-jogo.spec.js` | `0-0` = `marca-errada`; `7-0` continua `marcada` |
| CT-CM-24 | 40 bombas no modo aleatório | `fim-de-jogo.spec.js` | `bomba` + `bomba-detonada` = 40 |
| CT-CM-25 | Vitória | `fim-de-jogo.spec.js` | 212 `aberta`; 40 `marcada`; `aviso` de vitória; contador 0; tempo parado |
| CT-CM-26 | Marcas não dão vitória | `fim-de-jogo.spec.js` | Sem `aviso`; contador 0; 212 casas continuam `oculta` |
| CT-CM-27 | Recomeçar | `fim-de-jogo.spec.js` | 252 `oculta`; contador 40; tempo 0; `aviso` vazio |

## Estrutura

```
desafio_teste_campo_minado/
├── index.html                    esqueleto da tela (elementos fixos do contrato)
├── js/main.js                    ponto de entrada do jogo (vazio nesta entrega)
├── tests/helpers.js              abrirJogo(), cenários fixos e atalhos
├── tests/*.spec.js               casos de teste
├── scripts/verificar-testes.mjs  verificador (npm run verificar)
├── .github/workflows/testes.yml  integração contínua
└── PLANEJAMENTO.md               regras, contrato e tabela de casos
```
