// Distribuição e quem começa (CT-DM-01 a 05). O jogo não existe: estes testes falham de propósito.
import { abrirJogo, abrirCenario, screen, pedra, jogar, mesa, codigosDa, pedrasDa, vez, estoque } from './helpers.js';

test('CT-DM-01 nova partida: 7 peças para cada jogador, 14 no monte e mesa vazia', async () => {
  const user = await abrirJogo();
  await user.click(screen.getByTestId('btn-nova-partida'));
  expect(pedrasDa(1)).toHaveLength(7);
  expect(pedrasDa(2)).toHaveLength(7);
  expect(estoque()).toHaveTextContent(/^14$/);
  expect(mesa()).toHaveLength(0);
});

test('CT-DM-02 as 14 peças das duas mãos são diferentes entre si e válidas (0-0 a 6-6)', async () => {
  for (let i = 0; i < 10; i++) {
    const user = await abrirJogo();
    await user.click(screen.getByTestId('btn-nova-partida'));
    const todas = [...codigosDa(1), ...codigosDa(2)];
    expect(new Set(todas).size).toBe(14);
    for (const codigo of todas) {
      const [a, b] = codigo.split('-').map(Number);
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(b);
      expect(b).toBeLessThanOrEqual(6);
    }
  }
});

test('CT-DM-03 só a mão do jogador da vez fica virada para cima', async () => {
  const user = await abrirCenario('BASICO');
  expect(vez()).toHaveTextContent('Jogador 1');
  for (const p of pedrasDa(1)) expect(p).toHaveAttribute('data-face', 'cima');
  for (const p of pedrasDa(2)) expect(p).toHaveAttribute('data-face', 'baixo');
  await jogar(user, '6-6');
  for (const p of pedrasDa(1)) expect(p).toHaveAttribute('data-face', 'baixo');
  for (const p of pedrasDa(2)) expect(p).toHaveAttribute('data-face', 'cima');
});

test('CT-DM-04 começa quem tem a maior dupla, e só ela pode ser jogada', async () => {
  await abrirCenario('DUAS_DUPLAS');
  expect(vez()).toHaveTextContent('Jogador 1');
  expect(pedra('5-5')).toBeEnabled();
  expect(pedra('1-2')).toBeDisabled();
  expect(pedra('0-3')).toBeDisabled();
});

test('CT-DM-05 sem duplas, começa quem tem a peça de maior soma, e só ela pode ser jogada', async () => {
  await abrirCenario('SEM_DUPLA');
  expect(vez()).toHaveTextContent('Jogador 2'); // 5-6 soma 11; a maior do J1 é 4-6 (10)
  expect(pedra('5-6')).toBeEnabled();
  expect(pedra('0-1')).toBeDisabled();
  expect(pedra('2-3')).toBeDisabled();
});
