# Planejamento — desafio_teste_campo_minado

Campo minado de **18 colunas × 14 linhas com 40 bombas**. A entrega são **casos de teste de interface escritos em JavaScript, para testar JavaScript** (Jest + Testing Library). O jogo em si não faz parte desta entrega, por isso todos os testes falham de propósito, e falham pelo motivo certo (a casa/valor esperado não existe ainda).

**Autor:** MatheusCosta

---

## 1. Regras do jogo (o que os testes verificam)

- **Campo:** 18 colunas × 14 linhas = **252 casas** (linhas `0..13`, colunas `0..17`), **40 bombas** e 212 casas seguras.
- **Primeiro clique seguro e com área livre:** no modo aleatório as bombas são sorteadas **depois** do primeiro clique, fora da casa clicada e das 8 vizinhas. A casa clicada sempre vale 0 e abre em cascata.
- **Clique esquerdo** abre uma casa oculta:
  - bomba → derrota;
  - número → mostra quantas das 8 vizinhas têm bomba;
  - zero → abre as vizinhas em cascata (a cascata não abre casas marcadas).
- **Clique direito** marca/desmarca uma casa oculta. Casa marcada não abre no clique esquerdo. Casa aberta não pode ser marcada.
- **Bombas restantes** = 40 − marcas. Nunca existem mais de 40 marcas.
- **Abertura rápida:** clique duplo num número já aberto cuja quantidade de marcas nas vizinhas é **igual** ao número abre todas as vizinhas sem marca (se uma marca estiver errada, a bomba escondida detona). Com marcas a menos ou a mais, nada acontece.
- **Tempo:** começa no primeiro clique, conta em segundos e para ao fim da partida.
- **Derrota:** a bomba clicada fica `bomba-detonada`, as demais bombas aparecem como `bomba`, marcas em casas sem bomba viram `marca-errada` (marcas certas continuam `marcada`) e o campo trava.
- **Vitória:** abrir as 212 casas seguras. As bombas restantes ganham marca, o contador vai a 0, o tempo para e o campo trava.
- **Recomeçar** devolve tudo ao estado inicial.
- **Modo marcação:** o botão liga/desliga um modo em que o clique esquerdo marca/desmarca em vez de abrir.

## 2. Stack e comandos

| Item | Escolha |
|---|---|
| Entrega | Somente casos de teste (`tests/`). `js/main.js` fica vazio |
| Executor | Jest 29 com `babel-jest` |
| Testes de interface | Testing Library (`dom`, `user-event`, `jest-dom`) |
| "Navegador" | jsdom (não precisa de navegador instalado) |
| Node | 18 ou superior |
| CI | GitHub Actions: `npm ci` + `npm run verificar:completo` |

```bash
npm install                  # instala as dependências
npm test                     # roda os testes (todos falham, de propósito)
npm run verificar            # confere se cada teste falha pelo motivo certo e tem ID do plano
npm run verificar:completo   # idem + acusa caso do plano sem teste
```

Os testes só enxergam o jogo pela tela: `screen.getByTestId(...)`, cliques (`user.click`, `user.dblClick`, `user.pointer`) e o que está escrito/atributos nos elementos. Nunca importam código de `js/`. O tempo usa o relógio falso do Jest (`jest.useFakeTimers()`). Nada depende de sorte: o cenário é montado por parâmetro de URL.

## 3. Contrato de interface

| data-testid | O que é |
|---|---|
| `campo` | A grade |
| `casa-L-C` | Cada casa (ex.: `casa-0-17`). `data-estado` = `oculta` \| `aberta` \| `marcada` \| `bomba` \| `bomba-detonada` \| `marca-errada`. `data-vizinhas` = 0..8 quando `aberta` |
| `bombas-restantes` | 40 − marcas (só o número) |
| `tempo` | Segundos desde o primeiro clique (só o número) |
| `btn-recomecar` | Recomeça a partida |
| `btn-modo-marcacao` | Liga/desliga o modo marcação |
| `aviso` | Vazio durante a partida; `Campo limpo! Você venceu.` ou `BOOM! Você perdeu.` |

