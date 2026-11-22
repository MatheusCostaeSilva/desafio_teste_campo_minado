// Jogar peças, extremos e escolha de lado (CT-DM-06 a 13).
import { abrirCenario, screen, pedra, jogar, mesa, extremos, vez, aviso } from './helpers.js';

test('CT-DM-06 a primeira peça vai para a mesa e define os dois extremos', async () => {
  const user = await abrirCenario('BASICO');
  await jogar(user, '6-6');
  expect(mesa()).toEqual(['6-6']);
  expect(extremos()).toEqual(['6', '6']);
  expect(screen.queryByTestId('pedra-6-6')).toBeNull(); // saiu da mão
});

test('CT-DM-07 a peça gira sozinha para encaixar e o extremo muda', async () => {
  const user = await abrirCenario('BASICO');
  await jogar(user, '6-6');
  await jogar(user, '3-6'); // o 6 encosta no 6 da mesa; o 3 fica para fora
  expect(mesa()).toEqual(['6-6', '6-3']);
  expect(extremos()).toEqual(['6', '3']);
});

test('CT-DM-08 com os dois extremos iguais a peça entra à direita, sem perguntar o lado', async () => {
  const user = await abrirCenario('BASICO');
  await jogar(user, '6-6');
  await jogar(user, '1-6');
  expect(mesa()).toEqual(['6-6', '6-1']);
  expect(extremos()).toEqual(['6', '1']);
  expect(screen.queryByTestId('btn-lado-esq')).toBeNull();
});

test('CT-DM-09 peça que encaixa nas duas pontas pergunta o lado e espera a resposta', async () => {
  const user = await abrirCenario('LADOS');
  await jogar(user, '6-6');
  await jogar(user, '3-6');
  await jogar(user, '1-3'); // pontas 6 | 1
  await jogar(user, '1-6'); // encaixa nos dois lados
  expect(screen.getByTestId('btn-lado-esq')).toBeVisible();
  expect(screen.getByTestId('btn-lado-dir')).toBeVisible();
  expect(mesa()).toEqual(['6-6', '6-3', '3-1']); // nada mudou ainda
  expect(vez()).toHaveTextContent('Jogador 2');
});

test('CT-DM-10 escolher a esquerda encaixa a peça no começo da mesa', async () => {
  const user = await abrirCenario('LADOS');
  await jogar(user, '6-6');
  await jogar(user, '3-6');
  await jogar(user, '1-3');
  await jogar(user, '1-6');
  await user.click(screen.getByTestId('btn-lado-esq'));
  expect(mesa()).toEqual(['1-6', '6-6', '6-3', '3-1']);
  expect(extremos()).toEqual(['1', '1']);
  expect(screen.queryByTestId('btn-lado-esq')).toBeNull();
  expect(vez()).toHaveTextContent('Jogador 1');
});

test('CT-DM-11 escolher a direita encaixa a peça no fim da mesa', async () => {
  const user = await abrirCenario('LADOS');
  await jogar(user, '6-6');
  await jogar(user, '3-6');
  await jogar(user, '1-3');
  await jogar(user, '1-6');
  await user.click(screen.getByTestId('btn-lado-dir'));
  expect(mesa()).toEqual(['6-6', '6-3', '3-1', '1-6']);
  expect(extremos()).toEqual(['6', '6']);
});

test('CT-DM-12 peça sem encaixe fica desabilitada e clicar nela não muda nada', async () => {
  const user = await abrirCenario('BASICO');
  await jogar(user, '6-6');
  expect(pedra('2-2')).toBeDisabled();
  await user.click(pedra('2-2'));
  expect(mesa()).toEqual(['6-6']);
  expect(vez()).toHaveTextContent('Jogador 2');
  expect(pedra('2-2')).toBeInTheDocument();
});

test('CT-DM-13 a vez alterna depois de cada jogada', async () => {
  const user = await abrirCenario('BASICO');
  expect(vez()).toHaveTextContent('Jogador 1');
  await jogar(user, '6-6');
  expect(vez()).toHaveTextContent('Jogador 2');
  await jogar(user, '3-6');
  expect(vez()).toHaveTextContent('Jogador 1');
  await jogar(user, '1-3');
  expect(vez()).toHaveTextContent('Jogador 2');
});
