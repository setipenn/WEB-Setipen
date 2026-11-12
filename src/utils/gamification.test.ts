import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScore,
  xpForLevel,
  getLevelFromXp,
  isAnswerCorrect,
  cleanAnswer,
  calculateSrsReview,
} from './gamification';

test('calculateScore awards speed bonus under 3 seconds', () => {
  const result = calculateScore(10, 20, 2, 1);
  assert.equal(result.baseXp, 10);
  assert.equal(result.speedBonus, 10);
  assert.equal(result.totalXp, 20);
});

test('calculateScore applies streak multipliers correctly', () => {
  const normal = calculateScore(10, 20, 10, 1);
  const streakFive = calculateScore(10, 20, 10, 5);
  const streakTen = calculateScore(10, 20, 10, 10);

  assert.ok(streakFive.totalXp > normal.totalXp, 'Streak 5 should award more XP than streak 1');
  assert.equal(streakTen.streakMultiplier, 2.0);
});

test('getLevelFromXp correctly maps XP to Level and Rank Titles', () => {
  const level1 = getLevelFromXp(0);
  assert.equal(level1.level, 1);
  assert.equal(level1.rankTitleId, 'Pemula Kejuruan');

  const level6 = getLevelFromXp(xpForLevel(6) + 10);
  assert.equal(level6.level, 6);
  assert.equal(level6.rankTitleId, 'Penjelajah Kosakata');

  const level25 = getLevelFromXp(xpForLevel(25));
  assert.equal(level25.level, 25);
  assert.equal(level25.rankTitleId, 'Pendekar Bahasa');

  const level50 = getLevelFromXp(999999);
  assert.equal(level50.level, 50);
  assert.equal(level50.rankTitleId, 'Legenda Kata SMK');
});

test('isAnswerCorrect handles case insensitivity, punctuation and alternatives', () => {
  assert.equal(isAnswerCorrect('router', 'Router'), true);
  assert.equal(isAnswerCorrect('  LAN Cable! ', 'lan cable'), true);
  assert.equal(isAnswerCorrect('screen', 'monitor / screen / display'), true);
  assert.equal(isAnswerCorrect('completely wrong', 'correct'), false);
});

test('cleanAnswer strips punctuation and trims excess spaces', () => {
  assert.equal(cleanAnswer('  Motherboard, CPU!! '), 'motherboard cpu');
});

test('calculateSrsReview increments on correct answer and resets on fail', () => {
  const pass1 = calculateSrsReview(true, 0, 2.5);
  assert.equal(pass1.repetitions, 1);
  assert.equal(pass1.nextIntervalDays, 1);

  const pass2 = calculateSrsReview(true, 1, 2.6);
  assert.equal(pass2.repetitions, 2);
  assert.equal(pass2.nextIntervalDays, 3);

  const fail = calculateSrsReview(false, 3, 2.7);
  assert.equal(fail.repetitions, 0);
  assert.equal(fail.nextIntervalDays, 1);
  assert.ok(fail.easeFactor < 2.7);
});