| Parâmetro de URL | Exemplo | Efeito |
|---|---|---|
| `bombas` | `?bombas=6-0,6-1,...` | Lista `linha-coluna` das 40 bombas. Com ele, o sorteio e o primeiro clique seguro ficam desligados |

### Cenário fixo `CENARIO_FAIXAS` (em `tests/helpers.js`)

Linhas **6 e 7 inteiras** (36 bombas) + `13-3`, `13-9`, `13-14`, `13-15` = **40 bombas**.

```
linha  0..5   → região de cima  (108 casas, sem bombas)
linha  6      → * * * * * * * * * * * * * * * * * *
linha  7      → * * * * * * * * * * * * * * * * * *
linha  8..12  → região de baixo (sem bombas)
linha 13      → . . . * . . . . . * . . . . * * . .
```

- Clicar `0-0` abre as linhas 0–5 (**108** casas); linha 5 mostra 2 nas pontas e 3 no meio.
- Clicar `11-0` abre as linhas 8–13 (**104** casas seguras).
- 108 + 104 = **212**: abrir as duas regiões é a vitória.
- `5-0` vale 2 (bombas em `6-0` e `6-1`); `5-4` vale 3; `8-5` vale 3; `13-2` vale 1.

## 4. Casos de teste

| ID | Cenário | Passos | Resultado esperado | Arquivo |
|---|---|---|---|---|
| CT-CM-01 | Tamanho do campo | Abrir a página | 252 casas `oculta` (14 × 18); não existem `casa-14-0` nem `casa-0-18` | `campo.spec.js` |
| CT-CM-02 | Estado inicial | Abrir a página | `bombas-restantes` = 40, `tempo` = 0, `aviso` vazio | `campo.spec.js` |
| CT-CM-03 | Primeiro clique seguro | 40 partidas aleatórias, clicar `13-17` | `casa-13-17` sempre `aberta` | `campo.spec.js` |
| CT-CM-04 | Primeiro clique abre área livre | 25 partidas aleatórias, clicar `6-8` | `data-vizinhas` = 0 e as 8 vizinhas `aberta` | `campo.spec.js` |
| CT-CM-05 | Números das vizinhas | Cenário fixo; abrir 5-0, 5-4, 5-17, 8-5, 8-17, 13-2 | Valores 2, 3, 2, 3, 2, 1 | `campo.spec.js` |
| CT-CM-06 | Cascata de cima | Cenário fixo; clicar 0-0 | 108 casas `aberta`, nenhuma abaixo da linha 5; `casa-8-0` fica `oculta` | `abrir.spec.js` |
| CT-CM-07 | Cascata de baixo | Cenário fixo; clicar 11-0 | 104 casas `aberta`, nenhuma acima da linha 8; `casa-13-3` e `casa-5-0` ficam `oculta` | `abrir.spec.js` |
| CT-CM-08 | Zero e borda da cascata | Cenário fixo; clicar 0-0 | `0-0` e `4-9` valem 0; `5-9` vale 3 | `abrir.spec.js` |
| CT-CM-09 | Casa aberta não muda | Abrir 5-4; clicar de novo e clicar com o direito | Continua `aberta` valor 3; 1 casa aberta; contador 40 | `abrir.spec.js` |
| CT-CM-10 | Tempo | Relógio falso: 3 s sem clicar; clicar 0-0; +3 s; +2 s | Antes do clique = 0; depois ≥ 2 e crescendo | `abrir.spec.js` |
| CT-CM-11 | Colocar marca | Clique direito em 3-3 | `marcada`; contador 39 | `marcas.spec.js` |
| CT-CM-12 | Tirar marca | Clique direito duas vezes em 3-3 | `oculta`; contador 40 | `marcas.spec.js` |
| CT-CM-13 | Marca protege | Marcar a bomba 6-0 e clicar com o esquerdo | Continua `marcada`; `aviso` vazio | `marcas.spec.js` |
| CT-CM-14 | Limite de 40 marcas | Marcar 40 casas e tentar a 41ª (13-17) | 41ª fica `oculta`; contador 0; 40 `marcada` | `marcas.spec.js` |
| CT-CM-15 | Cascata não abre marca | Marcar 2-2 (segura) e clicar 0-0 | `2-2` continua `marcada`; 107 `aberta`; contador 39 | `marcas.spec.js` |
| CT-CM-16 | Abertura rápida | Abrir 5-0 (vale 2), marcar 6-0 e 6-1, clique duplo em 5-0 | 4-0, 4-1 e 5-1 viram `aberta`; sem derrota | `marcas.spec.js` |
| CT-CM-17 | Abertura rápida com marcas a menos | Abrir 5-0, marcar só 6-0, clique duplo | 4-0, 4-1 e 5-1 continuam `oculta` | `marcas.spec.js` |
| CT-CM-18 | Abertura rápida com marca errada | Abrir 5-0, marcar 6-0 (certa) e 4-1 (errada), clique duplo | `6-1` = `bomba-detonada`; `aviso` de derrota; `4-1` = `marca-errada` | `marcas.spec.js` |
| CT-CM-19 | Modo marcação | Ligar o modo; clique esquerdo em 3-3 duas vezes | `marcada` + contador 39; depois `oculta` + contador 40 | `marcas.spec.js` |
| CT-CM-20 | Modo marcação sobre bomba | Ligar, clicar em 7-0 (bomba); desligar; clicar 0-0 | 7-0 `marcada`, sem derrota; 0-0 abre | `marcas.spec.js` |
| CT-CM-21 | Derrota | Cenário fixo; clicar 6-0; depois clicar 0-0 | `6-0` = `bomba-detonada`; 39 `bomba`; `aviso` de derrota; 0-0 continua `oculta` | `fim-de-jogo.spec.js` |
| CT-CM-22 | Tempo para na derrota | Relógio falso: abrir 5-4, +3 s, clicar bomba 6-4, +5 s | `tempo` fica parado em um valor ≥ 2 | `fim-de-jogo.spec.js` |
| CT-CM-23 | Marcas na derrota | Marcar 0-0 (errada) e 7-0 (certa); clicar a bomba 6-5 | `0-0` = `marca-errada`; `7-0` continua `marcada` | `fim-de-jogo.spec.js` |
| CT-CM-24 | 40 bombas no modo aleatório | Sem parâmetros; clicar em sequência até perder | `bomba` + `bomba-detonada` = 40 | `fim-de-jogo.spec.js` |
| CT-CM-25 | Vitória | Cenário fixo; clicar 0-0 e 11-0 | 212 `aberta`; 40 `marcada`; `aviso` de vitória; contador 0; tempo parado | `fim-de-jogo.spec.js` |
| CT-CM-26 | Marcas não dão vitória | Cenário fixo; marcar as 40 bombas | Sem `aviso`; contador 0; 212 casas continuam `oculta` | `fim-de-jogo.spec.js` |
| CT-CM-27 | Recomeçar | Jogar um pouco e clicar `btn-recomecar` | 252 `oculta`; contador 40; tempo 0; `aviso` vazio | `fim-de-jogo.spec.js` |

## 5. Definição de pronto

- [x] Todos os casos da seção 4 têm teste em `tests/`, com o ID no título
- [x] Nenhum código do jogo em `js/` (só o `main.js` vazio)
- [x] `npm run verificar:completo` sem problemas (todos os testes falham pelo motivo certo)
- [x] README com autor, como rodar e a tabela de casos
- [x] Repositório com o nome exato `desafio_teste_campo_minado`
