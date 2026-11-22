# Planejamento — desafio_teste_domino

Partida de dominó (duplo-seis) para **2 jogadores** no mesmo computador. A entrega são **casos de teste de interface escritos em JavaScript, para testar JavaScript** (Jest + Testing Library). O jogo em si não faz parte desta entrega, por isso todos os testes falham de propósito, e pelo motivo certo.

**Autor:** MatheusCosta

---

## 1. Regras do jogo (o que os testes verificam)

- **28 peças** (`0-0` a `6-6`), 168 pontos no total.
- **Distribuição:** 7 peças para cada jogador; as 14 restantes formam o **monte** (estoque).
- **Quem começa:** a maior **dupla** (6-6, 5-5, …), que é obrigatoriamente a primeira jogada. Sem duplas, começa quem tiver a peça de maior soma, jogando essa peça. Na primeira jogada só essa peça fica habilitada.
- **Só a mão do jogador da vez** fica virada para cima.
- **Jogar:** a peça precisa ter um número igual a um dos **extremos** da mesa e **gira sozinha** para encaixar. Se encaixa nos dois extremos (e eles são diferentes), o jogador escolhe o lado. Com os dois extremos **iguais**, a peça entra à **direita** sem perguntar.
- **Comprar:** só quem **não** tem peça jogável, uma peça por clique, na ordem do monte. A vez continua com quem comprou até sair uma peça jogável ou o monte acabar.
- **Passar:** só sem peça jogável **e** com o monte vazio.
- A vez alterna depois de cada jogada ou passe.
- **Batida:** quem joga a última peça vence e marca a soma dos pontos que sobraram na mão do rival.
- **Jogo trancado:** monte vazio e nenhum dos dois com peça jogável (detectado logo após a jogada). Vence quem tem **menos pontos** na mão e marca a soma da mão do rival. Somas iguais → **empate**, sem pontos.
- **Placar acumulado:** `Nova partida` limpa mesa, mãos, monte, aviso e histórico, mas **mantém os pontos** acumulados.
- **Dicas:** peças que encaixam têm `data-jogavel="true"`; sem nenhuma e com monte, `btn-comprar` ganha `data-sugerido="true"`.
- **Histórico:** cada ação (jogou, comprou, passou) vira uma linha com `data-acao` e `data-jogador`.

## 2. Stack e comandos

| Item | Escolha |
|---|---|
| Entrega | Somente casos de teste (`tests/`). `js/main.js` fica vazio |
| Executor | Jest 29 com `babel-jest` |
| Testes de interface | Testing Library (`dom`, `user-event`, `jest-dom`) |
| "Navegador" | jsdom |
| Node | 18 ou superior |
| CI | GitHub Actions: `npm ci` + `npm run verificar:completo` |

```bash
npm install
npm test                     # todos falham, de propósito
npm run verificar            # confere o motivo de cada falha e o ID do plano
npm run verificar:completo   # idem + acusa caso do plano sem teste
```

## 3. Contrato de interface

| data-testid | O que é |
|---|---|
| `btn-nova-partida` | Distribui as peças (7 + 7 + monte de 14) e começa |
| `mao-1` / `mao-2` | Mão de cada jogador |
| `pedra-A-B` | Cada peça na mão, com A ≤ B (ex.: `pedra-3-6`). `data-face` = `cima` \| `baixo`; `data-jogavel="true"` quando encaixa; `disabled` quando não pode ser jogada |
| `mesa` | Peças jogadas, da esquerda para a direita. Cada filho tem `data-pedra` na orientação em que está (ex.: `6-3`) |
| `extremo-esq` / `extremo-dir` | Número de cada extremo (só o número) |
| `btn-lado-esq` / `btn-lado-dir` | Escolha do lado (existem só enquanto o jogo espera a resposta) |
| `estoque-qtd` | Peças no monte |
| `jogador-da-vez` | `Jogador 1` ou `Jogador 2` |
| `btn-comprar` / `btn-passar` | Comprar / passar (`disabled` quando não permitido; `data-sugerido` no comprar) |
| `placar-1` / `placar-2` | Pontos acumulados (só o número) |
| `aviso` | `Jogador 1 bateu!`, `Jogo trancado — Jogador 2 venceu!`, `Empate`; vazio durante a partida |
| `historico` | Lista de ações; filhos com `data-acao` = `jogou` \| `comprou` \| `passou` e `data-jogador` = `1` \| `2` |

| Parâmetro de URL | Exemplo | Efeito |
|---|---|---|
| `mao1` / `mao2` | `?mao1=6-6,1-3,0-0` | Mão de cada jogador (qualquer quantidade) |
| `estoque` | `?estoque=0-1,2-6` ou `?estoque=` | Monte, na ordem de compra |

Se qualquer um dos três for usado, **só existem as peças listadas** e a partida **começa ao abrir a página** (sem clicar em `btn-nova-partida`). Os parâmetros valem só para essa primeira partida.

### Cenários fixos (em `tests/helpers.js`)

| Nome | Mãos / monte | O que acontece |
|---|---|---|
| `BASICO` | J1 `6-6,1-3,0-0` · J2 `3-6,1-6,2-2` · monte vazio | J1 começa; 6-6, 3-6, 1-3, 1-6 (esq) tranca; J1 vence com 4 |
| `LADOS` | J1 `6-6,1-3,0-6` · J2 `3-6,1-6,1-5` | Igual ao BASICO, mas nenhum lado da escolha tranca |
| `COMPRA` | J1 `6-6,0-0` · J2 `1-2,3-4` · monte `0-1,2-6` | J2 compra 0-1 (não serve) e 2-6 (serve) |
| `PASSE` | J1 `6-6,0-3` · J2 `6-1,1-1` | J1 passa; J2 bate com 1-1 e marca 3 |
| `EMPATE` | J1 `6-6,2-4` · J2 `6-1,3-3` | Tranca com 6 × 6 |
| `SEM_DUPLA` | J1 `1-2,0-3,4-6` · J2 `5-6,0-1,2-3` | J2 começa com 5-6 |
| `DUAS_DUPLAS` | J1 `5-5,1-2,0-3` · J2 `4-4,0-1,2-6` | J1 começa com 5-5 |
| `COM_MONTE` | J1 `6-6,0-0` · J2 `6-1,2-3` · monte `4-4,5-5` | J2 tem jogável e o monte tem 2 |

Todos foram conferidos jogada a jogada por um mini-motor de dominó escrito só para isso.

## 4. Casos de teste

| ID | Cenário | Passos | Resultado esperado | Arquivo |
|---|---|---|---|---|
| CT-DM-01 | Distribuição | Abrir e clicar `btn-nova-partida` | 7 peças em cada mão; `estoque-qtd` = 14; mesa vazia | `partida.spec.js` |
| CT-DM-02 | Peças diferentes e válidas | 10 partidas aleatórias | As 14 peças das mãos são todas diferentes, com 0 ≤ A ≤ B ≤ 6 | `partida.spec.js` |
| CT-DM-03 | Só a mão da vez de frente | `BASICO`; jogar 6-6 | Antes: mão 1 `cima`, mão 2 `baixo`; depois: invertido | `partida.spec.js` |
| CT-DM-04 | Maior dupla começa | `DUAS_DUPLAS` | Vez do Jogador 1; só `5-5` habilitada (`1-2` e `0-3` `disabled`) | `partida.spec.js` |
| CT-DM-05 | Sem duplas: maior soma | `SEM_DUPLA` | Vez do Jogador 2; só `5-6` habilitada | `partida.spec.js` |
| CT-DM-06 | Primeira peça | `BASICO`; jogar 6-6 | Mesa `[6-6]`; extremos 6 e 6; peça sai da mão | `jogadas.spec.js` |
| CT-DM-07 | Peça gira | Depois do 6-6, J2 joga 3-6 | Mesa `[6-6, 6-3]`; extremos 6 e 3 | `jogadas.spec.js` |
| CT-DM-08 | Extremos iguais | Depois do 6-6, J2 joga 1-6 | Mesa `[6-6, 6-1]`; sem pergunta de lado | `jogadas.spec.js` |
| CT-DM-09 | Pergunta o lado | `LADOS`: 6-6, 3-6, 1-3; J2 clica 1-6 | Aparecem os dois botões de lado; mesa inalterada; ainda vez do J2 | `jogadas.spec.js` |
| CT-DM-10 | Lado esquerdo | Idem; clicar `btn-lado-esq` | Mesa `[1-6, 6-6, 6-3, 3-1]`; extremos 1 e 1; botões somem; vez do J1 | `jogadas.spec.js` |
| CT-DM-11 | Lado direito | Idem; clicar `btn-lado-dir` | Mesa `[6-6, 6-3, 3-1, 1-6]`; extremos 6 e 6 | `jogadas.spec.js` |
| CT-DM-12 | Peça sem encaixe | `BASICO`; 6-6; clicar `2-2` | `2-2` desabilitada; mesa e vez não mudam | `jogadas.spec.js` |
| CT-DM-13 | Alternância | `BASICO`; 3 jogadas | Vez: J2, J1, J2 | `jogadas.spec.js` |
| CT-DM-14 | Comprar bloqueado | `COM_MONTE`; 6-6 | J2 tem jogável; monte 2; `btn-comprar` desabilitado | `compra.spec.js` |
| CT-DM-15 | Comprar uma | `COMPRA`; 6-6; comprar | `0-1` na mão do J2; monte 1; vez continua do J2 | `compra.spec.js` |
| CT-DM-16 | Comprar até servir | Comprar de novo | `2-6` na mão, habilitada; monte 0; comprar desabilitado; ao jogá-la a vez vai ao J1 | `compra.spec.js` |
| CT-DM-17 | Passar liberado | `PASSE`; 6-6; 6-1 | Vez do J1; comprar desabilitado; passar habilitado | `compra.spec.js` |
| CT-DM-18 | Regra do passe | (a) sem jogável + monte; (b) com jogável + monte vazio; (c) sem jogável + monte vazio | (a) e (b) passar desabilitado; (c) passa e a vez vai ao J2 | `compra.spec.js` |
| CT-DM-19 | Dica de peça | `BASICO`; 6-6 | `3-6` e `1-6` com `data-jogavel`; `2-2` sem | `compra.spec.js` |
| CT-DM-20 | Dica de compra | `COMPRA` e `COM_MONTE` após 6-6 | Só no `COMPRA` o `btn-comprar` tem `data-sugerido` | `compra.spec.js` |
| CT-DM-21 | Batida | `PASSE`: 6-6, 6-1, passe, 1-1 | `Jogador 2 bateu!`; placar 0 × 3 | `fim.spec.js` |
| CT-DM-22 | Jogo trancado | `BASICO`: 6-6, 3-6, 1-3, 1-6 à esquerda | `Jogo trancado — Jogador 1 venceu!`; placar 4 × 0 | `fim.spec.js` |
| CT-DM-23 | Trancado empatado | `EMPATE`: 6-6, 6-1 | Aviso `Empate`; placar 0 × 0 | `fim.spec.js` |
| CT-DM-24 | Nova partida | Fim do `PASSE`; `btn-nova-partida` | Mesa vazia; 7 + 7; monte 14; aviso e histórico vazios; placar do J2 continua 3 | `fim.spec.js` |
| CT-DM-25 | Histórico com compras | `COMPRA`: 6-6, comprar, comprar, 2-6 | `jogou, comprou, comprou, jogou` pelos jogadores `1, 2, 2, 2` | `historico.spec.js` |
| CT-DM-26 | Histórico com passe | `PASSE` completo | `jogou, jogou, passou, jogou` pelos jogadores `1, 2, 1, 2` | `historico.spec.js` |

## 5. Definição de pronto

- [x] Todos os casos da seção 4 têm teste em `tests/`, com o ID no título
- [x] Nenhum código do jogo em `js/` (só o `main.js` vazio)
- [x] `npm run verificar:completo` sem problemas
- [x] README com autor, como rodar e a tabela de casos
- [x] Repositório com o nome exato `desafio_teste_domino`
